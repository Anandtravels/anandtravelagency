import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Clock, 
  Star, 
  Gift,
  AlertCircle,
  Trophy,
  Sparkles
} from 'lucide-react';
import { AgentTask } from '@/types/agent-tasks';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface AgentTaskListProps {
  tasks: AgentTask[];
  onCompleteTask: (taskId: string) => Promise<boolean>;
  loading?: boolean;
  showAllTasks?: boolean; // When true, shows all tasks in a single list without separating pending/completed
}

const AgentTaskList: React.FC<AgentTaskListProps> = ({ tasks, onCompleteTask, loading, showAllTasks = false }) => {
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);

  const handleComplete = async (taskId: string) => {
    setCompletingTaskId(taskId);
    await onCompleteTask(taskId);
    setCompletingTaskId(null);
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
      default:
        return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-travel-teal" />;
      case 'verified':
        return <Trophy className="w-4 h-4 text-travel-orange" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-travel-blue-dark animate-pulse" />;
      default:
        return <AlertCircle className="w-4 h-4 text-travel-orange" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-travel-teal/10 text-travel-teal border-travel-teal/20 text-xs">Completed</Badge>;
      case 'verified':
        return <Badge className="bg-travel-orange/10 text-travel-orange border-travel-orange/20 text-xs">Verified ✓</Badge>;
      case 'in-progress':
        return <Badge className="bg-travel-blue-dark/10 text-travel-blue-dark border-travel-blue-dark/20 text-xs">In Progress</Badge>;
      default:
        return <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs">Pending</Badge>;
    }
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in-progress');
  const completedTasks = tasks.filter(t => t.status === 'completed' || t.status === 'verified');

  if (loading) {
    return (
      <Card className="border-gray-200">
        <CardHeader className="py-3 px-4">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Star className="w-4 h-4 text-travel-orange" />
            Daily Tasks
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-3 border-travel-blue-dark border-r-transparent"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // When showing filtered tasks (from dropdown selection)
  if (showAllTasks) {
    return (
      <Card className="border-travel-blue-dark/20 shadow-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-travel-blue-dark to-travel-blue-medium text-white py-3 px-4">
          <CardTitle className="flex items-center justify-between text-sm sm:text-base">
            <span className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Filtered Tasks
            </span>
            <Badge className="bg-white/20 text-white border-white/30 text-xs px-2">
              {tasks.length} Tasks
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          {tasks.length === 0 ? (
            <div className="text-center py-6">
              <Sparkles className="w-8 h-8 mx-auto text-gray-300 mb-2" />
              <p className="text-gray-600 font-medium text-sm">No tasks found</p>
              <p className="text-xs text-gray-500 mt-1">Try selecting a different filter.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {tasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white border border-gray-100 rounded-lg p-3 hover:shadow-sm transition-all"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {getStatusIcon(task.status)}
                          <h3 className="font-medium text-gray-900 text-sm">{task.title}</h3>
                          {getStatusBadge(task.status)}
                          {task.priority && (
                            <Badge className={`${getPriorityColor(task.priority)} text-[10px] px-1.5 py-0`}>
                              {task.priority.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>{format(task.createdAt, 'dd MMM, HH:mm')}</span>
                          {task.completedAt && (
                            <span className="text-travel-teal ml-2">
                              • Completed: {format(task.completedAt, 'dd MMM, HH:mm')}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 bg-travel-orange/10 px-2 py-1 rounded-full border border-travel-orange/20">
                          <Gift className="w-3.5 h-3.5 text-travel-orange" />
                          <span className="font-bold text-travel-orange text-sm">{task.points}</span>
                          <span className="text-xs text-travel-orange/80">pts</span>
                        </div>
                        
                        {(task.status === 'pending' || task.status === 'in-progress') && (
                          <Button
                            onClick={() => handleComplete(task.id)}
                            disabled={completingTaskId === task.id}
                            size="sm"
                            className="bg-travel-teal hover:bg-travel-teal/90 text-white text-xs px-3 py-1 h-8"
                          >
                            {completingTaskId === task.id ? (
                              <span className="flex items-center gap-1">
                                <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-r-transparent"></div>
                                <span className="hidden sm:inline">Processing</span>
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Complete
                              </span>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Pending Tasks */}
      <Card className="border-travel-orange/30 shadow-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-travel-orange to-orange-500 text-white py-3 px-4">
          <CardTitle className="flex items-center justify-between text-sm sm:text-base">
            <span className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Tasks to Complete
            </span>
            <Badge className="bg-white/20 text-white border-white/30 text-xs px-2">
              {pendingTasks.length} Pending
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          {pendingTasks.length === 0 ? (
            <div className="text-center py-6">
              <Sparkles className="w-8 h-8 mx-auto text-travel-orange mb-2" />
              <p className="text-gray-600 font-medium text-sm">All tasks completed! 🎉</p>
              <p className="text-xs text-gray-500 mt-1">Check back for new tasks.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {pendingTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white border border-gray-100 rounded-lg p-3 hover:shadow-sm transition-all"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {getStatusIcon(task.status)}
                          <h3 className="font-medium text-gray-900 text-sm">{task.title}</h3>
                          {task.priority && (
                            <Badge className={`${getPriorityColor(task.priority)} text-[10px] px-1.5 py-0`}>
                              {task.priority.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>{format(task.createdAt, 'dd MMM, HH:mm')}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 bg-travel-orange/10 px-2 py-1 rounded-full border border-travel-orange/20">
                          <Gift className="w-3.5 h-3.5 text-travel-orange" />
                          <span className="font-bold text-travel-orange text-sm">{task.points}</span>
                          <span className="text-xs text-travel-orange/80">pts</span>
                        </div>
                        
                        <Button
                          onClick={() => handleComplete(task.id)}
                          disabled={completingTaskId === task.id}
                          size="sm"
                          className="bg-travel-teal hover:bg-travel-teal/90 text-white text-xs px-3 py-1 h-8"
                        >
                          {completingTaskId === task.id ? (
                            <span className="flex items-center gap-1">
                              <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-r-transparent"></div>
                              <span className="hidden sm:inline">Processing</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Complete
                            </span>
                          )}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <Card className="border-travel-teal/30 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-travel-teal to-teal-500 text-white py-3 px-4">
            <CardTitle className="flex items-center justify-between text-sm sm:text-base">
              <span className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Completed
              </span>
              <Badge className="bg-white/20 text-white border-white/30 text-xs px-2">
                {completedTasks.length} Done
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="space-y-2">
              {completedTasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className="bg-travel-teal/5 border border-travel-teal/10 rounded-lg p-2.5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-travel-teal shrink-0" />
                    <div className="min-w-0">
                      <h4 className="font-medium text-gray-900 text-xs truncate">{task.title}</h4>
                      <p className="text-[10px] text-gray-500">
                        {task.completedAt ? format(task.completedAt, 'dd MMM, HH:mm') : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-travel-orange/10 text-travel-orange border-travel-orange/20 text-xs shrink-0 ml-2">
                    +{task.points}
                  </Badge>
                </div>
              ))}
              {completedTasks.length > 3 && (
                <p className="text-center text-xs text-gray-400 pt-1">
                  +{completedTasks.length - 3} more completed
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AgentTaskList;
