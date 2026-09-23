import React, { useState } from 'react';

const TaskItem = ({ task, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description);

  const handleToggleStatus = () => {
    onUpdate(task._id, { 
      ...task, 
      status: task.status === 'pending' ? 'completed' : 'pending' 
    });
  };

  const handleSaveEdit = () => {
    onUpdate(task._id, { ...task, title: editTitle, description: editDesc });
    setIsEditing(false);
  };

  return (
    <div className={`task-item ${task.status === 'completed' ? 'completed' : ''}`}>
      <div className="task-content">
        {isEditing ? (
          <div style={{ marginBottom: '1rem' }}>
            <input 
              type="text" 
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              style={{ marginBottom: '0.5rem' }}
            />
            <textarea 
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              rows="2"
            ></textarea>
          </div>
        ) : (
          <>
            <div className="task-title">{task.title}</div>
            {task.description && <div className="task-desc">{task.description}</div>}
            <div className={`status-badge ${task.status === 'pending' ? 'status-pending' : 'status-completed'}`}>
              {task.status}
            </div>
          </>
        )}
      </div>

      <div className="task-actions" style={{ marginLeft: '1rem' }}>
        {isEditing ? (
          <>
            <button className="btn btn-success" onClick={handleSaveEdit}>Save</button>
            <button className="btn btn-warning" onClick={() => setIsEditing(false)}>Cancel</button>
          </>
        ) : (
          <>
            <button 
              className={`btn ${task.status === 'pending' ? 'btn-success' : 'btn-warning'}`}
              onClick={handleToggleStatus}
              title={task.status === 'pending' ? 'Mark Completed' : 'Mark Pending'}
            >
              {task.status === 'pending' ? '✓ Complete' : '⟲ Undo'}
            </button>
            <button className="btn btn-primary" onClick={() => setIsEditing(true)}>Edit</button>
            <button className="btn btn-danger" onClick={() => onDelete(task._id)}>Delete</button>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskItem;
