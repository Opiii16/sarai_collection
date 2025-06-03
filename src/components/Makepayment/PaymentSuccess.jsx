import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaShoppingBag, FaCalendarAlt, FaMapMarkerAlt, FaCreditCard } from 'react-icons/fa';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderData = location.state?.order || {
    orderId: 'SC-123456',
    date: new Date().toLocaleDateString(),
    total: 0,
    items: [],
    shippingAddress: 'Nairobi, Kenya',
    paymentMethod: 'M-Pesa'
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-dark text-light">
      <Navbar />
      
      <main className="flex-grow-1 py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="card bg-dark-2 border-gold shadow-lg mb-4">
                <div className="card-body p-4 text-center">
                  <div className="success-icon mb-4">
                    <FaCheckCircle className="text-gold" size={80} />
                  </div>
                  
                  <h1 className="text-gold fw-bold mb-3">Payment Successful!</h1>
                  <p className="lead mb-4">Thank you for your order with Sarai Collection</p>
                  
                  <div className="order-summary bg-dark-3 p-4 rounded mb-4 text-start">
                    <h4 className="text-gold mb-3">Order Details</h4>
                    
                    <div className="d-flex align-items-center mb-2">
                      <FaShoppingBag className="text-gold me-3" size={20} />
                      <div>
                        <span className="text-muted">Order Number:</span>
                        <span className="ms-2 fw-bold">{orderData.orderId}</span>
                      </div>
                    </div>
                    
                    <div className="d-flex align-items-center mb-2">
                      <FaCalendarAlt className="text-gold me-3" size={20} />
                      <div>
                        <span className="text-muted">Date:</span>
                        <span className="ms-2 fw-bold">{orderData.date}</span>
                      </div>
                    </div>
                    
                    <div className="d-flex align-items-center mb-2">
                      <FaCreditCard className="text-gold me-3" size={20} />
                      <div>
                        <span className="text-muted">Payment Method:</span>
                        <span className="ms-2 fw-bold">{orderData.paymentMethod}</span>
                      </div>
                    </div>
                    
                    <div className="d-flex align-items-center mb-3">
                      <FaMapMarkerAlt className="text-gold me-3" size={20} />
                      <div>
                        <span className="text-muted">Shipping To:</span>
                        <span className="ms-2 fw-bold">{orderData.shippingAddress}</span>
                      </div>
                    </div>
                    
                    <hr className="border-gold" />
                    
                    <div className="d-flex justify-content-between fw-bold fs-5">
                      <span>Total Paid:</span>
                      <span className="text-gold">KES {orderData.total.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="order-items mb-4">
                    <h4 className="text-gold mb-3">Items Ordered</h4>
                    {orderData.items?.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-dark table-borderless">
                          <thead>
                            <tr className="border-bottom border-gold">
                              <th>Item</th>
                              <th>Quantity</th>
                              <th>Price</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orderData.items.map((item, index) => (
                              <tr key={index}>
                                <td>{item.product_name}</td>
                                <td>{item.quantity}</td>
                                <td>KES {(item.price * item.quantity).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="alert alert-dark border-gold">
                        No items found in this order
                      </div>
                    )}
                  </div>
                  
                  <div className="d-flex flex-column flex-md-row justify-content-center gap-3">
                    <button 
                      className="btn btn-gold px-4 py-2"
                      onClick={() => navigate('/products')}
                    >
                      Continue Shopping
                    </button>
                    <button 
                      className="btn btn-outline-gold px-4 py-2"
                      onClick={() => navigate('/orders')}
                    >
                      View Order History
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="card bg-dark-2 border-gold shadow-sm mt-4">
                <div className="card-body p-4">
                  <h4 className="text-gold mb-3">What's Next?</h4>
                  <div className="row">
                    <div className="col-md-4 mb-3 mb-md-0">
                      <div className="d-flex">
                        <div className="me-3 text-gold">1</div>
                        <div>
                          <h6 className="text-gold">Order Processing</h6>
                          <p className="small text-muted mb-0">
                            We're preparing your items for shipment
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4 mb-3 mb-md-0">
                      <div className="d-flex">
                        <div className="me-3 text-gold">2</div>
                        <div>
                          <h6 className="text-gold">Shipping</h6>
                          <p className="small text-muted mb-0">
                            Your order will be dispatched within 1-2 business days
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="d-flex">
                        <div className="me-3 text-gold">3</div>
                        <div>
                          <h6 className="text-gold">Delivery</h6>
                          <p className="small text-muted mb-0">
                            Expected delivery in 3-5 business days
                          </p>
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

export default PaymentSuccess;