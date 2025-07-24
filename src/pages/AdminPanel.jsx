import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, Clock, BarChart3, User, Calendar, Mail, LogOut, Menu, X, Plus, UserPlus } from 'lucide-react';

// Add Admin Modal Component

const API_BASE_URL = process.env.VITE_API_BASE_URL;
const AddAdminModal = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const showNotification = (message, type = 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setNotification({ show: false, message: '', type: '' });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleRegister = async () => {
    // Validation
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      showNotification('Please fill in all fields', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showNotification('Passwords do not match', 'error');
      return;
    }

    if (password.length < 6) {
      showNotification('Password must be at least 6 characters long', 'error');
      return;
    }

    setIsLoading(true);
    
    try {
      const res = await fetch(`${API_BASE_URL}/admin/createAdmin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          adminName: name,
          adminEmail: email,
          adminPassword: password,
          confirmPassword: confirmPassword
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      // Success
      showNotification('Admin account created successfully!', 'success');
      setTimeout(() => {
        resetForm();
        onSuccess?.();
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error('Registration error:', error);
      showNotification(`Error: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" onClick={handleClose} style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Add New Admin</h2>
          <button
            onClick={handleClose}
            className="text-white hover:bg-blue-800 rounded-full p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Notification */}
          {notification.show && (
            <div className={`mb-4 p-3 rounded-lg ${
              notification.type === 'success' 
                ? 'bg-green-100 border border-green-400 text-green-700' 
                : notification.type === 'error'
                ? 'bg-red-100 border border-red-400 text-red-700'
                : 'bg-blue-100 border border-blue-400 text-blue-700'
            }`}>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  notification.type === 'success' 
                    ? 'bg-green-500' 
                    : notification.type === 'error'
                    ? 'bg-red-500'
                    : 'bg-blue-500'
                }`}></div>
                <span className="text-sm">{notification.message}</span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Admin Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Admin Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRegister}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating...
                </div>
              ) : (
                'Create Admin'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0
  });
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userTasks, setUserTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adminInfo, setAdminInfo] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);

  // Extract admin info from token
  const getAdminFromToken = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) return null;

      const payload = JSON.parse(atob(tokenParts[1]));
      return payload.isAdmin ? payload : null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // API call helper
  const apiCall = async (endpoint) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  };

  // Fetch platform stats
  const fetchStats = async () => {
    try {
      const response = await apiCall('stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Failed to load statistics');
    }
  };

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const response = await apiCall('users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
    }
  };

  // Fetch tasks for selected user
  const fetchUserTasks = async (userId) => {
    try {
      const response = await apiCall(`users/${userId}/tasks`);
      setUserTasks(response.data.tasks);
    } catch (error) {
      console.error('Error fetching user tasks:', error);
      setError('Failed to load user tasks');
    }
  };

  // Handle user selection
  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    await fetchUserTasks(user.id);
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  // Handle successful admin creation
  const handleAdminCreated = () => {
    // Optionally refresh stats or show success message
    fetchStats();
  };

  // Initialize dashboard
  useEffect(() => {
    const admin = getAdminFromToken();
    if (!admin) {
      window.location.href = '/login';
      return;
    }

    setAdminInfo(admin);
    
    const initializeDashboard = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchStats(), fetchUsers()]);
      } catch (error) {
        setError('Failed to initialize dashboard');
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div className="flex items-center space-x-8 ml-4">
                <span className="text-lg font-semibold text-blue-600">Admin Dashboard</span>
                <button
                  onClick={() => setShowAddAdminModal(true)}
                  className="hidden md:flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add Admin</span>
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome {adminInfo ? adminInfo.name : 'Admin'}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:block">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">ADMIN DASHBOARD</h1>
            <button
              onClick={() => setShowAddAdminModal(true)}
              className="md:hidden flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Admin</span>
            </button>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalTasks}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600">{stats.completedTasks}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-orange-600">{stats.pendingTasks}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* All Users Section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                ALL USERS
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {users.map(user => (
                  <div
                    key={user.id}
                    onClick={() => handleUserSelect(user)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedUser?.id === user.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {user.name} ({user.email})
                        </h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <BarChart3 className="w-4 h-4" />
                            Tasks: {user.taskCount} | Completed: {user.completedTasks}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          Joined: {formatDate(user.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Selected User Tasks Section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                SELECTED USER TASKS
              </h2>
            </div>
            <div className="p-6">
              {!selectedUser ? (
                <div className="text-center py-12">
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Select a user to view their tasks</p>
                </div>
              ) : (
                <div>
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="font-medium text-blue-900">
                      {selectedUser.name}'s Tasks ({userTasks.length})
                    </p>
                  </div>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {userTasks.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No tasks found for this user</p>
                    ) : (
                      userTasks.map(task => (
                        <div
                          key={task.id}
                          className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900 flex-1">{task.title}</h4>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                          </div>
                          {task.description && (
                            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                          )}
                          <div className="flex items-center justify-between text-sm">
                            <span className={`flex items-center gap-1 ${
                              task.completed ? 'text-green-600' : 'text-orange-600'
                            }`}>
                              {task.completed ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                              {task.completed ? 'Completed' : 'Pending'}
                            </span>
                            <span className="text-gray-500">
                              Due: {formatDate(task.dueDate)}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Admin Modal */}
      <AddAdminModal
        isOpen={showAddAdminModal}
        onClose={() => setShowAddAdminModal(false)}
        onSuccess={handleAdminCreated}
      />
    </div>
  );
}