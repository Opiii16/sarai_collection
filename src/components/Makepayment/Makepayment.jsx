import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaLock,  FaMobileAlt, FaSpinner } from 'react-icons/fa';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer';

const MakePayment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [processing, setProcessing] = useState(false);
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0
  });

  useEffect(() => {
    const fetchCartAndTotals = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Please login to proceed with payment');
          navigate('/signin');
          return;
        }

        const response = await axios.get(
          'https://saraicollection.pythonanywhere.com/api/cart',
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setCartItems(response.data.items || []);

        // Calculate totals
        const subtotal = response.data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = subtotal > 1000 ? 0 : 49.99;
        const tax = subtotal * 0.1;
        const total = subtotal + shipping + tax;

        setOrderSummary({
          subtotal,
          shipping,
          tax,
          total
        });

      } catch (err) {
        console.error('Error fetching cart:', err);
        toast.error(err.response?.data?.error || 'Failed to load payment details');
      } finally {
        setLoading(false);
      }
    };

    fetchCartAndTotals();
  }, [navigate]);

  const handlePayment = async () => {
    if (!phoneNumber && paymentMethod === 'mpesa') {
      toast.error('Please enter your phone number');
      return;
    }

    setProcessing(true);

    try {
      const token = localStorage.getItem('token');
      const payload = {
        payment_method: paymentMethod,
        phone_number: paymentMethod === 'mpesa' ? phoneNumber : null,
        amount: orderSummary.total
      };

      const response = await axios.post(
        'https://saraicollection.pythonanywhere.com/api/orders/create',
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Payment initiated successfully!');
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { count: 0 } }));
      navigate('/order-confirmation', { state: { orderId: response.data.order_id } });
    } catch (err) {
      console.error('Payment error:', err);
      toast.error(err.response?.data?.error || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex flex-column bg-dark text-gold">
        <Navbar />
        <main className="flex-grow-1 d-flex justify-content-center align-items-center">
          <FaSpinner className="animate-spin me-2" size={24} />
          <span>Loading payment details...</span>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex flex-column bg-dark text-gold">
      <Navbar />
      
      <main className="flex-grow-1 py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="card bg-dark-2 border-gold shadow-lg mb-4">
                <div className="card-body p-4">
                  <h2 className="fw-bold mb-4 text-gold">Complete Your Purchase</h2>
                  
                  <div className="row">
                    <div className="col-md-7">
                      <div className="mb-4">
                        <h4 className="text-gold mb-3">Payment Method</h4>
                        
                        <div className="form-check bg-dark-3 p-3 rounded mb-3">
                          <input
                            className="form-check-input"
                            type="radio"
                            id="mpesa"
                            checked={paymentMethod === 'mpesa'}
                            onChange={() => setPaymentMethod('mpesa')}
                          />
                          <label className="form-check-label d-flex align-items-center" htmlFor="mpesa">
                            <FaMobileAlt className="text-gold me-2" size={20} />
                            <span>M-Pesa</span>
                          </label>
                          {paymentMethod === 'mpesa' && (
                            <div className="mt-2">
                              <label htmlFor="phone" className="form-label text-muted">Phone Number</label>
                              <input
                                type="text"
                                className="form-control bg-dark border-gold text-gold"
                                placeholder="e.g. 254712345678"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                              />
                              <small className="text-muted">You'll receive a payment request on your phone</small>
                            </div>
                          )}
                        </div>
                        
                        {/* <div className="form-check bg-dark-3 p-3 rounded">
                          <input
                            className="form-check-input"
                            type="radio"
                            id="card"
                            checked={paymentMethod === 'card'}
                            onChange={() => setPaymentMethod('card')}
                          />
                          <label className="form-check-label d-flex align-items-center" htmlFor="card">
                            <FaCreditCard className="text-gold me-2" size={20} />
                            <span>Credit/Debit Card</span>
                          </label>
                          {paymentMethod === 'card' && (
                            <div className="mt-3">
                              <div className="alert alert-warning bg-dark-2 border-gold text-gold">
                                You'll be redirected to our secure payment gateway
                              </div>
                            </div>
                          )}
                        </div> */}
                      </div>
                      
                      <div className="d-flex align-items-center text-muted mb-4">
                        <FaLock className="me-2" />
                        <small>Your payment is secure and encrypted</small>
                      </div>
                    </div>
                    
                    <div className="col-md-5">
                      <div className="card bg-dark-2 border-gold h-100">
                        <div className="card-body">
                          <h4 className="text-gold mb-3">Order Summary</h4>
                          
                          <div className="mb-3">
                            {cartItems.map(item => (
                              <div key={item.id} className="d-flex justify-content-between mb-2">
                                <span>
                                  {item.product_name} × {item.quantity}
                                </span>
                                <span>KES {(item.price * item.quantity).toLocaleString()}</span>
                              </div>
                            ))}
                            
                            <hr className="border-gold" />
                            
                            <div className="d-flex justify-content-between mb-2">
                              <span>Subtotal</span>
                              <span>KES {orderSummary.subtotal.toLocaleString()}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                              <span>Shipping</span>
                              <span>KES {orderSummary.shipping.toLocaleString()}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3">
                              <span>Tax (10%)</span>
                              <span>KES {orderSummary.tax.toLocaleString()}</span>
                            </div>
                            
                            <hr className="border-gold" />
                            
                            <div className="d-flex justify-content-between fw-bold fs-5">
                              <span>Total</span>
                              <span className="text-gold">KES {orderSummary.total.toLocaleString()}</span>
                            </div>
                          </div>
                          
                          <button
                            className="btn btn-gold w-100 py-3 fw-bold"
                            onClick={handlePayment}
                            disabled={processing || cartItems.length === 0}
                          >
                            {processing ? (
                              <>
                                <FaSpinner className="animate-spin me-2" />
                                Processing...
                              </>
                            ) : (
                              `Pay KES ${orderSummary.total.toLocaleString()}`
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
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

export default MakePayment;