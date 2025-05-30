import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaChartLine, 
  FaUsers, 
  FaBoxOpen, 
  FaShoppingBag,
  FaCrown,
  FaSignOutAlt
} from 'react-icons/fa';
import { getProducts, deleteProduct, getOrders, getUsers, getCurrentUser } from './services/api.js';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  // Check admin access on component mount
  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
        
        if (user.email !== 'saraicollection@gmail.com' && user.username !== 'Sarai') {
          navigate('/');
        }
      } catch (err) {
        navigate('/signin');
      }
    };
    
    checkAdminAccess();
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;
      
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
  }, [activeTab, navigate, currentUser]);

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        setProducts(products.filter(product => product.id !== id));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleLogout = () => {
    // Implement your logout logic here
    navigate('/signin');
  };

  if (!currentUser) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-dark">
        <div className="spinner-border text-gold" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex min-vh-100 bg-dark text-light">
      {/* Sidebar */}
      <div className="bg-black text-gold" style={{ width: '280px', borderRight: '1px solid #D4AF37' }}>
        <div className="p-4 text-center">
          {/* Using image URL instead of imported file */}
          <img 
            src="https://via.placeholder.com/150x60?text=Sarai+Collection" 
            alt="Sarai Collection Logo" 
            style={{ height: '60px', marginBottom: '20px' }} 
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src = 'https://via.placeholder.com/150x60?text=Sarai+Collection'
            }}
          />
          <h4 className="mb-4" style={{ color: '#D4AF37' }}>Admin Dashboard</h4>
          
          <div className="d-flex align-items-center justify-content-center mb-4 p-2" style={{ 
            backgroundColor: 'rgba(212, 175, 55, 0.1)', 
            borderRadius: '5px',
            border: '1px solid #D4AF37'
          }}>
            <FaCrown className="me-2" style={{ color: '#D4AF37' }} />
            <span>{currentUser.username}</span>
          </div>
          
          <ul className="nav nav-pills flex-column">
            <li className="nav-item mb-2">
              <button 
                className={`nav-link text-start w-100 d-flex align-items-center ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
                style={{
                  backgroundColor: activeTab === 'dashboard' ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
                  color: activeTab === 'dashboard' ? '#D4AF37' : '#fff',
                  border: activeTab === 'dashboard' ? '1px solid #D4AF37' : '1px solid transparent'
                }}
              >
                <FaChartLine className="me-2" />
                Dashboard
              </button>
            </li>
            <li className="nav-item mb-2">
              <button 
                className={`nav-link text-start w-100 d-flex align-items-center ${activeTab === 'products' ? 'active' : ''}`}
                onClick={() => setActiveTab('products')}
                style={{
                  backgroundColor: activeTab === 'products' ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
                  color: activeTab === 'products' ? '#D4AF37' : '#fff',
                  border: activeTab === 'products' ? '1px solid #D4AF37' : '1px solid transparent'
                }}
              >
                <FaBoxOpen className="me-2" />
                Products
              </button>
            </li>
            <li className="nav-item mb-2">
              <button 
                className={`nav-link text-start w-100 d-flex align-items-center ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
                style={{
                  backgroundColor: activeTab === 'orders' ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
                  color: activeTab === 'orders' ? '#D4AF37' : '#fff',
                  border: activeTab === 'orders' ? '1px solid #D4AF37' : '1px solid transparent'
                }}
              >
                <FaShoppingBag className="me-2" />
                Orders
              </button>
            </li>
            <li className="nav-item mb-2">
              <button 
                className={`nav-link text-start w-100 d-flex align-items-center ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
                style={{
                  backgroundColor: activeTab === 'users' ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
                  color: activeTab === 'users' ? '#D4AF37' : '#fff',
                  border: activeTab === 'users' ? '1px solid #D4AF37' : '1px solid transparent'
                }}
              >
                <FaUsers className="me-2" />
                Users
              </button>
            </li>
          </ul>
          
          <button 
            className="btn btn-outline-gold mt-4 w-100 d-flex align-items-center justify-content-center"
            onClick={handleLogout}
            style={{
              borderColor: '#D4AF37',
              color: '#D4AF37'
            }}
          >
            <FaSignOutAlt className="me-2" />
            Logout
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-grow-1 p-4" style={{ backgroundColor: '#121212' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="text-capitalize" style={{ color: '#D4AF37' }}>
            {activeTab === 'dashboard' ? 'Overview' : activeTab}
          </h2>
          {activeTab === 'products' && (
            <Link 
              to="/admin/products/new" 
              className="btn"
              style={{
                backgroundColor: '#D4AF37',
                color: '#000',
                fontWeight: 'bold'
              }}
            >
              <FaPlus className="me-2" />
              Add Product
            </Link>
          )}
        </div>
        
        {error && (
          <div className="alert alert-danger" style={{ 
            backgroundColor: 'rgba(220, 53, 69, 0.2)',
            borderColor: '#dc3545',
            color: '#fff'
          }}>
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-gold" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <div className="row">
                <div className="col-md-4 mb-4">
                  <div className="card h-100" style={{ 
                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                    border: '1px solid #D4AF37'
                  }}>
                    <div className="card-body">
                      <h5 className="card-title" style={{ color: '#D4AF37' }}>Total Products</h5>
                      <p className="card-text display-4" style={{ color: '#fff' }}>
                        {products.length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 mb-4">
                  <div className="card h-100" style={{ 
                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                    border: '1px solid #D4AF37'
                  }}>
                    <div className="card-body">
                      <h5 className="card-title" style={{ color: '#D4AF37' }}>Total Orders</h5>
                      <p className="card-text display-4" style={{ color: '#fff' }}>
                        {orders.length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 mb-4">
                  <div className="card h-100" style={{ 
                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                    border: '1px solid #D4AF37'
                  }}>
                    <div className="card-body">
                      <h5 className="card-title" style={{ color: '#D4AF37' }}>Total Users</h5>
                      <p className="card-text display-4" style={{ color: '#fff' }}>
                        {users.length}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Recent Orders */}
                <div className="col-12 mb-4">
                  <div className="card" style={{ 
                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                    border: '1px solid #D4AF37'
                  }}>
                    <div className="card-header" style={{ 
                      backgroundColor: 'rgba(212, 175, 55, 0.2)',
                      borderBottom: '1px solid #D4AF37',
                      color: '#D4AF37'
                    }}>
                      <h5>Recent Orders</h5>
                    </div>
                    <div className="card-body">
                      {orders.slice(0, 5).length > 0 ? (
                        <div className="table-responsive">
                          <table className="table table-dark table-hover">
                            <thead>
                              <tr>
                                <th>Order #</th>
                                <th>Date</th>
                                <th>Customer</th>
                                <th>Amount</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {orders.slice(0, 5).map(order => (
                                <tr key={order.id}>
                                  <td>{order.order_number}</td>
                                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                  <td>{order.user?.username || 'Guest'}</td>
                                  <td style={{ color: '#D4AF37' }}>${order.total_amount}</td>
                                  <td>
                                    <span className={`badge ${
                                      order.status === 'completed' ? 'bg-success' :
                                      order.status === 'pending' ? 'bg-warning' :
                                      'bg-secondary'
                                    }`}>
                                      {order.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-muted">No recent orders</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'products' && (
              <div className="card" style={{ 
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                border: '1px solid #D4AF37'
              }}>
                <div className="card-header" style={{ 
                  backgroundColor: 'rgba(212, 175, 55, 0.2)',
                  borderBottom: '1px solid #D4AF37',
                  color: '#D4AF37'
                }}>
                  <h5>Product Management</h5>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-dark table-hover">
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
                                src={product.images?.[0]?.image_url || 'https://via.placeholder.com/50x50?text=Product'} 
                                alt={product.name}
                                style={{ 
                                  width: '50px', 
                                  height: '50px', 
                                  objectFit: 'cover',
                                  border: '1px solid #D4AF37'
                                }}
                                onError={(e) => {
                                  e.target.onerror = null; 
                                  e.target.src = 'https://via.placeholder.com/50x50?text=Product'
                                }}
                              />
                            </td>
                            <td>
                              <Link 
                                to={`/products/${product.id}`} 
                                className="text-decoration-none"
                                style={{ color: '#D4AF37' }}
                              >
                                {product.name}
                              </Link>
                            </td>
                            <td style={{ color: '#D4AF37' }}>${product.price}</td>
                            <td>{product.quantity}</td>
                            <td>
                              {product.is_featured ? (
                                <span className="badge" style={{ backgroundColor: '#D4AF37', color: '#000' }}>Yes</span>
                              ) : (
                                <span className="badge bg-secondary">No</span>
                              )}
                            </td>
                            <td>
                              <Link 
                                to={`/admin/products/edit/${product.id}`}
                                className="btn btn-sm me-2"
                                style={{ 
                                  backgroundColor: 'rgba(212, 175, 55, 0.2)',
                                  border: '1px solid #D4AF37',
                                  color: '#D4AF37'
                                }}
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
                </div>
              </div>
            )}
            
            {activeTab === 'orders' && (
              <div className="card" style={{ 
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                border: '1px solid #D4AF37'
              }}>
                <div className="card-header" style={{ 
                  backgroundColor: 'rgba(212, 175, 55, 0.2)',
                  borderBottom: '1px solid #D4AF37',
                  color: '#D4AF37'
                }}>
                  <h5>Order Management</h5>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-dark table-hover">
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
                            <td style={{ color: '#D4AF37' }}>${order.total_amount}</td>
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
                                className="btn btn-sm"
                                style={{ 
                                  backgroundColor: 'rgba(212, 175, 55, 0.2)',
                                  border: '1px solid #D4AF37',
                                  color: '#D4AF37'
                                }}
                              >
                                View
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'users' && (
              <div className="card" style={{ 
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                border: '1px solid #D4AF37'
              }}>
                <div className="card-header" style={{ 
                  backgroundColor: 'rgba(212, 175, 55, 0.2)',
                  borderBottom: '1px solid #D4AF37',
                  color: '#D4AF37'
                }}>
                  <h5>User Management</h5>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-dark table-hover">
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
                                <span className="badge" style={{ backgroundColor: '#D4AF37', color: '#000' }}>Admin</span>
                              ) : (
                                <span className="badge bg-primary">User</span>
                              )}
                            </td>
                            <td>{new Date(user.created_at).toLocaleDateString()}</td>
                            <td>
                              <Link 
                                to={`/admin/users/${user.id}`}
                                className="btn btn-sm"
                                style={{ 
                                  backgroundColor: 'rgba(212, 175, 55, 0.2)',
                                  border: '1px solid #D4AF37',
                                  color: '#D4AF37'
                                }}
                              >
                                View
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;