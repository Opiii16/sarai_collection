
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGoogle, FaFacebook, FaApple, FaSpinner, FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import { validateEmail, validatePassword } from './utils/validation';

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
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    else if (formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters';

    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!validateEmail(formData.email)) newErrors.email = 'Please enter a valid email';

    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';

    if (!formData.password) newErrors.password = 'Password is required';
    else {
      const passwordError = validatePassword(formData.password);
      if (passwordError) newErrors.password = passwordError;
    }

    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.acceptTerms) newErrors.acceptTerms = 'You must accept the terms and conditions';

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
      const formDataToSend = new FormData();
      formDataToSend.append('username', formData.username);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('first_name', formData.first_name);
      formDataToSend.append('last_name', formData.last_name);
      formDataToSend.append('phone', formData.phone);

      const response = await axios.post(`https://prosperv21.pythonanywhere.com/api/auth/register`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setApiSuccess(response.data.message || 'Registration successful! Redirecting...');
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify({
          id: response.data.user_id,
          username: formData.username,
          email: formData.email,
          first_name: formData.first_name
        }));
      }
      setTimeout(() => navigate('/signin'), 2000);
    } catch (error) {
      setApiError(error.response?.data?.error || error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="card p-4 border-0 shadow" style={{ maxWidth: '800px', borderRadius: '20px' }}>
        <div className="card-body">
          <h2 className="card-title text-center mb-3 text-primary">Create Account</h2>
          <p className="text-center text-muted mb-4">Join our community today</p>

          <form onSubmit={handleSubmit} noValidate>
            {loading && <div className="alert alert-info"><FaSpinner className="fa-spin me-2" /> Creating your account...</div>}
            {apiSuccess && <div className="alert alert-success">{apiSuccess}</div>}
            {apiError && <div className="alert alert-danger">{apiError}</div>}

            {/* First & Last Name */}
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="first_name" className="form-label">First Name *</label>
                <input type="text" className={`form-control ${errors.first_name ? 'is-invalid' : ''}`} id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} placeholder="Enter your first name" />
                {errors.first_name && <div className="invalid-feedback">{errors.first_name}</div>}
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="last_name" className="form-label">Last Name</label>
                <input type="text" className="form-control" id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Enter your last name" />
              </div>
            </div>

            {/* Username */}
            <div className="mb-3">
              <label htmlFor="username" className="form-label">Username *</label>
              <input type="text" className={`form-control ${errors.username ? 'is-invalid' : ''}`} id="username" name="username" value={formData.username} onChange={handleChange} placeholder="Choose a username" />
              {errors.username && <div className="invalid-feedback">{errors.username}</div>}
            </div>

            {/* Email */}
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email *</label>
              <input type="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`} id="email" name="email" value={formData.email} onChange={handleChange} placeholder="your@email.com" />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>

            {/* Phone */}
            <div className="mb-3">
              <label htmlFor="phone" className="form-label">Phone</label>
              <input type="tel" className="form-control" id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1234567890" />
            </div>

            {/* Password */}
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password *</label>
              <div className="position-relative">
                <input type={showPassword ? 'text' : 'password'} className={`form-control ${errors.password ? 'is-invalid' : ''}`} id="password" name="password" value={formData.password} onChange={handleChange} placeholder="Create a password" />
                <button type="button" className="btn btn-link position-absolute end-0 top-50 translate-middle-y" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <FaEyeSlash /> : <FaEye />}</button>
              </div>
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>

            {/* Confirm Password */}
            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password *</label>
              <div className="position-relative">
                <input type={showConfirmPassword ? 'text' : 'password'} className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`} id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm your password" />
                <button type="button" className="btn btn-link position-absolute end-0 top-50 translate-middle-y" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <FaEyeSlash /> : <FaEye />}</button>
              </div>
              {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
            </div>

            {/* Terms */}
            <div className="mb-4 form-check">
              <input type="checkbox" className={`form-check-input ${errors.acceptTerms ? 'is-invalid' : ''}`} id="acceptTerms" name="acceptTerms" checked={formData.acceptTerms} onChange={handleChange} />
              <label className="form-check-label" htmlFor="acceptTerms">
                I agree to the <Link to="/terms">Terms and Conditions</Link> and <Link to="/privacy">Privacy Policy</Link>
              </label>
              {errors.acceptTerms && <div className="invalid-feedback d-block">{errors.acceptTerms}</div>}
            </div>

            <button type="submit" className="btn btn-primary w-100 py-2 mb-3 fw-bold" disabled={loading}>
              {loading ? <><FaSpinner className="fa-spin me-2" /> Creating Account...</> : 'Sign Up'}
            </button>

            <p className="text-center mt-3">
              Already have an account? <Link to="/signin" className="text-primary">Sign In</Link>
            </p>

            <div className="d-flex align-items-center mb-4">
              <hr className="flex-grow-1" />
              <span className="px-3 text-muted">OR</span>
              <hr className="flex-grow-1" />
            </div>

            <div className="d-flex flex-column gap-2 mb-4">
              <button type="button" className="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2 py-2">
                <FaGoogle className="fs-5" /> Continue with Google
              </button>
              <button type="button" className="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2 py-2">
                <FaFacebook className="fs-5" /> Continue with Facebook
              </button>
              <button type="button" className="btn btn-outline-dark d-flex align-items-center justify-content-center gap-2 py-2">
                <FaApple className="fs-5" /> Continue with Apple
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;

