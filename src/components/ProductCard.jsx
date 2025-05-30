import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaStar, FaRegStar, FaShoppingCart, FaHeart } from 'react-icons/fa';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const {
    id = '',
    name = 'Sarai Collection Item',
    price = 0,
    compare_price = 0,
    rating = 0,
    category_name = 'Luxury',
    short_description = 'Elegant fashion piece from our exclusive collection',
    is_featured = false,
    images = []
  } = product || {};

  const getImageUrl = () => {
    try {
      const primaryImage = images.find(img => img?.is_primary) || images[0];
      if (primaryImage?.image_url) {
        return `https://saraicollection.pythonanywhere.com/static/images/${primaryImage.image_url}`;
      }
    } catch (e) {
      console.error("Error processing image:", e);
    }
    return '';
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

  return (
    <div className="sarai-product-card">
      <div className="card-image-container">
        <div 
          className="card-image"
          style={{
            backgroundImage: imageUrl 
              ? `linear-gradient(to bottom, rgba(26, 26, 26, 0.2), rgba(43, 32, 0, 0.7)), url(${imageUrl})`
              : 'linear-gradient(135deg, #1a1a1a 0%, #2b2000 50%, #1a1a1a 100%)'
          }}
        >
          {is_featured && (
            <span className="featured-badge">Exclusive</span>
          )}
          <button className="wishlist-btn">
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
          <Link to={`/products/${id}`}>{name}</Link>
        </h3>

        <p className="product-description">
          {short_description || "Premium quality fabric with exquisite detailing"}
        </p>

        <div className="price-cart">
          <div className="price">
            <span className="current-price">KES {price.toLocaleString()}</span>
            {compare_price > price && (
              <span className="original-price">KES {compare_price.toLocaleString()}</span>
            )}
          </div>
          <button className="add-to-cart" onClick={() => navigate('/cart')}>
            <FaShoppingCart />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;