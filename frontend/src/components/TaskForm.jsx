import React, { useState } from 'react';

const TaskForm = ({ onAdd }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title, description });
    setTitle('');
    setDescription('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Add New Task</h2>
      <div className="form-group">
        <input 
          type="text" 
          placeholder="Task Title" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <textarea 
          placeholder="Task Description (Optional)" 
          rows="3"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>
      </div>
      <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
        Create Task
      </button>
    </form>
  );
};

export default TaskForm;
