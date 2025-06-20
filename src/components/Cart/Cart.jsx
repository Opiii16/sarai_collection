import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer';
import { FaTrash, FaPlus, FaMinus, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);

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

  useEffect(() => {
    fetchCartItems();
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [cartItems, calculateTotals]);

  const fetchCartItems = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
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
      }
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to update cart');
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

      toast.success('Cart updated successfully');
    } catch (err) {
      console.error('Error updating cart:', err);
      toast.error(err.response?.data?.error || 'Failed to update cart');
    }
  };

  const removeItem = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to update cart');
        return;
      }

      await axios.delete(
        `https://saraicollection.pythonanywhere.com/api/cart/${itemId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setCartItems(cartItems.filter(item => item.id !== itemId));

      toast.success('Item removed from cart');
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (err) {
      console.error('Error removing item:', err);
      toast.error(err.response?.data?.error || 'Failed to remove item');
    }
  };

  const getImageUrl = (item) => {
    if (item.product_image) {
      return `https://saraicollection.pythonanywhere.com/static/images/${item.product_image}`;
    }
    return '/assets/images/placeholder.jpeg';
  };

  if (loading) {
    return (
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <main className="flex-grow-1 d-flex justify-content-center align-items-center">
          <FaSpinner className="animate-spin" size={32} />
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <main className="flex-grow-1 d-flex justify-content-center align-items-center">
          <div className="alert alert-danger">{error}</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      <main className="flex-grow-1 py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <div className="card shadow-sm mb-4">
                <div className="card-body">
                  <h2 className="fw-bold mb-4">Your Cart ({cartItems.length})</h2>

                  {cartItems.length === 0 ? (
                    <div className="text-center py-5">
                      <h4 className="mb-3">Your cart is empty</h4>
                      <Link to="/" className="btn btn-primary">
                        Continue Shopping
                      </Link>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Total</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {cartItems.map(item => (
                            <tr key={item.id}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <img
                                    src={getImageUrl(item)}
                                    alt={item.product_name}
                                    className="rounded me-3"
                                    style={{ width: '70px', height: '70px', objectFit: 'cover' }}
                                  />
                                  <div>
                                    <h6 className="mb-0">{item.product_name}</h6>
                                  </div>
                                </div>
                              </td>
                              <td>KES {item.price.toLocaleString()}</td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <button
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  >
                                    <FaMinus size={12} />
                                  </button>
                                  <span className="mx-2">{item.quantity}</span>
                                  <button
                                    className="btn btn-sm btn-outline-secondary"
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

              <div className="d-flex justify-content-between mb-4 ">
                <Link to="/" className="btn btn-outline-primary  px-5 py-4">
                  Continue Shopping
                </Link>
                <button
                  className="btn btn-outline-danger  px-5 py-3"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear your cart?')) {
                      cartItems.forEach(item => removeItem(item.id));
                    }
                  }}
                >
                  Clear Cart
                </button>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card shadow-sm" style={{ top: '20px' }}>
                <div className="card-body">
                  <h3 className="fw-bold mb-4">Order Summary</h3>

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

                    <hr />

                    <div className="d-flex justify-content-between fw-bold">
                      <span>Total</span>
                      <span>KES {total.toLocaleString()}</span>
                    </div>
                  </div>

                  <Link to="/make-payment">
                    <button
                      className="btn btn-primary w-100 py-3 fw-bold"
                      disabled={cartItems.length === 0}
                    >
                      Proceed to Checkout
                    </button>
                  </Link>
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
