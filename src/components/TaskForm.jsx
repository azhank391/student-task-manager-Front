import React, { useState, useEffect } from "react";
import { Calendar, Plus } from "lucide-react";

const TaskFormModal = ({ isOpen, onClose, onTaskCreated }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "high",
    dueDate: "2025-07-15",
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  // Function to decode JWT token and extract userId
  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found in localStorage");
        return null;
      }

      const tokenParts = token.split(".");
      if (tokenParts.length !== 3) {
        console.error("Invalid token format");
        return null;
      }

      const payload = JSON.parse(atob(tokenParts[1]));
      return payload.userId || payload.id || payload.user_id || null;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  // Extract userId when component mounts
  useEffect(() => {
    const extractedUserId = getUserIdFromToken();
    setUserId(extractedUserId);

    if (!extractedUserId) {
      setError("User authentication required. Please log in again.");
    }
  }, []);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: "",
        description: "",
        priority: "high",
        dueDate: "2025-07-15",
      });
      setError(null);
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  // Handle task submission to backend
  const handleTaskSubmit = async () => {
    if (!formData.title.trim()) {
      setError("Please enter a task title");
      return;
    }

    if (!userId) {
      setError("User authentication required. Please log in again.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create task data in the format backend expects
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        completed: false,
        priority: formData.priority,
        dueDate: new Date(formData.dueDate + "T10:00:00.000Z").toISOString(),
        userId: userId,
      };

      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3000/api/tasks", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Call parent component callback if provided
      if (onTaskCreated && data.task) {
        onTaskCreated(data.task);
      }

      // Show success message
      alert("Task created successfully!");
      onClose(); // Close modal after successful creation
    } catch (error) {
      console.error("Error submitting task:", error);
      setError(`Failed to create task: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: "",
      description: "",
      priority: "high",
      dueDate: "2025-07-15",
    });
    setError(null);
    onClose();
  };

  const priorityColors = {
    high: "bg-red-50 text-red-700 border-red-200",
    medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
    low: "bg-green-50 text-green-700 border-green-200",
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 bg-amber-100 backdrop-blur-md"
        style={{ backgroundColor: "rgba(255, 255, 255, 0.3)" }}
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Plus className="w-6 h-6 text-blue-600" />
              Add New Task
            </h2>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="block text-sm font-semibold text-gray-700"
              >
                Task Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter task title..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400"
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="description"
                className="block text-sm font-semibold text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Add task description..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400 resize-none"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="priority"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    priorityColors[formData.priority]
                  }`}
                  disabled={loading}
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="dueDate"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Due Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-800"
                    disabled={loading}
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTaskSubmit}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={loading || !userId}
              >
                {loading ? "Creating..." : "Create Task"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskFormModal;
