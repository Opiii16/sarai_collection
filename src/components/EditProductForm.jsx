import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaSave, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { getProduct } from '../services/api';

const EditProductForm = () => {
  const { id } = useParams();
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
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [productLoading, setProductLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false); // New state for success message
  const navigate = useNavigate();

  useEffect(() => {
    fetchProduct();
    fetchCategories();
  }, [id]);

  useEffect(() => {
    // Auto-dismiss success message after 3 seconds
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false);
        navigate('/admin'); // Navigate after success message
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  const fetchProduct = async () => {
    try {
      setProductLoading(true);
      const product = await getProduct(id);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        compare_price: product.compare_price,
        quantity: product.quantity,
        category_id: product.category_id,
        is_featured: product.is_featured,
        is_active: product.is_active
      });
      setExistingImages(product.images || []);
      setProductLoading(false);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product data');
      setProductLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await axios.get('https://saraicollection.pythonanywhere.com/api/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories. Please refresh the page.');
    } finally {
      setCategoriesLoading(false);
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

  const handleDeleteImage = (imageId, isExisting) => {
    if (isExisting) {
      setImagesToDelete([...imagesToDelete, imageId]);
      setExistingImages(existingImages.filter(img => img.id !== imageId));
    } else {
      setAdditionalImages(additionalImages.filter((_, index) => index !== imageId));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      
      // Append all form data
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      // Append images to delete
      imagesToDelete.forEach(id => {
        formDataToSend.append('images_to_delete[]', id);
      });

      // Append main image if changed
      if (mainImage) {
        formDataToSend.append('main_image', mainImage);
      }

      // Append additional images
      additionalImages.forEach((image) => {
        formDataToSend.append('additional_images', image);
      });

      const token = localStorage.getItem('token');
      const response = await axios.put(
        `https://saraicollection.pythonanywhere.com/api/products/${id}`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data && response.data.message) {
        setSuccess(true); // Show success message
      }
    } catch (err) {
      console.error('Error updating product:', err);
      setError(err.response?.data?.error || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  if (productLoading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading product data...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">Edit Product</h3>
            </div>
            <div className="card-body">
              {success && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                  Product updated successfully!
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setSuccess(false)}
                    aria-label="Close"
                  ></button>
                </div>
              )}
              {error && (
                <div className="alert alert-danger d-flex justify-content-between align-items-center">
                  <span>{error}</span>
                  <button 
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </button>
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
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
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
                  {existingImages.find(img => img.is_primary) && !mainImage && (
                    <div className="mb-2 position-relative">
                      <img 
                        src={existingImages.find(img => img.is_primary).image_url} 
                        alt="Current main" 
                        style={{ maxWidth: '200px', maxHeight: '200px' }}
                      />
                      <button
                        type="button"
                        className="btn btn-danger btn-sm position-absolute top-0 start-0"
                        onClick={() => handleDeleteImage(
                          existingImages.find(img => img.is_primary).id,
                          true
                        )}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    className="form-control"
                    id="main_image"
                    name="main_image"
                    accept="image/*"
                    onChange={handleMainImageChange}
                  />
                  {mainImage && (
                    <div className="mt-2">
                      <img 
                        src={URL.createObjectURL(mainImage)} 
                        alt="New main preview" 
                        style={{ maxWidth: '200px', maxHeight: '200px' }}
                      />
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label">Existing Additional Images</label>
                  <div className="d-flex flex-wrap">
                    {existingImages
                      .filter(img => !img.is_primary)
                      .map(image => (
                        <div key={image.id} className="position-relative me-2 mb-2">
                          <img
                            src={image.image_url}
                            alt={`Product ${image.id}`}
                            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                          />
                          <button
                            type="button"
                            className="btn btn-danger btn-sm position-absolute top-0 start-0"
                            onClick={() => handleDeleteImage(image.id, true)}
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="additional_images" className="form-label">Add More Images</label>
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
                      <div key={index} className="position-relative me-2 mb-2">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`New ${index + 1}`}
                          style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                        />
                        <button
                          type="button"
                          className="btn btn-danger btn-sm position-absolute top-0 start-0"
                          onClick={() => handleDeleteImage(index, false)}
                        >
                          Delete
                        </button>
                      </div>
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
                    Update Product
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

export default EditProductForm;