import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaPlus, FaMinus, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const defaultImage = '/assets/images/def.png';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showQuantityControls, setShowQuantityControls] = useState(false);

  const {
    id = 0,
    name = 'Product Name',
    price = 0,
    compare_price = 0,
    category_name = 'Uncategorized',
    short_description = '',
    description = '',
    is_featured = false,
    images = [],
    stock_quantity = null // Add this if available from your API
  } = product || {};

  const imageUrl = images.length > 0 
    ? `https://saraicollection.pythonanywhere.com/static/images/${images[0].image_url}`
    : defaultImage;

  const formatPrice = (amount) => {
    return parseFloat(amount || 0).toFixed(2);
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && (stock_quantity === null || newQuantity <= stock_quantity)) {
      setQuantity(newQuantity);
    }
  };

const handleAddToCart = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    toast.error('Please login to add items to cart');
    navigate('/signin');
    return;
  }

  setIsAddingToCart(true);
  const formData = new FormData();
  formData.append('product_id', id);
  formData.append('quantity', quantity);

  try {
    await axios.post(
      'https://saraicollection.pythonanywhere.com/api/cart/add',
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    const response = await axios.get('https://saraicollection.pythonanywhere.com/api/cart', {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Cart API response:', response.data); // Debug
    const newCartCount = response.data?.items?.length || 0;

    toast.success(`${quantity} ${name}${quantity > 1 ? 's' : ''} added to cart`);
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { count: newCartCount } }));
    
    setShowQuantityControls(false);
    setQuantity(1);
  } catch (err) {
    console.error('Add to cart error:', err);
    if (err.response?.status === 401) {
      toast.error('Session expired. Please login again.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/signin');
    } else if (err.response?.status === 405) {
      toast.error('Server configuration error. Please contact support.');
    } else {
      toast.error(err.response?.data?.error || 'Failed to add to cart');
    }
  } finally {
    setIsAddingToCart(false);
  }
};

  const toggleQuantityControls = () => {
    setShowQuantityControls(!showQuantityControls);
    if (!showQuantityControls) {
      setQuantity(1); // Reset quantity when showing controls
    }
  };

  return (
    <div className="card h-100 border-0 shadow-sm position-relative">
      <div className="position-relative" style={{ height: '200px', overflow: 'hidden' }}>
        <img 
          src={imageUrl}
          alt={name}
          className="w-100 h-100 object-fit-cover"
          onError={(e) => {
            e.target.src = defaultImage;
            e.target.className = 'w-100 h-100 object-fit-contain p-3';
          }}
          loading="lazy"
        />
        {is_featured && (
          <span className="position-absolute top-0 start-0 bg-danger text-white px-2 py-1 small">
            Featured
          </span>
        )}
        {stock_quantity !== null && stock_quantity <= 5 && stock_quantity > 0 && (
          <span className="position-absolute top-0 end-0 bg-warning text-dark px-2 py-1 small">
            Only {stock_quantity} left
          </span>
        )}
        {stock_quantity === 0 && (
          <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50">
            <span className="badge bg-secondary fs-6">Out of Stock</span>
          </div>
        )}
      </div>
      
      <div className="card-body">
        <div className="d-flex justify-content-between mb-2">
          <span className="badge bg-secondary">{category_name}</span>
        </div>
        
        <h5 className="card-title">
          <Link to={`/products/${id}`} className="text-decoration-none text-dark">
            {name}
          </Link>
        </h5>
        
        <p className="card-text text-muted small mb-2">
          {short_description || `${description.substring(0, 60)}...`}
        </p>
        
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div>
            <span className="fw-bold text-primary">
              KES {formatPrice(price)}
            </span>
            {compare_price > price && (
              <span className="text-muted text-decoration-line-through ms-2">
                KES {formatPrice(compare_price)}
              </span>
            )}
          </div>
        </div>

        {/* Quantity Controls and Add to Cart */}
        <div className="mt-auto">
          {!showQuantityControls ? (
            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-outline-danger flex-grow-1"
                onClick={toggleQuantityControls}
                disabled={stock_quantity === 0}
              >
                <FaShoppingCart className="me-1" />
                Add to Cart
              </button>
            </div>
          ) : (
            <div className="d-flex flex-column gap-2">
              {/* Quantity Selector */}
              <div className="d-flex align-items-center justify-content-center bg-light rounded p-2">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  style={{ width: '32px', height: '32px' }}
                >
                  <FaMinus size={10} />
                </button>
                <span className="mx-3 fw-bold" style={{ minWidth: '30px', textAlign: 'center' }}>
                  {quantity}
                </span>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => handleQuantityChange(1)}
                  disabled={stock_quantity !== null && quantity >= stock_quantity}
                  style={{ width: '32px', height: '32px' }}
                >
                  <FaPlus size={10} />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="d-flex gap-2">
                <button
                  className="btn btn-sm btn-secondary flex-grow-1"
                  onClick={toggleQuantityControls}
                  disabled={isAddingToCart}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-sm btn-danger flex-grow-1"
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || stock_quantity === 0}
                >
                  {isAddingToCart ? (
                    <>
                      <FaSpinner className="fa-spin me-1" />
                      Adding...
                    </>
                  ) : (
                    <>
                      Add ({quantity})
                    </>
                  )}
                </button>
              </div>

              {/* Total Price Display */}
              {quantity > 1 && (
                <div className="text-center">
                  <small className="text-muted">
                    Total: <span className="fw-bold">KES {formatPrice(price * quantity)}</span>
                  </small>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;