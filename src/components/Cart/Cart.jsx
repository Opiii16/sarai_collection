import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaShoppingCart, FaPlus, FaMinus } from 'react-icons/fa';
import axios from 'axios';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Cart.css';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);

  const navigate = useNavigate();

  const calculateTotals = useCallback(() => {
    const newSubtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const newShipping = newSubtotal > 1000 ? 0 : 49.99;
    const newTax = newSubtotal * 0.1;
    const newTotal = newSubtotal + newShipping + newTax;

    setSubtotal(newSubtotal);
    setShipping(newShipping);
    setTax(newTax);
    setTotal(newTotal);
  }, [cartItems]);

  const fetchCartItems = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setCartItems([]);
        setLoading(false);
        navigate('/signin');
        return;
      }

      const response = await axios.get(
        'https://saraicollection.pythonanywhere.com/api/cart',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setCartItems(response.data.items || []);
    } catch (err) {
      console.error('Error fetching cart items:', err);
      setError(err.response?.data?.error || 'Failed to load cart items');
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/signin');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  useEffect(() => {
    calculateTotals();
  }, [cartItems, calculateTotals]);

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
  
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to update cart', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        navigate('/signin');
        return;
      }
  
      const formData = new FormData();
      formData.append('quantity', newQuantity);
  
      await axios.put(
        `https://saraicollection.pythonanywhere.com/api/cart/${itemId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
  
      setCartItems(cartItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
  
      toast.success('Cart updated successfully', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (err) {
      console.error('Error updating cart:', err);
      if (err.response?.status === 401) {
        toast.error('Session expired. Please login again.', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/signin');
      } else {
        toast.error(err.response?.data?.error || 'Failed to update cart', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    }
  };

  const removeItem = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to update cart', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        navigate('/signin');
        return;
      }

      await axios.delete(
        `https://saraicollection.pythonanywhere.com/api/cart/${itemId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setCartItems(cartItems.filter(item => item.id !== itemId));
      toast.success('Item removed from cart', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (err) {
      console.error('Error removing item:', err);
      if (err.response?.status === 401) {
        toast.error('Session expired. Please login again.', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/signin');
      } else {
        toast.error(err.response?.data?.error || 'Failed to remove item', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    }
  };

  const getImageUrl = (item) => {
    if (item.product_image) {
      return `https://saraicollection.pythonanywhere.com/static/images/${item.product_image}`;
    }
    return '/assets/images/def.png';
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Cannot proceed to checkout with an empty cart', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }
    navigate('/payment');
  };

  if (loading) {
    return (
      <div className="d-flex flex-column min-vh-100 bg-dark text-light">
        <Navbar />
        <main className="flex-grow-1 d-flex justify-content-center align-items-center">
          <div>Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex flex-column min-vh-100 bg-dark text-light">
        <Navbar />
        <main className="flex-grow-1 d-flex justify-content-center align-items-center">
          <div className="alert alert-danger">{error}</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100 bg-dark text-light">
      <Navbar />

      <main className="flex-grow-1 py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <div className="card bg-dark border-danger shadow-sm mb-4">
                <div className="card-body">
                  <h2 className="fw-bold mb-4 text-danger">
                    <FaShoppingCart className="me-2" />
                    Your Cart ({cartItems.length})
                  </h2>

                  {cartItems.length === 0 ? (
                    <div className="text-center py-5">
                      <h4 className="mb-3">Your cart is empty</h4>
                      <Link to="/" className="btn btn-danger px-4 py-2">
                        Continue Shopping
                      </Link>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-dark table-hover">
                        <thead>
                          <tr className="border-danger">
                            <th>Product</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Total</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {cartItems.map(item => (
                            <tr key={item.id} className="border-danger">
                              <td>
                                <div className="d-flex align-items-center">
                                  <img
                                    src={getImageUrl(item)}
                                    alt={item.product_name}
                                    className="rounded me-3 border border-danger"
                                    style={{ width: '70px', height: '70px', objectFit: 'cover' }}
                                    onError={(e) => {
                                      e.target.src = '/assets/images/def.png';
                                      e.target.className = 'rounded me-3 border border-danger';
                                      e.target.style = 'width: 70px; height: 70px; object-fit: contain; padding: 5px;';
                                    }}
                                  />
                                  <div>
                                    <h6 className="mb-0">{item.product_name}</h6>
                                    <small className="text-muted">{item.category_name}</small>
                                  </div>
                                </div>
                              </td>
                              <td>KES {item.price.toLocaleString()}</td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  >
                                    <FaMinus size={12} />
                                  </button>
                                  <span className="mx-2">{item.quantity}</span>
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  >
                                    <FaPlus size={12} />
                                  </button>
                                </div>
                              </td>
                              <td>KES {(item.price * item.quantity).toLocaleString()}</td>
                              <td>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => removeItem(item.id)}
                                >
                                  <FaTrash />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              <div className="d-flex justify-content-between mb-4">
                <Link to="/" className="btn btn-outline-danger px-4 py-2">
                  Continue Shopping
                </Link>
                <button
                  className="btn btn-outline-danger px-4 py-2"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear your cart?')) {
                      cartItems.forEach(item => removeItem(item.id));
                    }
                  }}
                  disabled={cartItems.length === 0}
                >
                  Clear Cart
                </button>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card bg-dark border-danger shadow-sm ">
                <div className="card-body">
                  <h3 className="fw-bold mb-4 text-danger">Order Summary</h3>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Subtotal</span>
                      <span>KES {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Shipping</span>
                      <span>KES {shipping.toLocaleString()}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-3">
                      <span>Tax (10%)</span>
                      <span>KES {tax.toLocaleString()}</span>
                    </div>

                    <hr className="border-danger" />

                    <div className="d-flex justify-content-between fw-bold">
                      <span className="text-danger">Total</span>
                      <span className="text-danger">KES {total.toLocaleString()}</span>
                    </div>
                  </div>
                  <button
                    className="btn btn-danger w-100 py-2 fw-bold"
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;