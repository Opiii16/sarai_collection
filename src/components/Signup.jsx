import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGoogle, FaFacebook, FaApple, FaSpinner, FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import { validateEmail, validatePassword } from '../utils/validation';
import './Signup.css'

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: '',
    acceptTerms: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiSuccess, setApiSuccess] = useState('');
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordError = validatePassword(formData.password);
      if (passwordError) {
        newErrors.password = passwordError;
      }
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setApiSuccess('');
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Prepare form data for Flask API
      const formDataToSend = new FormData();
      formDataToSend.append('username', formData.username);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('first_name', formData.first_name);
      formDataToSend.append('last_name', formData.last_name);
      formDataToSend.append('phone', formData.phone);
      
      const response = await axios.post(`https://saraicollection.pythonanywhere.com/api/auth/register`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setApiSuccess(response.data.message || 'Registration successful! Redirecting...');
      
      // Store token if provided
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify({
          id: response.data.user_id,
          username: formData.username,
          email: formData.email,
          first_name: formData.first_name
        }));
      }
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/signin');
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
      setApiError(error.response?.data?.error || 
                 error.message || 
                 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
    
  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100 dark-gold-theme">
      <div className="card p-4 border-0 shadow" style={{ width: '100%', maxWidth: '800px', borderRadius: '20px' }}>
        <div className="card-body">
          <h2 className="card-title text-center mb-3 text-primary">Create Account</h2>
          <p className="text-center text-muted mb-4">Join our community today</p>
          
          <form onSubmit={handleSubmit} noValidate>
            {loading && (
              <div className="alert alert-info d-flex align-items-center">
                <FaSpinner className="fa-spin me-2" />
                Creating your account...
              </div>
            )}
            {apiSuccess && <div className="alert alert-success">{apiSuccess}</div>}
            {apiError && <div className="alert alert-danger">{apiError}</div>}
            
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="first_name" className="form-label text-start d-block">First Name *</label>
                <input 
                  type="text" 
                  className={`form-control ${errors.first_name ? 'is-invalid' : ''}`}
                  id="first_name" 
                  name="first_name"
                  value={formData.first_name}
                  placeholder="Enter your first name"
                  onChange={handleChange}
                  required
                />
                {errors.first_name && <div className="invalid-feedback">{errors.first_name}</div>}
              </div>
              
              <div className="col-md-6 mb-3">
                <label htmlFor="last_name" className="form-label text-start d-block">Last Name</label>
                <input 
                  type="text" 
                  className="form-control"
                  id="last_name" 
                  name="last_name"
                  value={formData.last_name}
                  placeholder="Enter your last name"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="username" className="form-label text-start d-block">Username *</label>
              <input 
                type="text" 
                className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                id="username" 
                name="username"
                value={formData.username}
                placeholder="Choose a username"
                onChange={handleChange}
                required
              />
              {errors.username && <div className="invalid-feedback">{errors.username}</div>}
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label text-start d-block">Email *</label>
              <input 
                type="email" 
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                id="email" 
                name="email"
                value={formData.email}
                placeholder="your@email.com"
                onChange={handleChange}
                required
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>

            <div className="mb-3">
              <label htmlFor="phone" className="form-label text-start d-block">Phone</label>
              <input 
                type="tel" 
                className="form-control"
                id="phone" 
                name="phone"
                value={formData.phone}
                placeholder="+1234567890"
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label text-start d-block">Password *</label>
              <div className="position-relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  id="password" 
                  name="password"
                  value={formData.password}
                  placeholder="Create a password"
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted"
                  style={{ border: 'none', background: 'none', zIndex: 10 }}
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && (
                <div className="invalid-feedback">{errors.password}</div>
              )}
              <div className="form-text">
                Password must contain at least 8 characters, including uppercase, lowercase, number, and special character.
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label text-start d-block">Confirm Password *</label>
              <div className="position-relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"}
                  className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                  id="confirmPassword" 
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  placeholder="Confirm your password"
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted"
                  style={{ border: 'none', background: 'none', zIndex: 10 }}
                  onClick={toggleConfirmPasswordVisibility}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.confirmPassword && (
                <div className="invalid-feedback">{errors.confirmPassword}</div>
              )}
            </div>

            <div className="mb-4 form-check">
              <input 
                type="checkbox" 
                className={`form-check-input ${errors.acceptTerms ? 'is-invalid' : ''}`}
                id="acceptTerms"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                required
              />
              <label className="form-check-label" htmlFor="acceptTerms">
                I agree to the <Link to="/terms">Terms and Conditions</Link> and <Link to="/privacy">Privacy Policy</Link>
              </label>
              {errors.acceptTerms && (
                <div className="invalid-feedback d-block">{errors.acceptTerms}</div>
              )}
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-100 py-2 mb-3 fw-bold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <FaSpinner className="fa-spin me-2" />
                  Creating Account...
                </>
              ) : 'Sign Up'}
            </button>

            <p className="text-center mt-3">
              Already have an account? <Link to="/signin" className="text-primary">Sign In</Link>
            </p>

            <div className="d-flex align-items-center mb-4">
                <hr className="flex-grow-1" />
                <span className="px-3 text-muted">OR</span>
                <hr className="flex-grow-1" />
            </div>

            <div className="d-flex justify-content-center gap-3 mb-3">
                          <button type="button" className="btn btn-outline-danger rounded-circle p-2">
                            <FaGoogle className="fs-5" />
                          </button>
                          <button type="button" className="btn btn-outline-secondary rounded-circle p-2">
                            <FaFacebook className="fs-5" />
                          </button>
                          <button type="button" className="btn btn-outline-info rounded-circle p-2">
                            <FaApple className="fs-5" />
                          </button>
                        </div>

           
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;