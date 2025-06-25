import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FaShoppingBag, 
  FaCalendarAlt, 
  FaTruck,
  FaMapMarkerAlt,
  FaCreditCard,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner
} from 'react-icons/fa';
import './OrderDetails.css';

const OrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please login to view order details');
          setLoading(false);
          return;
        }

        const response = await axios.get(`https://saraicollection.pythonanywhere.com/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setOrder(response.data);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError(err.response?.data?.error || 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <FaCheckCircle className="text-success" />;
      case 'pending':
        return <FaSpinner className="text-warning spin" />;
      case 'failed':
      case 'cancelled':
        return <FaTimesCircle className="text-danger" />;
      case 'shipped':
        return <FaTruck className="text-info" />;
      default:
        return <FaShoppingBag />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <div className="text-center">
          <FaSpinner className="animate-spin" size={32} />
          <p className="mt-2">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger text-center">
        {error}
        {!localStorage.getItem('token') && (
          <div className="mt-2">
            <Link to="/signin" className="btn btn-primary">Sign In</Link>
          </div>
        )}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-5">
        <FaShoppingBag size={48} className="mb-3 text-muted" />
        <h4>Order not found</h4>
        <p className="text-muted">We couldn't find the order you're looking for.</p>
        <Link to="/orders" className="btn btn-primary">Back to Orders</Link>
      </div>
    );
  }

  return (
    <div className="order-details-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Order #{order.order_number}</h2>
        <div className="d-flex align-items-center">
          {getStatusIcon(order.status)}
          <span className="ms-2 text-capitalize">{order.status}</span>
        </div>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-header bg-dark text-white">
              <h5 className="mb-0">Order Items</h5>
            </div>
            <div className="card-body">
              {order.items && order.items.length > 0 ? (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map(item => (
                        <tr key={item.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              {item.product_image && (
                                <img 
                                  src={item.product_image} 
                                  alt={item.product_name} 
                                  className="me-3" 
                                  style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                />
                              )}
                              <div>
                                <h6 className="mb-0">{item.product_name}</h6>
                                <small className="text-muted">SKU: {item.sku || 'N/A'}</small>
                              </div>
                            </div>
                          </td>
                          <td>KSh {item.product_price?.toLocaleString() || '0.00'}</td>
                          <td>{item.quantity}</td>
                          <td>KSh {(item.product_price * item.quantity)?.toLocaleString() || '0.00'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No items found in this order</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-header bg-dark text-white">
              <h5 className="mb-0">Order Summary</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <h6>
                  <FaCalendarAlt className="me-2" />
                  Order Date
                </h6>
                <p>{formatDate(order.created_at)}</p>
              </div>

              <div className="mb-3">
                <h6>
                  <FaMapMarkerAlt className="me-2" />
                  Shipping Address
                </h6>
                <p>{order.shipping_address || 'Not specified'}</p>
              </div>

              <div className="mb-3">
                <h6>
                  <FaCreditCard className="me-2" />
                  Payment Method
                </h6>
                <p>M-Pesa</p>
              </div>

              <hr />

              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>KSh {order.subtotal?.toLocaleString() || '0.00'}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping:</span>
                <span>KSh {order.shipping_amount?.toLocaleString() || '0.00'}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Tax:</span>
                <span>KSh {order.tax_amount?.toLocaleString() || '0.00'}</span>
              </div>
              <div className="d-flex justify-content-between fw-bold">
                <span>Total:</span>
                <span>KSh {order.total_amount?.toLocaleString() || '0.00'}</span>
              </div>
            </div>
          </div>

          <Link to="/orders" className="btn btn-outline-secondary w-100">
            Back to Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;