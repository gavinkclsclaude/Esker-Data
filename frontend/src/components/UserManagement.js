import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

const UserManagement = ({ onClose }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    role: 'user'
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingUser) {
        // Update existing user
        await axios.put(`${API_URL}/auth/users/${editingUser.id}`, {
          username: formData.username,
          email: formData.email,
          fullName: formData.fullName,
          role: formData.role,
          isActive: editingUser.is_active
        });
      } else {
        // Create new user
        await axios.post(`${API_URL}/auth/users`, formData);
      }
      
      setFormData({ username: '', email: '', password: '', fullName: '', role: 'user' });
      setShowAddForm(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to save user');
    }
  };

  const startEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      fullName: user.full_name || '',
      role: user.role
    });
    setShowAddForm(true);
    setError('');
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setFormData({ username: '', email: '', password: '', fullName: '', role: 'user' });
    setShowAddForm(false);
    setError('');
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const user = users.find(u => u.id === userId);
      await axios.put(`${API_URL}/auth/users/${userId}`, {
        ...user,
        fullName: user.full_name,
        isActive: !currentStatus
      });
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Failed to update user');
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`${API_URL}/auth/users/${userId}`);
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        setError(error.response?.data?.error || 'Failed to delete user');
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '1000px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>User Management</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {error && <div className="error">{error}</div>}
          
          <div style={{ marginBottom: '20px' }}>
            <button 
              className="form-button" 
              style={{ width: 'auto', padding: '10px 20px' }}
              onClick={() => {
                if (showAddForm) {
                  cancelEdit();
                } else {
                  setShowAddForm(true);
                }
              }}
            >
              {showAddForm ? 'Cancel' : 'Add New User'}
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleSubmit} style={{ 
              background: '#f8f8f8', 
              padding: '20px', 
              borderRadius: '4px',
              marginBottom: '20px' 
            }}>
              <h4 style={{ margin: '0 0 16px 0', color: '#005a58' }}>
                {editingUser ? 'Edit User' : 'Create New User'}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                {!editingUser && (
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-input"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                    />
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select
                    className="form-input"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="form-button" style={{ width: 'auto', marginTop: '16px' }}>
                {editingUser ? 'Update User' : 'Create User'}
              </button>
            </form>
          )}

          {loading ? (
            <div className="loading">Loading users...</div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Full Name</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Last Login</th>
                    <th style={{ minWidth: '200px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{user.full_name || '-'}</td>
                      <td>
                        <span className={`status-badge ${user.role === 'admin' ? 'validated' : 'to-validate'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${user.is_active ? 'validated' : 'rejected'}`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{new Date(user.created_at).toLocaleDateString()}</td>
                      <td>{user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'nowrap' }}>
                          <button
                            className="detail-btn"
                            style={{ background: '#1976d2' }}
                            onClick={() => startEdit(user)}
                            title="Edit user"
                          >
                            Edit
                          </button>
                          <button
                            className="detail-btn"
                            style={{ background: user.is_active ? '#ed6c02' : '#2e7d32' }}
                            onClick={() => toggleUserStatus(user.id, user.is_active)}
                            title={user.is_active ? 'Disable user' : 'Enable user'}
                          >
                            {user.is_active ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            className="detail-btn"
                            style={{ background: '#d32f2f' }}
                            onClick={() => deleteUser(user.id)}
                            title="Delete user"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;