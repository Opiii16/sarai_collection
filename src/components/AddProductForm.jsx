import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSave, FaTimes } from 'react-icons/fa';
import axios from 'axios';

const AddProductForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    compare_price: '',
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
  const [error, setError] = useState(null);
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
      
      // If no categories exist, you can create default ones
      if (response.data.length === 0) {
        console.log('No categories found. Consider creating default categories.');
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories. Please refresh the page.');
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Function to create default categories (call this if needed)
  const createDefaultCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('https://saraicollection.pythonanywhere.com/api/categories/setup', {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      // Refresh categories after creation
      fetchCategories();
    } catch (err) {
      console.error('Error creating default categories:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleMainImageChange = (e) => {
    if (e.target.files[0]) {
      setMainImage(e.target.files[0]);
    }
  };

  const handleAdditionalImagesChange = (e) => {
    if (e.target.files) {
      setAdditionalImages([...e.target.files]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate category selection
    if (!formData.category_id) {
      setError('Please select a category');
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      
      // Append all form data
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      // Append main image
      if (mainImage) {
        formDataToSend.append('main_image', mainImage);
      }

      // Append additional images
      additionalImages.forEach((image, index) => {
        formDataToSend.append(`additional_images`, image);
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
      setError(err.response?.data?.error || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">Add New Product</h3>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger d-flex justify-content-between align-items-center">
                  <span>{error}</span>
                  {error.includes('Failed to load categories') && (
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      onClick={fetchCategories}
                    >
                      Retry
                    </button>
                  )}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Product Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="price" className="form-label">Price</label>
                    <input
                      type="number"
                      className="form-control"
                      id="price"
                      name="price"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="compare_price" className="form-label">Compare Price (Original Price)</label>
                    <input
                      type="number"
                      className="form-control"
                      id="compare_price"
                      name="compare_price"
                      step="0.01"
                      min="0"
                      value={formData.compare_price}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="quantity" className="form-label">Quantity</label>
                    <input
                      type="number"
                      className="form-control"
                      id="quantity"
                      name="quantity"
                      min="0"
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="category_id" className="form-label">
                      Category
                      {categoriesLoading && <span className="text-muted ms-2">(Loading...)</span>}
                    </label>
                    <select
                      className="form-select"
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
                    {categories.length === 0 && !categoriesLoading && (
                      <div className="mt-2">
                        <small className="text-muted">
                          No categories found. 
                          <button 
                            type="button" 
                            className="btn btn-link btn-sm p-0 ms-1"
                            onClick={createDefaultCategories}
                          >
                            Create default categories
                          </button>
                        </small>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="is_featured"
                      name="is_featured"
                      checked={formData.is_featured}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="is_featured">Featured Product</label>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="main_image" className="form-label">Main Image</label>
                  <input
                    type="file"
                    className="form-control"
                    id="main_image"
                    name="main_image"
                    accept="image/*"
                    onChange={handleMainImageChange}
                    required
                  />
                  {mainImage && (
                    <div className="mt-2">
                      <img 
                        src={URL.createObjectURL(mainImage)} 
                        alt="Preview" 
                        style={{ maxWidth: '200px', maxHeight: '200px' }}
                      />
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="additional_images" className="form-label">Additional Images</label>
                  <input
                    type="file"
                    className="form-control"
                    id="additional_images"
                    name="additional_images"
                    accept="image/*"
                    multiple
                    onChange={handleAdditionalImagesChange}
                  />
                  <div className="d-flex flex-wrap mt-2">
                    {additionalImages.map((image, index) => (
                      <img
                        key={index}
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        style={{ width: '100px', height: '100px', objectFit: 'cover', margin: '5px' }}
                      />
                    ))}
                  </div>
                </div>

                <div className="d-flex justify-content-between mt-4">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate('/admin')}
                    disabled={loading}
                  >
                    <FaTimes className="me-2" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || categoriesLoading}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
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