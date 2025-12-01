import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Send, 
  Trash2, 
  Users, 
  ClipboardList,
  Star,
  Trophy,
  Wallet,
  Clock,
  CheckCircle2,
  XCircle,
  Filter,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAgentTasks } from '@/hooks/useAgentTasks';
import { AgentTaskFormData } from '@/types/agent-tasks';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface AgentTaskManagementTabProps {
  user: any;
}

const AgentTaskManagementTab: React.FC<AgentTaskManagementTabProps> = ({ user }) => {
  const { 
    tasks, 
    allAgents, 
    taskHistory, 
    loading, 
    createTask, 
    deleteTask, 
    updateTaskStatus,
    clearAgentHistory,
    clearAllAgentsHistory
  } = useAgentTasks(undefined, true);

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showClearHistoryModal, setShowClearHistoryModal] = useState(false);
  const [selectedAgentToClear, setSelectedAgentToClear] = useState<string>('all');
  const [clearing, setClearing] = useState(false);
  const [taskFormData, setTaskFormData] = useState<AgentTaskFormData>({
    title: '',
    description: '',
    points: 10,
    assignedTo: '',
    priority: 'medium',
    notes: ''
  });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [agentFilter, setAgentFilter] = useState<string>('all');
  const [submitting, setSubmitting] = useState(false);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskFormData.assignedTo) {
      alert('Please select an agent to assign the task');
      return;
    }
    
    setSubmitting(true);
    const success = await createTask(taskFormData, user?.email || 'admin');
    
    if (success) {
      setShowTaskForm(false);
      setTaskFormData({
        title: '',
        description: '',
        points: 10,
        assignedTo: '',
        priority: 'medium',
        notes: ''
      });
    }
    setSubmitting(false);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(taskId);
    }
  };

  const handleClearHistory = async () => {
    setClearing(true);
    try {
      if (selectedAgentToClear === 'all') {
        await clearAllAgentsHistory();
      } else {
        await clearAgentHistory(selectedAgentToClear);
      }
      setShowClearHistoryModal(false);
      setSelectedAgentToClear('all');
    } finally {
      setClearing(false);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const statusMatch = statusFilter === 'all' || task.status === statusFilter;
    const agentMatch = agentFilter === 'all' || task.assignedTo === agentFilter;
    return statusMatch && agentMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-travel-teal/10 text-travel-teal border-travel-teal/20';
      case 'verified':
        return 'bg-travel-orange/10 text-travel-orange border-travel-orange/20';
      case 'in-progress':
        return 'bg-travel-blue-medium/10 text-travel-blue-medium border-travel-blue-medium/20';
      default:
        return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-travel-orange/10 text-travel-orange';
      case 'low':
        return 'bg-travel-teal/10 text-travel-teal';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate agent wallet balances from task history
  const getAgentStats = () => {
    const stats: Record<string, { totalEarned: number; completedTasks: number }> = {};
    taskHistory.forEach(h => {
      if (!stats[h.agentEmail]) {
        stats[h.agentEmail] = { totalEarned: 0, completedTasks: 0 };
      }
      stats[h.agentEmail].totalEarned += h.pointsEarned;
      stats[h.agentEmail].completedTasks += 1;
    });
    return stats;
  };

  const agentStats = getAgentStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 sm:py-20">
        <div className="h-8 w-8 sm:h-10 sm:w-10 animate-spin rounded-full border-4 border-travel-blue-dark border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-travel-blue-dark flex items-center gap-1.5 sm:gap-2">
            <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 text-travel-blue-medium" />
            Agent Task Management
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">Assign tasks and manage agent rewards</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setShowClearHistoryModal(true)}
            size="sm"
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50 text-xs sm:text-sm h-8 sm:h-10"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Clear History
          </Button>
          <Button 
            onClick={() => setShowTaskForm(true)}
            size="sm"
            className="bg-gradient-to-r from-travel-blue-dark to-travel-blue-medium hover:from-travel-blue-medium hover:to-travel-blue-dark text-xs sm:text-sm h-8 sm:h-10"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Assign New Task
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <Card className="border-travel-blue-dark/20">
          <CardContent className="p-2.5 sm:p-4 text-center">
            <ClipboardList className="w-5 h-5 sm:w-8 sm:h-8 text-travel-blue-dark mx-auto mb-1 sm:mb-2" />
            <p className="text-[10px] sm:text-sm text-gray-500">Total Tasks</p>
            <p className="text-lg sm:text-2xl font-bold text-travel-blue-dark">{tasks.length}</p>
          </CardContent>
        </Card>
        
        <Card className="border-travel-orange/20">
          <CardContent className="p-2.5 sm:p-4 text-center">
            <Clock className="w-5 h-5 sm:w-8 sm:h-8 text-travel-orange mx-auto mb-1 sm:mb-2" />
            <p className="text-[10px] sm:text-sm text-gray-500">Pending</p>
            <p className="text-lg sm:text-2xl font-bold text-travel-orange">
              {tasks.filter(t => t.status === 'pending').length}
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-travel-teal/20">
          <CardContent className="p-2.5 sm:p-4 text-center">
            <CheckCircle2 className="w-5 h-5 sm:w-8 sm:h-8 text-travel-teal mx-auto mb-1 sm:mb-2" />
            <p className="text-[10px] sm:text-sm text-gray-500">Completed</p>
            <p className="text-lg sm:text-2xl font-bold text-travel-teal">
              {tasks.filter(t => t.status === 'completed' || t.status === 'verified').length}
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-amber-100">
          <CardContent className="p-2.5 sm:p-4 text-center">
            <Star className="w-5 h-5 sm:w-8 sm:h-8 text-amber-600 mx-auto mb-1 sm:mb-2" />
            <p className="text-[10px] sm:text-sm text-gray-500">Points</p>
            <p className="text-lg sm:text-2xl font-bold text-amber-700">
              {taskHistory.reduce((sum, h) => sum + h.pointsEarned, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Agent Wallet Summary */}
      <Card className="border-travel-blue-dark/20">
        <CardHeader className="bg-gradient-to-r from-travel-blue-dark to-travel-blue-medium text-white rounded-t-lg py-2.5 sm:py-4 px-3 sm:px-6">
          <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
            <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
            Agent Points Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2.5 sm:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
            {allAgents.map(agent => {
              const stats = agentStats[agent.email] || { totalEarned: 0, completedTasks: 0 };
              const pendingTasks = tasks.filter(t => t.assignedTo === agent.email && t.status === 'pending').length;
              
              return (
                <div 
                  key={agent.id} 
                  className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg sm:rounded-xl p-2.5 sm:p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="w-7 h-7 sm:w-10 sm:h-10 bg-gradient-to-br from-travel-blue-dark to-travel-blue-medium rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                        {agent.name?.charAt(0)?.toUpperCase() || 'A'}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-xs sm:text-sm">{agent.name}</h4>
                        <p className="text-[10px] sm:text-xs text-gray-500 truncate max-w-[100px] sm:max-w-none">{agent.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center">
                    <div className="bg-travel-orange/10 rounded p-1 sm:p-2">
                      <p className="text-sm sm:text-lg font-bold text-travel-orange">{stats.totalEarned}</p>
                      <p className="text-[9px] sm:text-xs text-travel-orange">Points</p>
                    </div>
                    <div className="bg-travel-teal/10 rounded p-1 sm:p-2">
                      <p className="text-sm sm:text-lg font-bold text-travel-teal">{stats.completedTasks}</p>
                      <p className="text-[9px] sm:text-xs text-travel-teal">Done</p>
                    </div>
                    <div className="bg-orange-50 rounded p-1 sm:p-2">
                      <p className="text-sm sm:text-lg font-bold text-orange-700">{pendingTasks}</p>
                      <p className="text-[9px] sm:text-xs text-orange-600">Pending</p>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {allAgents.length === 0 && (
              <div className="col-span-full text-center py-4 sm:py-8 text-gray-500">
                <Users className="w-8 h-8 sm:w-12 sm:h-12 mx-auto text-gray-300 mb-1 sm:mb-2" />
                <p className="text-xs sm:text-sm">No agents found. Add agents first to assign tasks.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 sm:gap-4 items-center bg-white p-2 sm:p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-1 sm:gap-2">
          <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
          <span className="text-xs sm:text-sm font-medium text-gray-700">Filters:</span>
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg text-xs sm:text-sm bg-white"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="verified">Verified</option>
        </select>
        
        <select
          value={agentFilter}
          onChange={(e) => setAgentFilter(e.target.value)}
          className="px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg text-xs sm:text-sm bg-white"
        >
          <option value="all">All Agents</option>
          {allAgents.map(agent => (
            <option key={agent.id} value={agent.email}>
              {agent.name}
            </option>
          ))}
        </select>
        
        <Badge className="bg-travel-blue-dark/10 text-travel-blue-dark text-[10px] sm:text-xs">
          {filteredTasks.length} of {tasks.length}
        </Badge>
      </div>

      {/* Tasks List */}
      <Card className="border-travel-blue-dark/20">
        <CardHeader className="py-2.5 sm:py-4 px-3 sm:px-6">
          <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base text-travel-blue-dark">
            <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5 text-travel-blue-medium" />
            All Tasks
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2.5 sm:p-4">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-6 sm:py-10 text-gray-500">
              <ClipboardList className="w-8 h-8 sm:w-12 sm:h-12 mx-auto text-gray-300 mb-2 sm:mb-3" />
              <p className="font-medium text-xs sm:text-sm">No tasks found</p>
              <p className="text-[10px] sm:text-sm mt-0.5 sm:mt-1">Create a new task to get started</p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white border rounded-lg sm:rounded-xl p-2.5 sm:p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col gap-2 sm:gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                          <h3 className="font-semibold text-gray-900 text-xs sm:text-base">{task.title}</h3>
                          <Badge className={`${getStatusColor(task.status)} text-[10px] sm:text-xs`}>
                            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                          </Badge>
                          {task.priority && (
                            <Badge className={`${getPriorityColor(task.priority)} text-[10px] sm:text-xs`}>
                              {task.priority.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-[10px] sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2">{task.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[9px] sm:text-xs text-gray-500">
                          <span className="flex items-center gap-0.5 sm:gap-1">
                            <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            <strong className="truncate max-w-[80px] sm:max-w-none">{task.assignedAgentName || task.assignedTo}</strong>
                          </span>
                          <span className="flex items-center gap-0.5 sm:gap-1">
                            <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            {format(task.createdAt, 'dd MMM')}
                          </span>
                          {task.completedAt && (
                            <span className="flex items-center gap-0.5 sm:gap-1 text-travel-teal">
                              <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              Done: {format(task.completedAt, 'dd MMM')}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 pt-2 border-t sm:border-t-0 sm:pt-0">
                        <div className="text-center bg-travel-orange/10 px-2 sm:px-4 py-1 sm:py-2 rounded-lg border border-travel-orange/20">
                          <Star className="w-3 h-3 sm:w-5 sm:h-5 text-travel-orange mx-auto" />
                          <p className="text-sm sm:text-lg font-bold text-travel-orange">{task.points}</p>
                          <p className="text-[9px] sm:text-xs text-travel-orange">Points</p>
                        </div>
                        
                        <div className="flex items-center gap-1 sm:gap-2">
                          {task.status === 'completed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateTaskStatus(task.id, 'verified')}
                              className="border-travel-teal/30 text-travel-teal hover:bg-travel-teal/10 text-[10px] sm:text-xs h-7 sm:h-9 px-2 sm:px-3"
                            >
                              <Trophy className="w-3 h-3 sm:w-4 sm:h-4 mr-0.5 sm:mr-1" />
                              Verify
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-red-600 hover:bg-red-50 h-7 sm:h-9 px-2 sm:px-3"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task Completion History */}
      <Card className="border-travel-teal/20">
        <CardHeader className="bg-gradient-to-r from-travel-teal to-teal-600 text-white rounded-t-lg py-2.5 sm:py-4 px-3 sm:px-6">
          <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
            Task Completion History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-4">
          {taskHistory.length === 0 ? (
            <div className="text-center py-4 sm:py-8 text-gray-500">
              <Trophy className="w-8 h-8 sm:w-12 sm:h-12 mx-auto text-gray-300 mb-1 sm:mb-2" />
              <p className="text-xs sm:text-sm">No completed tasks yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <table className="w-full text-[10px] sm:text-sm min-w-[400px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2 sm:py-3 sm:px-4 font-medium text-gray-600">Task</th>
                    <th className="text-left py-2 px-2 sm:py-3 sm:px-4 font-medium text-gray-600">Agent</th>
                    <th className="text-center py-2 px-2 sm:py-3 sm:px-4 font-medium text-gray-600">Points</th>
                    <th className="text-left py-2 px-2 sm:py-3 sm:px-4 font-medium text-gray-600">Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {taskHistory.slice(0, 20).map((history) => (
                    <tr key={history.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2 sm:py-3 sm:px-4 max-w-[120px] sm:max-w-none truncate">{history.taskTitle}</td>
                      <td className="py-2 px-2 sm:py-3 sm:px-4 max-w-[100px] sm:max-w-none truncate">{history.agentEmail}</td>
                      <td className="py-2 px-2 sm:py-3 sm:px-4 text-center">
                        <Badge className="bg-travel-orange/10 text-travel-orange text-[9px] sm:text-xs">
                          +{history.pointsEarned}
                        </Badge>
                      </td>
                      <td className="py-2 px-2 sm:py-3 sm:px-4 text-gray-500 whitespace-nowrap">
                        {format(history.completedAt, 'dd MMM')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Task Modal */}
      <Dialog open={showTaskForm} onOpenChange={setShowTaskForm}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base text-travel-blue-dark">
              <Send className="w-4 h-4 sm:w-5 sm:h-5 text-travel-blue-medium" />
              Assign New Task to Agent
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleCreateTask} className="space-y-3 sm:space-y-4">
            <div>
              <Label htmlFor="assignedTo" className="text-xs sm:text-sm">Select Agent *</Label>
              <select
                id="assignedTo"
                value={taskFormData.assignedTo}
                onChange={(e) => setTaskFormData({ ...taskFormData, assignedTo: e.target.value })}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg mt-1 text-xs sm:text-sm"
                required
              >
                <option value="">-- Select an Agent --</option>
                {allAgents.map(agent => (
                  <option key={agent.id} value={agent.email}>
                    {agent.name} ({agent.email})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <Label htmlFor="title" className="text-xs sm:text-sm">Task Title *</Label>
              <Input
                id="title"
                value={taskFormData.title}
                onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                placeholder="e.g., Book 5 Tatkal tickets today"
                className="text-xs sm:text-sm h-8 sm:h-10"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description" className="text-xs sm:text-sm">Task Description *</Label>
              <Textarea
                id="description"
                value={taskFormData.description}
                onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                placeholder="Detailed description of the task..."
                rows={2}
                className="text-xs sm:text-sm"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <div>
                <Label htmlFor="points" className="text-xs sm:text-sm">Points to Earn *</Label>
                <Input
                  id="points"
                  type="number"
                  min="1"
                  max="1000"
                  value={taskFormData.points}
                  onChange={(e) => setTaskFormData({ ...taskFormData, points: parseInt(e.target.value) || 0 })}
                  className="text-xs sm:text-sm h-8 sm:h-10"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="priority" className="text-xs sm:text-sm">Priority</Label>
                <select
                  id="priority"
                  value={taskFormData.priority}
                  onChange={(e) => setTaskFormData({ ...taskFormData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg mt-1 text-xs sm:text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="notes" className="text-xs sm:text-sm">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={taskFormData.notes}
                onChange={(e) => setTaskFormData({ ...taskFormData, notes: e.target.value })}
                placeholder="Any additional instructions..."
                rows={2}
                className="text-xs sm:text-sm"
              />
            </div>
            
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setShowTaskForm(false)} size="sm" className="text-xs sm:text-sm">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={submitting}
                size="sm"
                className="bg-gradient-to-r from-travel-blue-dark to-travel-blue-medium text-xs sm:text-sm"
              >
                {submitting ? (
                  <span className="flex items-center gap-1.5 sm:gap-2">
                    <div className="h-3 w-3 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></div>
                    Assigning...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 sm:gap-2">
                    <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                    Assign Task
                  </span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Clear History Modal */}
      <Dialog open={showClearHistoryModal} onOpenChange={setShowClearHistoryModal}>
        <DialogContent className="sm:max-w-[450px] max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 text-sm sm:text-base">
              <AlertTriangle className="w-5 h-5" />
              Clear Task History & Points
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-xs sm:text-sm text-red-700">
                <strong>Warning:</strong> This action will permanently delete:
              </p>
              <ul className="text-xs sm:text-sm text-red-600 mt-2 space-y-1 ml-4 list-disc">
                <li>All completed task history</li>
                <li>All earned points (wallet balance reset to 0)</li>
                <li>All verified/completed tasks</li>
              </ul>
              <p className="text-xs sm:text-sm text-red-700 mt-2 font-medium">
                This action cannot be undone!
              </p>
            </div>

            <div>
              <Label htmlFor="agentToClear" className="text-xs sm:text-sm font-medium">
                Select Agent to Clear
              </Label>
              <select
                id="agentToClear"
                value={selectedAgentToClear}
                onChange={(e) => setSelectedAgentToClear(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg mt-1.5 text-xs sm:text-sm"
              >
                <option value="all">🚨 All Agents (Clear Everything)</option>
                {allAgents.map(agent => (
                  <option key={agent.id} value={agent.email}>
                    {agent.name} ({agent.email})
                  </option>
                ))}
              </select>
            </div>

            {selectedAgentToClear !== 'all' && (
              <div className="bg-gray-50 border rounded-lg p-3">
                <p className="text-xs sm:text-sm text-gray-600">
                  This will clear history for: <strong>{allAgents.find(a => a.email === selectedAgentToClear)?.name || selectedAgentToClear}</strong>
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setShowClearHistoryModal(false);
                setSelectedAgentToClear('all');
              }} 
              size="sm" 
              className="text-xs sm:text-sm"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleClearHistory}
              disabled={clearing}
              size="sm"
              variant="destructive"
              className="text-xs sm:text-sm"
            >
              {clearing ? (
                <span className="flex items-center gap-1.5">
                  <div className="h-3 w-3 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></div>
                  Clearing...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  Clear History
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgentTaskManagementTab;
