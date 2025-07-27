import React, { useState, useEffect } from 'react';
import { Plus, Filter, ArrowUpDown, Settings, LogOut, Calendar, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TaskFormModal from '../components/TaskForm'; // Import the modal component
import {toast} from 'react-toastify'
import TaskEditModal from '../components/TaskEditForm';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({ name: 'Azhan', isAdmin: false });
  const [filter, setFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Edit modal state
  const [taskToEdit, setTaskToEdit] = useState(null); // Task to edit
  const navigate = useNavigate();

  // Helper function to decode JWT token
  const decodeToken = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  useEffect(() => {
    // Get token from localStorage and decode it
    const token = localStorage.getItem('token');
    
    if (token) {
      const decodedToken = decodeToken(token);
      if (decodedToken) {
        const userData = {
          id: decodedToken.id,
          name: decodedToken.name,
          email: decodedToken.email,
          isAdmin: decodedToken.isAdmin || false
        };
        setUser(userData);
        
        // Fetch tasks with the user ID from token
        fetchTasks(decodedToken.id, token);
      } else {
        // Token is invalid, redirect to login
        navigate('/login');
        setError('Invalid token. Please login again.');
      }
    } else {
      // No token found, redirect to login
      navigate('/login');
      setError('No authentication token found. Please login.');
    }
  }, []);

  const fetchTasks = async (userId, token) => {
    try {
      setLoading(true);
      setError('');
      
      // Use actual API call with user ID from token
      const response = await fetch(`${API_BASE_URL}/api/tasks/${userId}`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setTasks(data.tasks || data); // Handle different response formats
      setLoading(false);
      
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(`Failed to fetch tasks: ${err.message}`);
      setLoading(false);
    }
  };

  // Handle task creation from modal
  const handleTaskCreated = (newTask) => {
    setTasks(prevTasks => [...prevTasks, newTask]);
    setIsModalOpen(false); // Close modal after creation
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        setTasks(tasks.filter(task => task.id !== taskId));
        toast.success('Task deleted successfully');
      } else {
        throw new Error('Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };


  const handleCompletedTask = async (taskId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) {
        throw new Error('Failed to toggle task completion');
      }
      const updatedTask = await res.json();
      setTasks(tasks.map(task => task.id === taskId ? updatedTask.task : task));
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };

  const filteredAndSortedTasks = () => {
    let filtered = tasks;
    
    // Apply filter
    if (filter === 'Completed') {
      filtered = tasks.filter(task => task.completed);
    } else if (filter === 'Pending') {
      filtered = tasks.filter(task => !task.completed);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'Newest') {
        return new Date(b.dueDate) - new Date(a.dueDate);
      } else if (sortBy === 'Oldest') {
        return new Date(a.dueDate) - new Date(b.dueDate);
      } else if (sortBy === 'Priority') {
        const priorityOrder = { 'High': 3, 'Med': 2, 'Low': 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return 0;
    });
    
    return filtered;
  };

  const getStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
    return { total, completed, pending };
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-50 border-red-200';
      case 'Med': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };
  //confirm delete 
  const confirmDelete = (taskId) => {
  const CustomToast = ({ closeToast }) => (
    <div>
      <p>Do you really want to delete this task?</p>
      <div style={{ marginTop: '10px' }}>
        <button 
          onClick={() => {
            handleDeleteTask(taskId);
            closeToast();
          }}
          style={{ marginRight: '10px', background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px' }}
        >
          Yes
        </button>
        <button 
          onClick={closeToast}
          style={{ background: '#6c757d', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px' }}
        >
          No
        </button>
      </div>
    </div>
  );

  toast(<CustomToast />, {
    autoClose: false,
    closeOnClick: false,
    draggable: false,
    position: "top-center",
  });
};

//handle opening edit modal
const handleEditClick = (taskId) => {
  setTaskToEdit(taskId);
  setIsEditModalOpen(true);
};
//handle task update from edit modal
const handleTaskUpdated = (taskId,updatedTask)=> {
  setTasks(tasks.map(task=>task.id === taskId ? {...task, ...updatedTask} : task));
  setIsEditModalOpen(false); // Close edit modal after update
  setTaskToEdit(null); // Clear task to edit
  toast.success('Task updated successfully');
}
//handle closing edit modal
const handleCloseEditModal = () => {
  setIsEditModalOpen(false);
  setTaskToEdit(null); // Clear task to edit
};


  const stats = getStats();
  const displayTasks = filteredAndSortedTasks();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex space-x-8">
              <button className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-4">
                TaskManager
              </button>
              {user.isAdmin && (
                <button 
                  onClick={() => navigate('/admin')}
                  className="text-gray-500 hover:text-gray-700 font-medium flex items-center"
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Admin Panel
                </button>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome {user.name}!</span>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  navigate('/login');
                }}
                className="text-gray-500 hover:text-gray-700 flex items-center"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">Quick Stats:</h2>
            <div className="ml-4 flex space-x-6">
              <span className="text-gray-600">Total: <strong>{stats.total}</strong></span>
              <span className="text-green-600">Completed: <strong>{stats.completed}</strong></span>
              <span className="text-orange-600">Pending: <strong>{stats.pending}</strong></span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-8">
          {/* Filter */}
          <div className="flex items-center">
            <Filter className="w-4 h-4 mr-2 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
            >
              <option value="All">Filter: All</option>
              <option value="Completed">Filter: Completed</option>
              <option value="Pending">Filter: Pending</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center">
            <ArrowUpDown className="w-4 h-4 mr-2 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
            >
              <option value="Newest">Sort: Newest</option>
              <option value="Oldest">Sort: Oldest</option>
              <option value="Priority">Sort: Priority</option>
            </select>
          </div>

          {/* Add New Task - Opens Modal */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Task
          </button>
        </div>

        {/* Task Cards Grid */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">TASKS</h3>
          
          {displayTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Calendar className="w-16 h-16 mx-auto mb-4" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Tasks Found</h3>
              <p className="text-gray-500 mb-4">
                {tasks.length === 0 
                  ? "You haven't added any tasks yet. Click 'Add New Task' to get started!"
                  : "No tasks match your current filter. Try adjusting your filters."
                }
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center mx-auto transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Task
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayTasks.map((task) => (
                <div key={task.id} className="border-2 border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-gray-800 flex-1">{task.title}</h4>
                    <div className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{task.description}</p>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Clock className="w-4 h-4 mr-1" />
                    Due: {task.dueDate}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => handleCompletedTask(task.id)}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        task.completed
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                      }`}
                    >
                      {task.completed ? '✓ Done' : 'Complete'}
                    </button>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditClick(task.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        [Edit]
                      </button>
                      <button
                        
                        onClick={() => confirmDelete(task.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        [Delete]
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Task Creation Modal */}
      <TaskFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTaskCreated={handleTaskCreated}
      />
      {/* Task Edit Modal */}
    <TaskEditModal
      isOpen={isEditModalOpen}
      onClose={handleCloseEditModal}
      onTaskUpdated={handleTaskUpdated}
      taskId={taskToEdit}
      />
    
    </div>
    
  );
};

export default Dashboard;