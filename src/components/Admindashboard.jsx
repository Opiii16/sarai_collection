import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaChartLine, FaUsers, FaBoxOpen } from 'react-icons/fa';
import { getProducts, deleteProduct, getOrders, getUsers } from '../services/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'products') {
          const data = await getProducts();
          setProducts(data);
        } else if (activeTab === 'orders') {
          const data = await getOrders();
          setOrders(data);
        } else if (activeTab === 'users') {
          const data = await getUsers();
          setUsers(data);
        }
      } catch (err) {
        setError(err.message);
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate('/signin');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [activeTab, navigate]);

  useEffect(() => {
    if (deleteSuccess) {
      const timer = setTimeout(() => {
        setDeleteSuccess(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [deleteSuccess]);

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        setProducts(products.filter(product => product.id !== id));
        setDeleteSuccess(true);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="d-flex min-vh-100">
      <div className="bg-dark text-white" style={{ width: '250px' }}>
        <div className="p-3">
          <h4 className="text-center mb-4">Admin Dashboard</h4>
          <ul className="nav nav-pills flex-column">
            <li className="nav-item">
              <button 
                className={`nav-link text-white ${activeTab === 'dashboard' ? 'active bg-primary' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <FaChartLine className="me-2" />
                Dashboard
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link text-white ${activeTab === 'products' ? 'active bg-primary' : ''}`}
                onClick={() => setActiveTab('products')}
              >
                <FaBoxOpen className="me-2" />
                Products
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link text-white ${activeTab === 'orders' ? 'active bg-primary' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <FaBoxOpen className="me-2" />
                Orders
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link text-white ${activeTab === 'users' ? 'active bg-primary' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                <FaUsers className="me-2" />
                Users
              </button>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="flex-grow-1 p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="text-capitalize">{activeTab}</h2>
          {activeTab === 'products' && (
            <Link to="/admin/products/new" className="btn btn-primary">
              <FaPlus className="me-2" />
              Add Product
            </Link>
          )}
        </div>
        
        {deleteSuccess && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            Product deleted successfully!
            <button
              type="button"
              className="btn-close"
              onClick={() => setDeleteSuccess(false)}
              aria-label="Close"
            ></button>
          </div>
        )}
        {error && <div className="alert alert-danger">{error}</div>}
        
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <div className="row">
                <div className="col-md-4 mb-4">
                  <div className="card bg-primary text-white">
                    <div className="card-body">
                      <h5 className="card-title">Total Products</h5>
                      <p className="card-text display-4">{products.length}</p>
                      <p className="card-text">All products in inventory</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 mb-4">
                  <div className="card bg-success text-white">
                    <div className="card-body">
                      <h5 className="card-title">Total Orders</h5>
                      <p className="card-text display-4">{orders.length}</p>
                      <p className="card-text">All customer orders</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 mb-4">
                  <div className="card bg-info text-white">
                    <div className="card-body">
                      <h5 className="card-title">Total Users</h5>
                      <p className="card-text display-4">{users.length}</p>
                      <p className="card-text">All registered users</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'products' && (
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Featured</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product.id}>
                        <td>{product.id}</td>
                        <td>
                          <img 
                            src={product.images?.[0]?.image_url 
                              ? `https://saraicollection.pythonanywhere.com/static/images/${product.images[0].image_url}` 
                              : '/placeholder-product.jpg'} 
                            alt={product.name}
                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                          />
                        </td>
                        <td>
                          <Link to={`/products/${product.id}`} className="text-decoration-none">
                            {product.name}
                          </Link>
                        </td>
                        <td>KES {product.price}</td>
                        <td>{product.quantity}</td>
                        <td>
                          {product.is_featured ? (
                            <span className="badge bg-success">Yes</span>
                          ) : (
                            <span className="badge bg-secondary">No</span>
                          )}
                        </td>
                        <td>
                          <Link 
                            to={`/admin/products/edit/${product.id}`}
                            className="btn btn-sm btn-outline-primary me-2"
                          >
                            <FaEdit />
                          </Link>
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteProduct(product.id)}
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
            
            {activeTab === 'orders' && (
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td>{order.order_number}</td>
                        <td>{new Date(order.created_at).toLocaleDateString()}</td>
                        <td>{order.user?.username || 'Guest'}</td>
                        <td>${order.total_amount}</td>
                        <td>
                          <span className={`badge ${
                            order.status === 'completed' ? 'bg-success' :
                            order.status === 'pending' ? 'bg-warning' :
                            'bg-secondary'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td>
                          <Link 
                            to={`/admin/orders/${order.id}`}
                            className="btn btn-sm btn-outline-primary"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {activeTab === 'users' && (
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>
                          {user.is_admin ? (
                            <span className="badge bg-danger">Admin</span>
                          ) : (
                            <span className="badge bg-primary">User</span>
                          )}
                        </td>
                        <td>{new Date(user.created_at).toLocaleDateString()}</td>
                        <td>
                          <Link 
                            to={`/admin/users/${user.id}`}
                            className="btn btn-sm btn-outline-primary"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;