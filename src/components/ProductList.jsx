import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import './ProductList.css'; // Optional: For styling the product list

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false); // State to toggle between limited and all products

  // Function to fetch products from the API
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://saraicollection.pythonanywhere.com/api/products/'); // Adjust API endpoint as needed
      const data = await response.json();
      setProducts(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load products. Please try again.');
      setLoading(false);
    }
  };

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle "View All" button click
  const handleViewAll = () => {
    setShowAll(true); // Show all products
  };

  // Optionally limit products displayed (e.g., show 6 products initially)
  const displayedProducts = showAll ? products : products.slice(0, 6);

  return (
    <div className="product-list-container">
      <h2>Our Products</h2>
      {loading && <p>Loading products...</p>}
      {error && <p className="error">{error}</p>}
      <div className="product-grid">
        {displayedProducts.length > 0 ? (
          displayedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          !loading && <p>No products available.</p>
        )}
      </div>
      {!showAll && products.length > 6 && (
        <button className="view-all-btn" onClick={handleViewAll}>
          View All
        </button>
      )}
    </div>
  );
};

export default ProductList;