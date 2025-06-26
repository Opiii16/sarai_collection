import React from 'react';
import './Ladies.css';
import Navbar from '../Navbar/Navbar';


const LadiesCollection = () => {
  return (
    <div className="ladies-collection">
      <Navbar />
      <header className="collection-header">
        <h1>SARAI COLLECTION</h1>
        <p className="tagline">Where Elegance Meets Edge</p>
      </header>
      
      <section className="hero-banner">
        <div className="hero-text">
          <h2>FALL IN LOVE WITH YOUR WARDROBE</h2>
          <p>Curated pieces for the bold, beautiful and unapologetically you</p>
          <button className="shop-now">SHOP THE COLLECTION</button>
        </div>
      </section>
      
      <section className="featured-categories">
        <div className="category-card">
          <div className="category-image cocktail-dresses"></div>
          <h3>Cocktail Hour</h3>
          <p>Dresses that turn heads and spark conversations</p>
        </div>
        
        <div className="category-card">
          <div className="category-image power-suits"></div>
          <h3>Boss Lady Essentials</h3>
          <p>Sharp suits and separates for women who run things</p>
        </div>
        
        <div className="category-card">
          <div className="category-image weekend-vibes"></div>
          <h3>Weekend Vibes</h3>
          <p>Effortlessly chic looks for your off-duty days</p>
        </div>
      </section>
      
      <section className="trend-alert">
        <h2>TREND ALERT: THE MUST-HAVES</h2>
        <div className="trend-items">
          <div className="trend-item">
            <div className="trend-img leather-trench"></div>
            <p>Faux Leather Trench Coats</p>
          </div>
          <div className="trend-item">
            <div className="trend-img statement-sleeves"></div>
            <p>Dramatic Statement Sleeves</p>
          </div>
          <div className="trend-item">
            <div className="trend-img metallic-accents"></div>
            <p>Metallic Accent Pieces</p>
          </div>
        </div>
      </section>
      
      <section className="testimonial">
        <blockquote>
          "I've never received so many compliments until I started wearing Sarai Collection. 
          Every piece makes me feel like the main character!"
        </blockquote>
        <p className="customer-name">- Amina K., Loyal Customer</p>
      </section>
      
      <section className="cta-section">
        <h2>READY TO ELEVATE YOUR STYLE GAME?</h2>
        <p>New arrivals drop every Thursday at 12PM EST</p>
        <button className="join-club">JOIN THE VIP CLUB</button>
      </section>
      
      <footer className="collection-footer">
        <p>Follow us: @SaraiCollection</p>
        <p>#SaraiGirl #WearTheConfidence</p>
      </footer>
    </div>
  );
};

export default LadiesCollection;