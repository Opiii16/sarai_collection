import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaShoppingBag, FaCalendarAlt, FaMoneyBillWave, FaTruck, FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import './OrderHistory.css';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please login to view your orders');
          setLoading(false);
          return;
        }

        const response = await axios.get('https://saraicollection.pythonanywhere.com/api/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setOrders(response.data);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.response?.data?.error || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

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
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <div className="text-center">
          <FaSpinner className="animate-spin" size={32} />
          <p className="mt-2">Loading your orders...</p>
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

  if (orders.length === 0) {
    return (
      <div className="text-center py-5">
        <FaShoppingBag size={48} className="mb-3 text-muted" />
        <h4>No orders found</h4>
        <p className="text-muted">You haven't placed any orders yet.</p>
        <Link to="/products" className="btn btn-primary">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="order-history-container">
      <h2 className="mb-4">Your Order History</h2>
      
      <div className="table-responsive">
        <table className="table table-hover">
          <thead className="table-dark">
            <tr>
              <th>Order #</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>
                  <strong>{order.order_number}</strong>
                </td>
                <td>
                  <div className="d-flex align-items-center">
                    <FaCalendarAlt className="me-2" />
                    {formatDate(order.created_at)}
                  </div>
                </td>
                <td>
                  {order.items?.length || 'N/A'}
                </td>
                <td>
                  <div className="d-flex align-items-center">
                    <FaMoneyBillWave className="me-2" />
                    KSh {order.total_amount?.toLocaleString() || '0.00'}
                  </div>
                </td>
                <td>
                  <div className="d-flex align-items-center">
                    {getStatusIcon(order.status)}
                    <span className="ms-2 text-capitalize">{order.status}</span>
                  </div>
                </td>
                <td>
                  <Link 
                    to={`/orders/${order.id}`} 
                    className="btn btn-sm btn-outline-primary"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderHistory;