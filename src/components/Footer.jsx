import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="sarai-footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">Sarai Collection</h3>
            <p className="footer-text">Luxurious fashion that embodies elegance and sophistication for the modern woman.</p>
            <div className="social-icons">
              <a href="https://www.facebook.com/saraicollection" target="_blank" rel="noopener noreferrer" className="social-icon">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://www.instagram.com/saraicollection" target="_blank" rel="noopener noreferrer" className="social-icon">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://www.twitter.com/saraicollection" target="_blank" rel="noopener noreferrer" className="social-icon">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://www.pinterest.com/saraicollection" target="_blank" rel="noopener noreferrer" className="social-icon">
                <i className="fab fa-pinterest-p"></i>
              </a>
            </div>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><a href="/">Home</a></li>
              <li><a href="/collections">Collections</a></li>
              <li><a href="/about">About Us</a></li>
              <li><a href="/blog">Blog</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-heading">Customer Care</h4>
            <ul className="footer-links">
              <li><a href="/contact">Contact Us</a></li>
              <li><a href="/faq">FAQs</a></li>
              <li><a href="/shipping">Shipping & Returns</a></li>
              <li><a href="/size-guide">Size Guide</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4 className="footer-heading">Contact Info</h4>
            <p className="footer-text">
              <i className="fas fa-map-marker-alt"></i> 123 Luxury Avenue, Fashion District<br />
              New York, NY 10001<br />
              <i className="fas fa-phone"></i> +1 (555) 123-4567<br />
              <i className="fas fa-envelope"></i> info@saraicollection.com
            </p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Sarai Collection. All rights reserved.</p>
          <div className="payment-methods">
            <i className="fab fa-cc-visa"></i>
            <i className="fab fa-cc-mastercard"></i>
            <i className="fab fa-cc-amex"></i>
            <i className="fab fa-cc-paypal"></i>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;