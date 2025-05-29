import React, { useEffect } from 'react';
import './Carousel.css';
import { Link } from 'react-router-dom';
// Import Bootstrap JS (make sure this is in your main index.js or App.js)
import 'bootstrap/dist/js/bootstrap.bundle.min';

const Carousel = () => {
  useEffect(() => {
    // Check if Bootstrap is available
    if (typeof window !== 'undefined' && window.bootstrap) {
      // Initialize carousel with auto-sliding
      const carouselElement = document.querySelector('#hero-carousel');
      if (carouselElement) {
        const carousel = new window.bootstrap.Carousel(carouselElement, {
          interval: 5000, // Slide every 5 seconds
          ride: 'carousel',
          pause: 'hover'
        });

        return () => {
          // Clean up
          carousel.dispose();
        };
      }
    }
  }, []);

  return (
    <div className='justify-content-center mx-0 mx-md-3'>
      {/* Hero Section */}
      <div id='hero' className="hero section bg-dark">
        {/* carousel div */}
        <div id="hero-carousel" className="carousel slide carousel-fade" data-bs-ride="carousel">
          {/* indicators */}
          <div className="carousel-indicators">
            <button type="button" data-bs-target="#hero-carousel" data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
            <button type="button" data-bs-target="#hero-carousel" data-bs-slide-to="1" aria-label="Slide 2"></button>
            <button type="button" data-bs-target="#hero-carousel" data-bs-slide-to="2" aria-label="Slide 3"></button>
          </div>

          {/* inner */}
          <div className="carousel-inner">
            <div className="carousel-item active">
              <div className="carousel-img-container">
                <img 
                  src="/assets/images/hero-carousel-1.png" 
                  alt="Luxury fashion collection" 
                  className="img-fluid d-block w-100"
                />
              </div>
              <div className="carousel-container">
                <h2 className="animate-slide-in-down">Elevate Your Essence</h2>
                <p className="animate-slide-in-up">Discover curated elegance that speaks to your individuality. Our premium collection blends timeless sophistication with contemporary flair, creating pieces that don't just adorn but transform.</p>
                <Link to="/women" className="btn-get-started animate-slide-in-up">Shop The Collection</Link>
              </div>
            </div>

            <div className="carousel-item">
              <div className="carousel-img-container">
                <img 
                  src="/assets/images/hero-carousel-2.jpeg" 
                  alt="Modern style essentials" 
                  className="img-fluid d-block w-100"
                />
              </div>
              <div className="carousel-container">
                <h2 className="animate-slide-in-down">Where Comfort Meets Couture</h2>
                <p className="animate-slide-in-up">Redefine everyday luxury with our effortless styles. Designed for the dynamic visionary, each piece offers unparalleled comfort without compromising on statement-making appeal.</p>
                <Link to="/children" className="btn-get-started animate-slide-in-up">Explore New Arrivals</Link>
              </div>
            </div>

            <div className="carousel-item">
              <div className="carousel-img-container">
                <img 
                  src="/assets/images/hero-carousel-3.jpeg" 
                  alt="Bold fashion statements" 
                  className="img-fluid d-block w-100"
                />
              </div>
              <div className="carousel-container">
                <h2 className="animate-slide-in-down">Dare to Be Distinct</h2>
                <p className="animate-slide-in-up">For those who command attention. Our boldest creations are for the fashion vanguard—pieces that don't whisper but declare, crafted for impact and designed to inspire.</p>
                <Link to="/men" className="btn-get-started animate-slide-in-up">Make Your Statement</Link>
              </div>
            </div>
          </div>

          <button className="carousel-control-prev" type="button" data-bs-target="#hero-carousel" data-bs-slide="prev">
            <span className="carousel-control-prev-icon bi bi-chevron-left" aria-hidden="true"></span>
            <span className="visually-hidden">Previous</span>
          </button>

          <button className="carousel-control-next" type="button" data-bs-target="#hero-carousel" data-bs-slide="next">
            <span className="carousel-control-next-icon bi bi-chevron-right" aria-hidden="true"></span>
            <span className="visually-hidden">Next</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Carousel;