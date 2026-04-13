import { useState, useEffect, useCallback } from 'react';
import { sendPushNotification } from '@/utils/sendPushNotification';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc, 
  serverTimestamp,
  getDocs,
  increment,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { AgentTask, AgentWallet, TaskCompletionHistory, AgentTaskFormData } from '@/types/agent-tasks';

export const useAgentTasks = (agentEmail?: string, isAdmin: boolean = false) => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [wallet, setWallet] = useState<AgentWallet | null>(null);
  const [taskHistory, setTaskHistory] = useState<TaskCompletionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [allAgents, setAllAgents] = useState<any[]>([]);

  // Fetch tasks for agent or all tasks for admin
  useEffect(() => {
    if (!agentEmail && !isAdmin) {
      setLoading(false);
      return;
    }

    const tasksRef = collection(db, 'agent_tasks');
    let q;

    if (isAdmin) {
      // Admin sees all tasks
      q = query(tasksRef, orderBy('createdAt', 'desc'));
    } else {
      // Agent sees only their tasks
      q = query(
        tasksRef, 
        where('assignedTo', '==', agentEmail),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate(),
        completedAt: doc.data().completedAt?.toDate(),
        verifiedAt: doc.data().verifiedAt?.toDate(),
        dueDate: doc.data().dueDate?.toDate()
      })) as AgentTask[];
      
      setTasks(tasksData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tasks',
        variant: 'destructive'
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [agentEmail, isAdmin, toast]);

  // Fetch wallet for agent
  useEffect(() => {
    if (!agentEmail) return;

    const walletRef = doc(db, 'agent_wallets', agentEmail);
    
    const unsubscribe = onSnapshot(walletRef, (doc) => {
      if (doc.exists()) {
        setWallet({
          id: doc.id,
          ...doc.data(),
          lastUpdated: doc.data().lastUpdated?.toDate() || new Date()
        } as AgentWallet);
      } else {
        // Create wallet if doesn't exist
        setWallet({
          id: agentEmail,
          agentEmail,
          agentName: '',
          balance: 0,
          totalEarned: 0,
          totalSpent: 0,
          lastUpdated: new Date()
        });
      }
    });

    return () => unsubscribe();
  }, [agentEmail]);

  // Fetch task completion history
  useEffect(() => {
    if (!agentEmail && !isAdmin) return;

    const historyRef = collection(db, 'task_completion_history');
    let q;

    if (isAdmin) {
      q = query(historyRef, orderBy('completedAt', 'desc'));
    } else {
      q = query(
        historyRef,
        where('agentEmail', '==', agentEmail),
        orderBy('completedAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const historyData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        completedAt: doc.data().completedAt?.toDate() || new Date(),
        verifiedAt: doc.data().verifiedAt?.toDate()
      })) as TaskCompletionHistory[];
      
      setTaskHistory(historyData);
    });

    return () => unsubscribe();
  }, [agentEmail, isAdmin]);

  // Fetch all agents for admin task assignment
  useEffect(() => {
    if (!isAdmin) return;

    const agentsRef = collection(db, 'agents');
    const q = query(agentsRef, orderBy('name', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const agentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAllAgents(agentsData);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  // Create a new task (Admin only)
  const createTask = useCallback(async (taskData: AgentTaskFormData, createdBy: string) => {
    try {
      const agent = allAgents.find(a => a.email === taskData.assignedTo);
      
      await addDoc(collection(db, 'agent_tasks'), {
        ...taskData,
        assignedAgentName: agent?.name || 'Unknown Agent',
        status: 'pending',
        createdAt: serverTimestamp(),
        createdBy,
        updatedAt: serverTimestamp()
      });

      // Send push notification to assigned agent
      sendPushNotification('new_agent_task', {
        agentEmail: taskData.assignedTo,
        title: taskData.title || 'New Task',
        agentName: agent?.name || 'Agent'
      });

      toast({
        title: 'Task Created',
        description: `Task assigned to ${agent?.name || taskData.assignedTo}`,
      });

      return true;
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to create task',
        variant: 'destructive'
      });
      return false;
    }
  }, [allAgents, toast]);

  // Mark task as completed (Agent)
  const completeTask = useCallback(async (taskId: string) => {
    try {
      const taskRef = doc(db, 'agent_tasks', taskId);
      const taskSnap = await getDoc(taskRef);
      
      if (!taskSnap.exists()) {
        throw new Error('Task not found');
      }

      const taskData = taskSnap.data();

      // Update task status
      await updateDoc(taskRef, {
        status: 'completed',
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Credit points to wallet
      const walletRef = doc(db, 'agent_wallets', taskData.assignedTo);
      const walletSnap = await getDoc(walletRef);

      if (walletSnap.exists()) {
        await updateDoc(walletRef, {
          balance: increment(taskData.points),
          totalEarned: increment(taskData.points),
          lastUpdated: serverTimestamp()
        });
      } else {
        // Create wallet if doesn't exist
        await setDoc(walletRef, {
          agentEmail: taskData.assignedTo,
          agentName: taskData.assignedAgentName || '',
          balance: taskData.points,
          totalEarned: taskData.points,
          totalSpent: 0,
          lastUpdated: serverTimestamp()
        });
      }

      // Add to completion history
      await addDoc(collection(db, 'task_completion_history'), {
        taskId,
        taskTitle: taskData.title,
        agentEmail: taskData.assignedTo,
        pointsEarned: taskData.points,
        completedAt: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Error completing task:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete task',
        variant: 'destructive'
      });
      return false;
    }
  }, [toast]);

  // Delete task (Admin only)
  const deleteTask = useCallback(async (taskId: string) => {
    try {
      await deleteDoc(doc(db, 'agent_tasks', taskId));
      toast({
        title: 'Task Deleted',
        description: 'Task has been removed successfully',
      });
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete task',
        variant: 'destructive'
      });
      return false;
    }
  }, [toast]);

  // Update task status (Admin)
  const updateTaskStatus = useCallback(async (taskId: string, status: AgentTask['status']) => {
    try {
      await updateDoc(doc(db, 'agent_tasks', taskId), {
        status,
        updatedAt: serverTimestamp(),
        ...(status === 'verified' ? { verifiedAt: serverTimestamp() } : {})
      });
      
      toast({
        title: 'Status Updated',
        description: `Task marked as ${status}`,
      });
      return true;
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task status',
        variant: 'destructive'
      });
      return false;
    }
  }, [toast]);

  // Clear agent history and reset points (Admin only)
  const clearAgentHistory = useCallback(async (agentEmail: string) => {
    try {
      // 1. Delete all task completion history for this agent
      const historyRef = collection(db, 'task_completion_history');
      const historyQuery = query(historyRef, where('agentEmail', '==', agentEmail));
      const historySnapshot = await getDocs(historyQuery);
      
      const deleteHistoryPromises = historySnapshot.docs.map(docSnap => 
        deleteDoc(doc(db, 'task_completion_history', docSnap.id))
      );
      await Promise.all(deleteHistoryPromises);

      // 2. Delete all completed/verified tasks for this agent
      const tasksRef = collection(db, 'agent_tasks');
      const completedTasksQuery = query(
        tasksRef, 
        where('assignedTo', '==', agentEmail),
        where('status', 'in', ['completed', 'verified'])
      );
      const tasksSnapshot = await getDocs(completedTasksQuery);
      
      const deleteTasksPromises = tasksSnapshot.docs.map(docSnap => 
        deleteDoc(doc(db, 'agent_tasks', docSnap.id))
      );
      await Promise.all(deleteTasksPromises);

      // 3. Reset wallet balance and totalEarned
      const walletRef = doc(db, 'agent_wallets', agentEmail);
      const walletSnap = await getDoc(walletRef);
      
      if (walletSnap.exists()) {
        await updateDoc(walletRef, {
          balance: 0,
          totalEarned: 0,
          lastUpdated: serverTimestamp()
        });
      }

      toast({
        title: 'History Cleared',
        description: `Task history and points reset for ${agentEmail}`,
      });
      return true;
    } catch (error) {
      console.error('Error clearing agent history:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear agent history',
        variant: 'destructive'
      });
      return false;
    }
  }, [toast]);

  // Clear all agents history (Admin only)
  const clearAllAgentsHistory = useCallback(async () => {
    try {
      // 1. Delete all task completion history
      const historyRef = collection(db, 'task_completion_history');
      const historySnapshot = await getDocs(historyRef);
      
      const deleteHistoryPromises = historySnapshot.docs.map(docSnap => 
        deleteDoc(doc(db, 'task_completion_history', docSnap.id))
      );
      await Promise.all(deleteHistoryPromises);

      // 2. Delete all completed/verified tasks
      const tasksRef = collection(db, 'agent_tasks');
      const completedTasksQuery = query(
        tasksRef, 
        where('status', 'in', ['completed', 'verified'])
      );
      const tasksSnapshot = await getDocs(completedTasksQuery);
      
      const deleteTasksPromises = tasksSnapshot.docs.map(docSnap => 
        deleteDoc(doc(db, 'agent_tasks', docSnap.id))
      );
      await Promise.all(deleteTasksPromises);

      // 3. Reset all wallets
      const walletsRef = collection(db, 'agent_wallets');
      const walletsSnapshot = await getDocs(walletsRef);
      
      const resetWalletPromises = walletsSnapshot.docs.map(docSnap => 
        updateDoc(doc(db, 'agent_wallets', docSnap.id), {
          balance: 0,
          totalEarned: 0,
          lastUpdated: serverTimestamp()
        })
      );
      await Promise.all(resetWalletPromises);

      toast({
        title: 'All History Cleared',
        description: 'Task history and points reset for all agents',
      });
      return true;
    } catch (error) {
      console.error('Error clearing all history:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear all history',
        variant: 'destructive'
      });
      return false;
    }
  }, [toast]);

  // Get pending tasks count for an agent
  const getPendingTasksCount = useCallback(() => {
    return tasks.filter(t => t.status === 'pending' || t.status === 'in-progress').length;
  }, [tasks]);

  // Get completed tasks count
  const getCompletedTasksCount = useCallback(() => {
    return tasks.filter(t => t.status === 'completed' || t.status === 'verified').length;
  }, [tasks]);

  // Get today's tasks
  const getTodaysTasks = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return tasks.filter(t => {
      const taskDate = new Date(t.createdAt);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === today.getTime();
    });
  }, [tasks]);

  return {
    tasks,
    wallet,
    taskHistory,
    loading,
    allAgents,
    createTask,
    completeTask,
    deleteTask,
    updateTaskStatus,
    clearAgentHistory,
    clearAllAgentsHistory,
    getPendingTasksCount,
    getCompletedTasksCount,
    getTodaysTasks
  };
};

export default useAgentTasks;
