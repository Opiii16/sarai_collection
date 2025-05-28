import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import { getFeaturedProducts } from '../services/api';
import ProductCard from '../ProductCard';
import Carousel from '../Carousel/Carousel';
import CategoriesSection from '../CategoriesSection';
// import Testimonials from './Testimonials';
// import Newsletter from './Newsletter';
import Footer from '../Footer';

const Homepage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getFeaturedProducts();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      
      <main className="flex-grow-1">
        {/* Hero Section */}
        <Carousel />
        
        {/* Featured Products */}
        <section className="py-5 bg-light">
          <div className="container">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="fw-bold">Featured Products</h2>
              <Link to="/products" className="btn btn-outline-primary">
                View All
              </Link>
            </div>
            
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : (
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
                {products.map(product => (
                  <div className="col" key={product.id}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
        
        {/* Categories Section */}
        <CategoriesSection />
        
        {/* Testimonials */}
        {/* <Testimonials /> */}
        
        {/* Newsletter */}
        {/* <Newsletter /> */}
      </main>
      
      <Footer />
    </div>
  );
};

export default Homepage;