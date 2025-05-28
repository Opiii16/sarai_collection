import React, { useState, useEffect } from 'react';
import { FaGoogle, FaFacebookF, FaGithub, FaSpinner } from 'react-icons/fa';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { validateEmail } from './utils/validation';
import './Signin.css'

const Signin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user?.token) {
          const urlParams = new URLSearchParams(window.location.search);
          const redirectPath = urlParams.get('redirect') || location.state?.from || '/';
          navigate(redirectPath);
        }
      } catch (err) {
        localStorage.removeItem('user');
      }
    }
  }, [navigate, location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Create FormData object
      const formDataToSend = new FormData();
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);

      const response = await axios.post(
        'https://prosperv21.pythonanywhere.com/api/auth/login',
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      localStorage.setItem('token', response.data.token);
      
      if (response.data?.token) {
        localStorage.setItem('user', JSON.stringify({
          ...response.data.user,
          token: response.data.token
        }));
        const urlParams = new URLSearchParams(window.location.search);
        const redirectPath = urlParams.get('redirect') || location.state?.from || '/';
        navigate(redirectPath);
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setApiError(
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="card p-4 border-0 shadow" style={{ width: '100%', maxWidth: '500px' }}>
        <div className="card-body">
          <h1 className="text-center fs-4 fw-bold mb-4">Sign In</h1>
          
          <form onSubmit={handleSubmit} noValidate>
            {apiError && <div className="alert alert-danger">{apiError}</div>}
            
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input 
                type="email" 
                id="email"
                name="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>
            
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input 
                type="password" 
                id="password"
                name="password"
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>
            
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="form-check">
                <input 
                  type="checkbox" 
                  className="form-check-input" 
                  id="rememberMe"
                />
                <label className="form-check-label" htmlFor="rememberMe">
                  Remember me
                </label>
              </div>
              <Link to="/forgot-password" className="text-decoration-none">
                Forgot Password?
              </Link>
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary w-100 fw-bold py-2 mb-3"
              disabled={loading}
            >
              {loading ? (
                <>
                  <FaSpinner className="fa-spin me-2" />
                  Signing In...
                </>
              ) : 'Sign In'}
            </button>
            
            <div className="d-flex align-items-center my-3">
              <hr className="flex-grow-1" />
              <span className="px-3 text-muted">OR</span>
              <hr className="flex-grow-1" />
            </div>
            
            <div className="d-flex justify-content-center gap-3 mb-3">
              <button type="button" className="btn btn-outline-danger rounded-circle p-2">
                <FaGoogle className="fs-5" />
              </button>
              <button type="button" className="btn btn-outline-primary rounded-circle p-2">
                <FaFacebookF className="fs-5" />
              </button>
              <button type="button" className="btn btn-outline-dark rounded-circle p-2">
                <FaGithub className="fs-5" />
              </button>
            </div>
            
            <p className="text-center mt-3">
              Don't have an account? <Link to="/signup" className="text-primary">Sign up</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signin;