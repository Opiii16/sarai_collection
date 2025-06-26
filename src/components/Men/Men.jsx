import React from 'react';  
import './Men.css';  
import Navbar from '../Navbar/Navbar';

const MenCollection = () => {  
  return (  
    <div className="men-collection">  
        <Navbar />  
      <header className="collection-header">  
        <h1>SARAI MEN</h1>  
        <p className="tagline">Redefining Masculine Elegance</p>  
      </header>  
      
      <section className="hero-banner">  
        <div className="hero-text">  
          <h2>ELEVATE YOUR EVERYDAY</h2>  
          <p>Premium craftsmanship meets urban sophistication</p>  
          <button className="shop-now">EXPLORE THE COLLECTION</button>  
        </div>  
      </section>  
      
      <section className="featured-categories">  
        <div className="category-card">  
          <div className="category-image tailored-suits"></div>  
          <h3>The Boardroom Edit</h3>  
          <p>Sharp suits that command respect</p>  
        </div>  
        
        <div className="category-card">  
          <div className="category-image streetwear"></div>  
          <h3>Street Cred</h3>  
          <p>Urban essentials with premium edge</p>  
        </div>  
        
        <div className="category-card">  
          <div className="category-image weekend-luxury"></div>  
          <h3>Weekend Luxury</h3>  
          <p>Elevated casual wear for the modern man</p>  
        </div>  
      </section>  
      
      <section className="trend-alert">  
        <h2>CURRENTLY CRUSHING IT</h2>  
        <div className="trend-items">  
          <div className="trend-item">  
            <div className="trend-img overshirts"></div>  
            <p>Luxury Overshirts</p>  
          </div>  
          <div className="trend-item">  
            <div className="trend-img tech-fabrics"></div>  
            <p>Performance Tech Fabrics</p>  
          </div>  
          <div className="trend-item">  
            <div className="trend-img monochrome"></div>  
            <p>Monochrome Everything</p>  
          </div>  
        </div>  
      </section>  
      
      <section className="style-tip">  
        <div className="tip-content">  
          <h3>PRO TIP: LAYER LIKE A BOSS</h3>  
          <p>  
            Master the art of layering with our lightweight knits and structured  
            outerwear. Mix textures for maximum impact.  
          </p>  
        </div>  
      </section>  
      
      <section className="testimonial">  
        <blockquote>  
          "Sarai Men's collection upgraded my entire wardrobe. I went from  
          'nice outfit' to 'damn, who's your stylist?' overnight."  
        </blockquote>  
        <p className="customer-name">- Kwame T., Entrepreneur</p>  
      </section>  
      
      <section className="cta-section">  
        <h2>READY TO UPGRADE YOUR STYLE DNA?</h2>  
        <p>Limited edition drops every first Friday of the month</p>  
        <button className="join-club">GET EARLY ACCESS</button>  
      </section>  
      
      <footer className="collection-footer">  
        <p>Follow us: @SaraiMen</p>  
        <p>#SaraiGent #WearTheStandard</p>  
      </footer>  
    </div>  
  );  
};  

export default MenCollection;  