import React, { useState, useEffect } from 'react';
import { FaShoppingCart, FaBars, FaTimes, FaUserCircle, FaSun, FaMoon, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Navbar.css';

const Navbar = () => {
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [isCartLoading, setIsCartLoading] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme) {
      setIsDarkTheme(savedTheme === 'dark');
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (prefersDark) {
      setIsDarkTheme(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      setIsDarkTheme(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    const checkAuthStatus = async () => {
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (userData && token) {
        try {
          setUser(JSON.parse(userData));
          setIsCartLoading(true);
          const response = await axios.get('https://saraicollection.pythonanywhere.com/api/cart', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setCartCount(response.data?.items?.length || 0);
        } catch (err) {
          console.error('Error fetching cart:', err);
          if (err.response?.status === 401) {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            setUser(null);
            setCartCount(0);
          } else {
            setCartCount(0); // Fallback for empty or invalid response
          }
        } finally {
          setIsCartLoading(false);
        }
      } else {
        setCartCount(0);
      }
    };

    const handleCartUpdate = async (e) => {
      const newCount = Number(e.detail?.count);
      if (newCount >= 0) {
        setCartCount(newCount);
        return;
      }

      const token = localStorage.getItem('token');
      if (token) {
        try {
          setIsCartLoading(true);
          const response = await axios.get('https://saraicollection.pythonanywhere.com/api/cart', {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log('Navbar cart API response:', response.data); // Debug
          setCartCount(response.data?.items?.length || 0);
        } catch (err) {
          console.error('Error fetching cart on update:', err);
          setCartCount(0);
        } finally {
         setIsCartLoading(false);
        }
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    checkAuthStatus();

    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'token') {
        checkAuthStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);
  const handleProfileToggle = () => setIsProfileOpen(!isProfileOpen);
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setCartCount(0);
    window.location.href = '/signin';
  };

  const toggleTheme = () => {
    const newTheme = !isDarkTheme;
    setIsDarkTheme(newTheme);
    const theme = newTheme ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-black sticky-top navbar-sarai">
      <div className="container">
        <Link className="navbar-brand sarai-logo" to="/">
          Sarai Collection
        </Link>
        <button
          className="navbar-toggler gold-border"
          type="button"
          onClick={handleNavCollapse}
          aria-label="Toggle navigation"
        >
          {isNavCollapsed ? <FaBars className="gold-icon" /> : <FaTimes className="gold-icon" />}
        </button>

        <div className={`${isNavCollapsed ? 'collapse' : ''} navbar-collapse`}>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link gold-hover" aria-current="page" to="/">Home</Link>
            </li>
            <li className="nav-item dropdown">
              <Link className="nav-link dropdown-toggle gold-hover" to="/ladies" id="ladiesDropdown">
                Ladies Wear
              </Link>
              <ul className="dropdown-menu gold-dropdown" aria-labelledby="ladiesDropdown">
                <li><Link className="dropdown-item" to="/ladies/dresses">bags</Link></li>
                <li><Link className="dropdown-item" to="/ladies/tops">shoes</Link></li>
                <li><Link className="dropdown-item" to="/ladies/bottoms">Bottoms</Link></li>
                <li><Link className="dropdown-item" to="/ladies/evening">Evening Wear</Link></li>
              </ul>
            </li>
            <li className="nav-item dropdown">
              <Link className="nav-link dropdown-toggle gold-hover" to="/men" id="menDropdown">
                Men
              </Link>
              <ul className="dropdown-menu gold-dropdown" aria-labelledby="menDropdown">
                <li><Link className="dropdown-item" to="/men/shirts">Shirts</Link></li>
                <li><Link className="dropdown-item" to="/men/pants">Pants</Link></li>
                <li><Link className="dropdown-item" to="/men/suits">Suits</Link></li>
                <li><Link className="dropdown-item" to="/men/casual">Casual Wear</Link></li>
              </ul>
            </li>
            <li className="nav-item dropdown">
              <Link className="nav-link dropdown-toggle gold-hover" to="/kids" id="kidsDropdown">
                Kids
              </Link>
              <ul className="dropdown-menu gold-dropdown" aria-labelledby="kidsDropdown">
                <li><Link className="dropdown-item" to="/kids/boys">Boys</Link></li>
                <li><Link className="dropdown-item" to="/kids/girls">Girls</Link></li>
                <li><Link className="dropdown-item" to="/kids/babies">Babies</Link></li>
              </ul>
            </li>
            <li className="nav-item dropdown">
              <Link className="nav-link dropdown-toggle gold-hover" to="/shoes" id="shoesDropdown">
                Shoes
              </Link>
              <ul className="dropdown-menu gold-dropdown" aria-labelledby="shoesDropdown">
                <li><Link className="dropdown-item" to="/shoes/women">Women's Shoes</Link></li>
                <li><Link className="dropdown-item" to="/shoes/men">Men's Shoes</Link></li>
                <li><Link className="dropdown-item" to="/shoes/kids">Kids' Shoes</Link></li>
                <li><Link className="dropdown-item" to="/shoes/designer">Designer Collection</Link></li>
              </ul>
            </li>
            <li className="nav-item">
              <Link className="nav-link gold-hover" to="/collections">Collections</Link>
            </li>
          </ul>

          <div className="d-flex align-items-center">
            <button
              className="theme-toggle-btn me-3"
              onClick={toggleTheme}
              title={`Switch to ${isDarkTheme ? 'light' : 'dark'} theme`}
              aria-label={`Switch to ${isDarkTheme ? 'light' : 'dark'} theme`}
            >
              {isDarkTheme ? <FaSun className="gold-icon" /> : <FaMoon className="gold-icon" />}
            </button>

            <Link to="/cart" className="btn gold-btn-outline me-3 position-relative" aria-label="View cart">
              {isCartLoading ? <FaSpinner className="animate-spin" /> : <FaShoppingCart />}
              {cartCount > 0 && !isCartLoading && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-gold text-warning">
                  {cartCount}
                </span>
              )}
            </Link>
            {user ? (
              <div className="dropdown">
                <button
                  className="btn gold-btn-outline dropdown-toggle d-flex align-items-center"
                  onClick={handleProfileToggle}
                  aria-label="User profile"
                >
                  {user.profilePhoto ? (
                    <img
                      src={user.profilePhoto}
                      alt="Profile"
                      className="rounded-circle me-2 profile-img"
                    />
                  ) : (
                    <FaUserCircle className="me-2 gold-icon" size={20} />
                  )}
                  {user.username || user.email}
                </button>
                <div className={`dropdown-menu gold-dropdown ${isProfileOpen ? 'show' : ''}`} style={{ right: 0, left: 'auto' }}>
                  <Link className="dropdown-item" to="/profile">Profile</Link>
                  <Link className="dropdown-item" to="/orders">My Orders</Link>
                  <Link className="dropdown-item" to="/wishlist">Wishlist</Link>
                  {user.is_admin && (
                    <Link className="dropdown-item" to="/admin">Admin Dashboard</Link>
                  )}
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item gold-text" onClick={handleLogout}>Logout</button>
                </div>
              </div>
            ) : (
              <>
                <Link to="/signin" className="btn gold-btn-outline me-2">Sign In</Link>
                <Link to="/signup" className="btn gold-btn">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;