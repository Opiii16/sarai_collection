import React from 'react'
import './Carousel.css'
import { Link } from 'react-router-dom'

const Carousel = () => {
  return (
    <div className='justify-content-center mx-3'>
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
              <img src="/assets/images/hero-carousel-1.png" alt="Luxury fashion collection" />
              <div className="carousel-container">
                <h2>Elevate Your Essence</h2>
                <p>Discover curated elegance that speaks to your individuality. Our premium collection blends timeless sophistication with contemporary flair, creating pieces that don't just adorn but transform.</p>
                <Link to="/women" className="btn-get-started">Shop The Collection</Link>
              </div>
            </div>

            <div className="carousel-item">
              <img src="/assets/images/hero-carousel-2.jpg" alt="Modern style essentials" />
              <div className="carousel-container">
                <h2>Where Comfort Meets Couture</h2>
                <p>Redefine everyday luxury with our effortless styles. Designed for the dynamic visionary, each piece offers unparalleled comfort without compromising on statement-making appeal.</p>
                <Link to="/children" className="btn-get-started">Explore New Arrivals</Link>
              </div>
            </div>

            <div className="carousel-item">
              <img src="/assets/images/hero-carousel-3.jpg" alt="Bold fashion statements" />
              <div className="carousel-container">
                <h2>Dare to Be Distinct</h2>
                <p>For those who command attention. Our boldest creations are for the fashion vanguard—pieces that don't whisper but declare, crafted for impact and designed to inspire.</p>
                <Link to="/men" className="btn-get-started">Make Your Statement</Link>
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
    </div>
  )
}

export default Carousel