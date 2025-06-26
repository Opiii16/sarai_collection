import React from 'react';
import './Kids.css';
import Navbar from '../Navbar/Navbar';

const KidsCollection = () => {

  return (

    <div className="kids-collection">
      <Navbar />
      <header className="collection-header">
        <h1>SARAI KIDS</h1>
        <p className="tagline">Where Little Personalities Shine Bright</p>
        <div className="age-buttons">
          <button className="age-btn active">0-3 Years</button>
          <button className="age-btn">4-8 Years</button>
          <button className="age-btn">9-12 Years</button>
        </div>
      </header>
      
      
      <section className="hero-banner">
        <div className="hero-text">
          <h2>ADORABLE MEETS STYLISH</h2>
          <p>Quality fabrics for happy, playful adventures</p>
          <button className="shop-now">SHOP KIDS</button>
        </div>
      </section>
      
      <section className="featured-categories">
        <h2 className="section-title">MUST-HAVE CATEGORIES</h2>
        <div className="categories-grid">
          <div className="category-card">
            <div className="category-image everyday-play"></div>
            <h3>Everyday Play</h3>
            <p>Comfy styles for playground adventures</p>
          </div>
          
          <div className="category-card">
            <div className="category-image special-occasions"></div>
            <h3>Special Moments</h3>
            <p>Dressy outfits for memorable occasions</p>
          </div>
          
          <div className="category-card">
            <div className="category-image seasonal-faves"></div>
            <h3>Seasonal Favorites</h3>
            <p>Weather-appropriate cuteness</p>
          </div>
          
          <div className="category-card">
            <div className="category-image matching-sets"></div>
            <h3>Twinning Styles</h3>
            <p>Coordinated sibling outfits</p>
          </div>
        </div>
      </section>
      
      <section className="parent-favorites">
        <h2 className="section-title">PARENT APPROVED FAVORITES</h2>
        <div className="favorites-grid">
          <div className="favorite-item">
            <div className="favorite-img stain-resistant"></div>
            <h4>Stain-Resistant Fabrics</h4>
            <p>Because messes happen</p>
          </div>
          <div className="favorite-item">
            <div className="favorite-img adjustable"></div>
            <h4>Adjustable Waistbands</h4>
            <p>Grows with your child</p>
          </div>
          <div className="favorite-item">
            <div className="favorite-img organic"></div>
            <h4>Organic Cotton</h4>
            <p>Gentle on delicate skin</p>
          </div>
        </div>
      </section>
      
      <section className="testimonial">
        <blockquote>
          "Sarai Kids outfits get the most compliments at the playground - and they 
          survive my toddler's nonstop adventures!"
        </blockquote>
        <p className="customer-name">- The Johnson Family</p>
      </section>
      
      <section className="size-guide">
        <div className="guide-content">
          <h3>STRESS-FREE SIZING</h3>
          <p>
            Our detailed size guide takes the guesswork out of shopping. Plus, 
            easy returns if you need to size up!
          </p>
          <button className="guide-btn">SIZE GUIDE</button>
        </div>
      </section>
      
      <section className="cta-section">
        <h2>JOIN OUR KIDS CLUB</h2>
        <p>Get 15% off your first order + seasonal sizing reminders</p>
        <button className="join-club">SIGN UP</button>
      </section>
      
      <footer className="collection-footer">
        <p>Follow our cute crew: @SaraiKids</p>
        <p>#SaraiKids #MiniFashionistas</p>
      </footer>
    </div>
  );
};

export default KidsCollection;