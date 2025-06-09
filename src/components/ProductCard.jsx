import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaStar, FaRegStar, FaShoppingCart, FaHeart, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import './ProductCard.css';

const ProductCard = ({ product, onCartUpdate }) => {
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);

  const {
    id = '',
    name = 'Sarai Collection Item',
    price = 0,
    compare_price = 0,
    rating = 0,
    category_name = 'Luxury',
    short_description = 'Elegant fashion piece from our exclusive collection',
    is_featured = false,
    images = [],
  } = product || {};

  const getImageUrl = () => {
    try {
      const primaryImage = images.find((img) => img?.is_primary) || images[0];
      if (primaryImage?.image_url) {
        return `https://saraicollection.pythonanywhere.com/static/images/${primaryImage.image_url}`;
      }
    } catch (e) {
      console.error('Error processing image:', e);
    }
    return '/assets/images/placeholder.jpeg';
  };

  const imageUrl = getImageUrl();

  const renderRating = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-gold" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStar key={i} className="text-gold" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-gold" />);
      }
    }
    return stars;
  };

  const handleAddToCart = async (e) => {
    e.preventDefault(); // Prevent default link behavior
    e.stopPropagation(); // Stop event bubbling
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/signin', { state: { from: 'cart' } });
        return;
      }

      setIsAdding(true);

      const formData = new FormData();
      formData.append('product_id', id);
      formData.append('quantity', '1');

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

      toast.success(`${name} added to cart!`);
      
      // Navigate to cart after adding
      navigate('/cart');

      // Trigger cart update for navbar badge
      if (onCartUpdate) {
        onCartUpdate();
      } else {
        const response = await axios.get('https://saraicollection.pythonanywhere.com/api/cart', {
          headers: { Authorization: `Bearer ${token}` },
        });
        window.dispatchEvent(
          new CustomEvent('cartUpdated', { detail: { count: response.data?.items?.length || 0 } })
        );
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      const errorMessage = err.response?.data?.error || 'Failed to add item to cart. Please try again.';
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/signin', { state: { from: 'cart' } });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="sarai-product-card" onClick={() => navigate(`/products/${id}`)}>
      <div className="card-image-container">
        <div
          className="card-image"
          style={{
            backgroundImage: imageUrl
              ? `linear-gradient(to bottom, rgba(26, 26, 26, 0.2), rgba(43, 32, 0, 0.7)), url(${imageUrl})`
              : 'linear-gradient(135deg, #1a1a1a 0%, #2b2000 50%, #1a1a1a 100%)',
          }}
        >
          {is_featured && <span className="featured-badge">Exclusive</span>}
          <button 
            className="wishlist-btn" 
            aria-label="Add to wishlist"
            onClick={(e) => {
              e.stopPropagation();
              // Add wishlist functionality here
            }}
          >
            <FaHeart />
          </button>
        </div>
      </div>

      <div className="card-details">
        <div className="category-rating">
          <span className="category">{category_name}</span>
          <div className="rating">{renderRating()}</div>
        </div>

        <h3 className="product-title">
          <Link to={`/products/${id}`} onClick={(e) => e.stopPropagation()}>{name}</Link>
        </h3>

        <p className="product-description">
          {short_description}
        </p>

        <div className="price-cart">
          <div className="price">
            <span className="current-price">KES {price.toLocaleString()}</span>
            {compare_price > price && (
              <span className="original-price">KES {compare_price.toLocaleString()}</span>
            )}
          </div>
          <button
            className="add-to-cart"
            onClick={(e) => handleAddToCart(e)}
            aria-label={`Add ${name} to cart`}
            disabled={isAdding}
          >
            {isAdding ? <FaSpinner className="animate-spin" /> : <FaShoppingCart />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;