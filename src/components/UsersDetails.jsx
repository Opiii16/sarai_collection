import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaTimes, FaUserEdit, FaLock, FaBan, FaUserTimes, FaUserShield } from 'react-icons/fa';
import axios from 'axios';

const API_URL = 'https://saraicollection.pythonanywhere.com/api';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    is_admin: false,
    is_suspended: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false); // New state for delete success

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/users/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setUser(response.data);
        setFormData({
          username: response.data.username,
          email: response.data.email,
          first_name: response.data.first_name,
          last_name: response.data.last_name,
          phone: response.data.phone,
          is_admin: response.data.is_admin,
          is_suspended: response.data.is_suspended
        });
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load user');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  useEffect(() => {
    // Auto-dismiss delete success message after 2 seconds
    if (deleteSuccess) {
      const timer = setTimeout(() => {
        setDeleteSuccess(false);
        navigate('/admin');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [deleteSuccess, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/users/${id}`, formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUser(prev => ({ ...prev, ...formData }));
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAdmin = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const newAdminStatus = !formData.is_admin;
      await axios.put(`${API_URL}/users/${id}`, { ...formData, is_admin: newAdminStatus }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setFormData(prev => ({ ...prev, is_admin: newAdminStatus }));
      setUser(prev => ({ ...prev, is_admin: newAdminStatus }));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update admin status');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleSuspend = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const newSuspendStatus = !formData.is_suspended;
      await axios.put(`${API_URL}/users/${id}`, { ...formData, is_suspended: newSuspendStatus }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setFormData(prev => ({ ...prev, is_suspended: newSuspendStatus }));
      setUser(prev => ({ ...prev, is_suspended: newSuspendStatus }));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update suspension status');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (window.confirm('Are you sure you want to delete this user account? This action cannot be undone.')) {
      try {
        setSaving(true);
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/users/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setDeleteSuccess(true);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete user');
      } finally {
        setSaving(false);
      }
    }
  };

  if (loading && !user) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-5 text-center">
        <p className="text-danger">User not found</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-12 mb-4">
          <button 
            className="btn btn-outline-secondary"
            onClick={() => navigate('/admin')}
          >
            <FaArrowLeft className="me-2" />
            Back to Users
          </button>
        </div>
      </div>

      {deleteSuccess && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          User deleted successfully!
          <button
            type="button"
            className="btn-close"
            onClick={() => setDeleteSuccess(false)}
            aria-label="Close"
          ></button>
        </div>
      )}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h4 className="mb-0">User Details</h4>
              {!editing && (
                <button 
                  className="btn btn-light btn-sm"
                  onClick={() => setEditing(true)}
                >
                  <FaUserEdit className="me-1" />
                  Edit
                </button>
              )}
            </div>
            <div className="card-body">
              {editing ? (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">Username</label>
                    <input
                      type="text"
                      className="form-control"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="first_name" className="form-label">First Name</label>
                      <input
                        type="text"
                        className="form-control"
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="last_name" className="form-label">Last Name</label>
                      <input
                        type="text"
                        className="form-control"
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="phone" className="form-label">Phone</label>
                    <input
                      type="tel"
                      className="form-control"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="is_admin"
                      name="is_admin"
                      checked={formData.is_admin}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="is_admin">Admin User</label>
                  </div>

                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="is_suspended"
                      name="is_suspended"
                      checked={formData.is_suspended}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="is_suspended">Suspended</label>
                  </div>

                  <div className="d-flex justify-content-between">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setEditing(false);
                        setFormData({
                          username: user.username,
                          email: user.email,
                          first_name: user.first_name,
                          last_name: user.last_name,
                          phone: user.phone,
                          is_admin: user.is_admin,
                          is_suspended: user.is_suspended
                        });
                      }}
                      disabled={saving}
                    >
                      <FaTimes className="me-2" />
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={saving}
                    >
                      {saving ? (
                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      ) : (
                        <FaSave className="me-2" />
                      )}
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="mb-3">
                    <h5>Username</h5>
                    <p>{user.username}</p>
                  </div>

                  <div className="mb-3">
                    <h5>Email</h5>
                    <p>{user.email}</p>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <h5>First Name</h5>
                      <p>{user.first_name || '-'}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <h5>Last Name</h5>
                      <p>{user.last_name || '-'}</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <h5>Phone</h5>
                    <p>{user.phone || '-'}</p>
                  </div>

                  <div className="mb-3">
                    <h5>Role</h5>
                    <span className={`badge ${user.is_admin ? 'bg-danger' : 'bg-primary'}`}>
                      {user.is_admin ? 'Admin' : 'User'}
                    </span>
                  </div>

                  <div className="mb-3">
                    <h5>Status</h5>
                    <span className={`badge ${user.is_suspended ? 'bg-warning' : 'bg-success'}`}>
                      {user.is_suspended ? 'Suspended' : 'Active'}
                    </span>
                  </div>

                  <div className="mb-3">
                    <h5>Created At</h5>
                    <p>{new Date(user.created_at).toLocaleString()}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-header bg-info text-white">
              <h4 className="mb-0">User Actions</h4>
            </div>
            <div className="card-body">
              <button 
                className={`btn btn-outline-${user.is_admin ? 'warning' : 'success'} w-100 mb-2`}
                onClick={handleToggleAdmin}
                disabled={saving}
              >
                <FaUserShield className="me-2" />
                {user.is_admin ? 'Remove Admin' : 'Make Admin'}
              </button>
              <button 
                className={`btn btn-outline-${user.is_suspended ? 'primary' : 'warning'} w-100 mb-2`}
                onClick={handleToggleSuspend}
                disabled={saving}
              >
                <FaBan className="me-2" />
                {user.is_suspended ? 'Unsuspend User' : 'Suspend User'}
              </button>
              <button 
                className="btn btn-outline-danger w-100 mb-2"
                onClick={handleDeleteUser}
                disabled={saving}
              >
                <FaUserTimes className="me-2" />
                Delete User
              </button>
              <button 
                className="btn btn-outline-primary w-100"
                onClick={() => navigate(`/admin${id}/reset-password`)}
                disabled={saving}
              >
                <FaLock className="me-2" />
                Reset Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;