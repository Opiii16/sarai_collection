import React from 'react';
import { Link } from 'react-router-dom';
import './CategoriesSection.css';


const categories = [
  { id: 1, name: 'Ladies', slug: 'ladies', image: '/assets/images/ladies1.jpeg' },
  { id: 2, name: 'Kids', slug: 'kids', image: '/assets/images/kids1.jpeg' },
  { id: 3, name: 'Shoes', slug: 'shoes', image: '/assets/images/sports1.jpeg' },
  { id: 4, name: 'Bags', slug: 'bags', image: '/assets/images/bag9.jpeg' },
];

const CategoriesSection = () => {
  return (
    <section className="py-5">
      <div className="container">
        <h2 className="text-center mb-5 fw-bold">Shop by Category</h2>
        <div className="row row-cols-2 row-cols-md-4 g-4">
          {categories.map(category => (
            <div className="col" key={category.id}>
              <Link 
                to={`/categories/${category.slug}`} 
                className="text-decoration-none text-dark"
              >
                <div className="card border-0 shadow-sm h-100">
                  <img 
                    src={category.image} 
                    className="card-img-top" 
                    alt={category.name}
                    style={{ height: '150px', objectFit: 'cover' }}
                  />
                  <div className="card-body text-center">
                    <h5 className="card-title">{category.name}</h5>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;