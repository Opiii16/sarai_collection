import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSave, FaTimes, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import './animate.css';

// Tailwind CSS CDN (ensure it's included in your project or index.html)
// <script src="https://cdn.tailwindcss.com"></script>

const AddProductForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    short_description: '', // Added
    price: '',
    compare_price: '',
    cost_price: '', // Added
    sku: '', // Added
    barcode: '', // Added
    quantity: '',
    category_id: '',
    is_featured: false,
    is_active: true
  });
  const [categories, setCategories] = useState([]);
  const [mainImage, setMainImage] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await axios.get('https://saraicollection.pythonanywhere.com/api/categories');
      setCategories(response.data);
      if (response.data.length === 0) {
        console.log('No categories found. Consider creating default categories.');
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setErrors({ general: 'Failed to load categories. Please refresh the page.' });
    } finally {
      setCategoriesLoading(false);
    }
  };

  const createDefaultCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('https://saraicollection.pythonanywhere.com/api/categories/setup', {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchCategories();
    } catch (err) {
      console.error('Error creating default categories:', err);
      setErrors({ general: 'Failed to create default categories.' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Product name is required';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (formData.compare_price && parseFloat(formData.compare_price) <= parseFloat(formData.price))
      newErrors.compare_price = 'Compare price must be greater than price';
    if (formData.cost_price && parseFloat(formData.cost_price) < 0)
      newErrors.cost_price = 'Cost price cannot be negative';
    if (!formData.quantity || parseInt(formData.quantity) < 0) newErrors.quantity = 'Valid quantity is required';
    if (!formData.category_id) newErrors.category_id = 'Please select a category';
    if (!mainImage) newErrors.main_image = 'Main image is required';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for the field
    setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleMainImageChange = (e) => {
    if (e.target.files[0]) {
      setMainImage(e.target.files[0]);
      setErrors(prev => ({ ...prev, main_image: null }));
    }
  };

  const handleAdditionalImagesChange = (e) => {
    if (e.target.files) {
      setAdditionalImages(prev => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const removeAdditionalImage = (index) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      if (mainImage) {
        formDataToSend.append('main_image', mainImage);
      }

      additionalImages.forEach((image) => {
        formDataToSend.append('additional_images', image);
      });

      const token = localStorage.getItem('token');
      const response = await axios.post('https://saraicollection.pythonanywhere.com/api/products', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data && response.data.product_id) {
        navigate('/admin');
      }
    } catch (err) {
      console.error('Error creating product:', err);
      setErrors({ general: err.response?.data?.error || 'Failed to create product' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-6 bg-gray-50 min-h-screen">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card shadow-lg border-0 animate__animated animate__fadeIn">
            <div className="card-header bg-gradient-primary text-white d-flex justify-content-between align-items-center">
              <h3 className="mb-0 font-weight-bold">Add New Product</h3>
              <button
                className="btn btn-outline-light btn-sm"
                onClick={() => navigate('/admin')}
                disabled={loading}
              >
                <FaTimes />
              </button>
            </div>
            <div className="card-body p-5">
              {errors.general && (
                <div className="alert alert-danger d-flex justify-content-between align-items-center animate__animated animate__shakeX">
                  <span>{errors.general}</span>
                  {errors.general.includes('categories') && (
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      onClick={fetchCategories}
                    >
                      Retry
                    </button>
                  )}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="position-relative">
                {loading && (
                  <div className="position-absolute top-0 start-0 w-100 h-100 bg-white bg-opacity-50 d-flex align-items-center justify-content-center" style={{ zIndex: 10 }}>
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                )}
                
                <div className="mb-4">
                  <label htmlFor="name" className="form-label font-medium text-gray-700">Product Name</label>
                  <input
                    type="text"
                    className={`form-control ${errors.name ? 'is-invalid' : ''} transition-all duration-300 focus:ring-2 focus:ring-primary`}
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>

                <div className="mb-4">
                  <label htmlFor="short_description" className="form-label font-medium text-gray-700">Short Description</label>
                  <textarea
                    className={`form-control ${errors.short_description ? 'is-invalid' : ''} transition-all duration-300 focus:ring-2 focus:ring-primary`}
                    id="short_description"
                    name="short_description"
                    rows="2"
                    value={formData.short_description}
                    onChange={handleChange}
                    placeholder="Brief description for product card (50-100 characters)"
                  />
                  {errors.short_description && <div className="invalid-feedback">{errors.short_description}</div>}
                </div>

                <div className="mb-4">
                  <label htmlFor="description" className="form-label font-medium text-gray-700">Full Description</label>
                  <textarea
                    className={`form-control ${errors.description ? 'is-invalid' : ''} transition-all duration-300 focus:ring-2 focus:ring-primary`}
                    id="description"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Detailed product description"
                  />
                  {errors.description && <div className="invalid-feedback">{errors.description}</div>}
                </div>

                <div className="row">
                  <div className="col-md-4 mb-4">
                    <label htmlFor="price" className="form-label font-medium text-gray-700">Price (KES)</label>
                    <input
                      type="number"
                      className={`form-control ${errors.price ? 'is-invalid' : ''} transition-all duration-300 focus:ring-2 focus:ring-primary`}
                      id="price"
                      name="price"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={handleChange}
                      required
                    />
                    {errors.price && <div className="invalid-feedback">{errors.price}</div>}
                  </div>
                  <div className="col-md-4 mb-4">
                    <label htmlFor="compare_price" className="form-label font-medium text-gray-700">Compare Price (KES)</label>
                    <input
                      type="number"
                      className={`form-control ${errors.compare_price ? 'is-invalid' : ''} transition-all duration-300 focus:ring-2 focus:ring-primary`}
                      id="compare_price"
                      name="compare_price"
                      step="0.01"
                      min="0"
                      value={formData.compare_price}
                      onChange={handleChange}
                    />
                    {errors.compare_price && <div className="invalid-feedback">{errors.compare_price}</div>}
                  </div>
                  <div className="col-md-4 mb-4">
                    <label htmlFor="cost_price" className="form-label font-medium text-gray-700">Cost Price (KES)</label>
                    <input
                      type="number"
                      className={`form-control ${errors.cost_price ? 'is-invalid' : ''} transition-all duration-300 focus:ring-2 focus:ring-primary`}
                      id="cost_price"
                      name="cost_price"
                      step="0.01"
                      min="0"
                      value={formData.cost_price}
                      onChange={handleChange}
                    />
                    {errors.cost_price && <div className="invalid-feedback">{errors.cost_price}</div>}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-4">
                    <label htmlFor="sku" className="form-label font-medium text-gray-700">SKU</label>
                    <input
                      type="text"
                      className={`form-control ${errors.sku ? 'is-invalid' : ''} transition-all duration-300 focus:ring-2 focus:ring-primary`}
                      id="sku"
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                      placeholder="Stock Keeping Unit"
                    />
                    {errors.sku && <div className="invalid-feedback">{errors.sku}</div>}
                  </div>
                  <div className="col-md-6 mb-4">
                    <label htmlFor="barcode" className="form-label font-medium text-gray-700">Barcode</label>
                    <input
                      type="text"
                      className={`form-control ${errors.barcode ? 'is-invalid' : ''} transition-all duration-300 focus:ring-2 focus:ring-primary`}
                      id="barcode"
                      name="barcode"
                      value={formData.barcode}
                      onChange={handleChange}
                      placeholder="Product barcode"
                    />
                    {errors.barcode && <div className="invalid-feedback">{errors.barcode}</div>}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-4">
                    <label htmlFor="quantity" className="form-label font-medium text-gray-700">Quantity</label>
                    <input
                      type="number"
                      className={`form-control ${errors.quantity ? 'is-invalid' : ''} transition-all duration-300 focus:ring-2 focus:ring-primary`}
                      id="quantity"
                      name="quantity"
                      min="0"
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                    />
                    {errors.quantity && <div className="invalid-feedback">{errors.quantity}</div>}
                  </div>
                  <div className="col-md-6 mb-4">
                    <label htmlFor="category_id" className="form-label font-medium text-gray-700">
                      Category
                      {categoriesLoading && <span className="text-muted ms-2">(Loading...)</span>}
                    </label>
                    <select
                      className={`form-select ${errors.category_id ? 'is-invalid' : ''} transition-all duration-300 focus:ring-2 focus:ring-primary`}
                      id="category_id"
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleChange}
                      required
                      disabled={categoriesLoading}
                    >
                      <option value="">
                        {categoriesLoading ? 'Loading categories...' : 'Select a category'}
                      </option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {errors.category_id && <div className="invalid-feedback">{errors.category_id}</div>}
                    {categories.length === 0 && !categoriesLoading && (
                      <div className="mt-2">
                        <small className="text-muted">
                          No categories found.
                          <button
                            type="button"
                            className="btn btn-link btn-sm p-0 ms-1 text-primary hover:text-primary-dark transition-colors"
                            onClick={createDefaultCategories}
                          >
                            Create default categories
                          </button>
                        </small>
                      </div>
                    )}
                  </div>
                </div>

                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="is_featured"
                        name="is_featured"
                        checked={formData.is_featured}
                        onChange={handleChange}
                      />
                      <label className="form-check-label font-medium text-gray-700" htmlFor="is_featured">Featured Product</label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="is_active"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleChange}
                      />
                      <label className="form-check-label font-medium text-gray-700" htmlFor="is_active">Active Product</label>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="main_image" className="form-label font-medium text-gray-700">Main Image</label>
                  <input
                    type="file"
                    className={`form-control ${errors.main_image ? 'is-invalid' : ''} transition-all duration-300`}
                    id="main_image"
                    name="main_image"
                    accept="image/*"
                    onChange={handleMainImageChange}
                    required
                  />
                  {errors.main_image && <div className="invalid-feedback">{errors.main_image}</div>}
                  {mainImage && (
                    <div className="mt-3 p-2 bg-gray-100 rounded shadow-sm">
                      <img
                        src={URL.createObjectURL(mainImage)}
                        alt="Main Preview"
                        className="rounded"
                        style={{ maxWidth: '250px', maxHeight: '250px', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label htmlFor="additional_images" className="form-label font-medium text-gray-700">Additional Images</label>
                  <input
                    type="file"
                    className="form-control transition-all duration-300"
                    id="additional_images"
                    name="additional_images"
                    accept="image/*"
                    multiple
                    onChange={handleAdditionalImagesChange}
                  />
                  <div className="d-flex flex-wrap mt-3 gap-2">
                    {additionalImages.map((image, index) => (
                      <div key={index} className="position-relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          className="rounded shadow-sm"
                          style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                        />
                        <button
                          type="button"
                          className="btn btn-danger btn-sm position-absolute top-0 end-0 translate-middle rounded-circle"
                          onClick={() => removeAdditionalImage(index)}
                          title="Remove image"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="d-flex justify-content-between mt-5">
                  <button
                    type="button"
                    className="btn btn-outline-secondary hover:bg-gray-100 transition-all duration-300"
                    onClick={() => navigate('/admin')}
                    disabled={loading}
                  >
                    <FaTimes className="me-2" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary hover:bg-primary-dark transition-all duration-300 shadow-md hover:shadow-lg"
                    disabled={loading || categoriesLoading}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    ) : (
                      <FaSave className="me-2" />
                    )}
                    Save Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductForm;