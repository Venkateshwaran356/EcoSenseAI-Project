import React, { useState, useEffect } from 'react';
import TaskForm from './TaskForm';
import TaskList from './TaskList';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      let url = `${API_URL}/api/tasks`;
      const queryParams = [];
      if (filter !== 'all') queryParams.push(`status=${filter}`);
      if (search) queryParams.push(`search=${search}`);
      
      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filter, search]);

  const addTask = async (taskData) => {
    try {
      const res = await fetch(`${API_URL}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      if (!res.ok) throw new Error('Failed to create task');
      fetchTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const updateTask = async (id, taskData) => {
    try {
      const res = await fetch(`${API_URL}/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      if (!res.ok) throw new Error('Failed to update task');
      fetchTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteTask = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/tasks/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete task');
      fetchTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;

  return (
    <div className="container">
      <header>
        <h1>Task Manager</h1>
      </header>

      <div className="stats-container">
        <div className="stat-box">
          <div className="stat-value">{totalTasks}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{completedTasks}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{pendingTasks}</div>
          <div className="stat-label">Pending</div>
        </div>
      </div>

      <div className="card">
        <TaskForm onAdd={addTask} />
      </div>

      <div className="card">
        <div className="task-controls">
          <input
            type="text"
            className="search-box"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="filters">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending
            </button>
            <button 
              className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completed
            </button>
          </div>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading tasks...</div>
        ) : (
          <TaskList 
            tasks={tasks} 
            onUpdate={updateTask} 
            onDelete={deleteTask} 
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
