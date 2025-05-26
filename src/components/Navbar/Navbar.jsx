import React, { useContext, useEffect, useState } from "react";
import { StoreContext } from "../../context/StoreContext";
import "./Navbar.css";
import { assets } from "../../assets/assets";
import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ setShowLogin, setIsSignUp, refreshTrigger }) => {
  const { getTotalQuantity, foodList, addToCart } = useContext(StoreContext);
  const totalQuantity = getTotalQuantity();
  const navigate = useNavigate();

  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState({});
  const [menu, setMenu] = useState("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State to control menu visibility
  const [searchQuery, setSearchQuery] = useState(""); // State for search input
  const [filteredFoods, setFilteredFoods] = useState([]); // State to store filtered food items

  // Check if the user is logged in
  const checkLoggedIn = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setLoggedIn(true);
    } else {
      setLoggedIn(false);
      setUser({});
    }
  };

  useEffect(() => {
    checkLoggedIn();
  }, [refreshTrigger]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    setLoggedIn(false);
    setUser({});
    navigate("/");
  };

  // Handle cart click for unauthenticated users
  const handleCartClick = () => {
    if (!loggedIn) {
      setShowLogin(true); // Show login popup
    } else {
      navigate("/cart"); // Navigate to cart if logged in
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    // Filter food items based on the search query
    if (query.trim()) {
      const filtered = foodList.filter((food) =>
        food.name.toLowerCase().includes(query)
      );
      setFilteredFoods(filtered);
    } else {
      setFilteredFoods([]); // Clear filtered results if the query is empty
    }
  };

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${searchQuery}`);
    }
  };

  // Handle click on a search result item
  const handleSearchResultClick = (food) => {
    if (!loggedIn) {
      setShowLogin(true); // Show login popup if user is not logged in
    } else {
      addToCart(food); // Add the selected item to the cart
      setSearchQuery(""); // Clear the search query
      setFilteredFoods([]); // Clear the filtered results
    }
  };

  // Toggle menu visibility
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="navbar">
      {/* Hamburger Menu Icon */}
      <div className="hamburger-menu" onClick={toggleMenu}>
        ☰
      </div>

      {/* Logo */}
      <Link to="/">
        <img src={assets.logo} alt="Company Logo" className="logo" />
      </Link>

      {/* Search Bar (Visible only when logged in) */}
      {loggedIn && (
        <div className="search-container">
          <form className="search-bar" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Search for food..."
              value={searchQuery}
              onChange={handleSearchChange} // onChange function for dynamic filtering
            />
            <button type="submit">
              <img src={assets.search_icon} alt="Search" className="search-icon" />
            </button>
          </form>

          {/* Display filtered food items below the search bar */}
          {searchQuery && (
            <div className="search-results">
              {filteredFoods.length > 0 ? (
                filteredFoods.map((food) => (
                  <div
                    key={food.id}
                    className="search-result-item"
                    onClick={() => handleSearchResultClick(food)} // Add the selected item to the cart
                  >
                    {food.name}
                  </div>
                ))
              ) : (
                <div className="no-results">No results found</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Navbar Menu */}
      <ul className={`navbar-menu ${isMenuOpen ? "active" : ""}`}>
        <Link
          to="/"
          onClick={() => {
            setMenu("home");
            setIsMenuOpen(false); // Close menu after clicking a link
          }}
          className={menu === "home" ? "active" : ""}
        >
          Home
        </Link>
        <a
          href="#explore-menu"
          onClick={() => {
            setMenu("menu");
            setIsMenuOpen(false);
          }}
          className={menu === "menu" ? "active" : ""}
        >
          Menu
        </a>
        <a
          href="#app-download"
          onClick={() => {
            setMenu("mobile-app");
            setIsMenuOpen(false);
          }}
          className={menu === "mobile-app" ? "active" : ""}
        >
          Mobile App
        </a>
        <a
          href="#footer"
          onClick={() => {
            setMenu("contact-us");
            setIsMenuOpen(false);
          }}
          className={menu === "contact-us" ? "active" : ""}
        >
          Contact Us
        </a>
      </ul>

      {/* Navbar Right Section */}
      <div className="navbar-right">
        {/* Cart Icon (Visible only when logged in and on larger screens) */}
        {loggedIn && (
          <div className="navbar-basket-icon" onClick={handleCartClick}>
            <img src={assets.basket_icon} alt="Cart" />
            {totalQuantity > 0 && <div className="dot">{totalQuantity}</div>}
          </div>
        )}

        {/* Auth Buttons (Visible only when not logged in and on larger screens) */}
        {!loggedIn && (
          <div className="auth-buttons">
            <button
              className="sign-in-button"
              onClick={() => {
                setShowLogin(true); // Show login popup
                setIsSignUp(false); // Ensure it's the login form
              }}
              aria-label="Sign In"
            >
              Sign In
            </button>
            <button
              className="sign-up-button"
              onClick={() => {
                setShowLogin(true); // Show login popup
                setIsSignUp(true); // Ensure it's the signup form
              }}
              aria-label="Sign Up"
            >
              Sign Up
            </button>
          </div>
        )}

        {/* User Section (Visible only when logged in and on larger screens) */}
        {loggedIn && (
          <div className="navbar-user">
            <p className="welcome-message">
              Welcome, <span className="username">{user?.username || "User"}</span>
            </p>
            <button
              className="logout-button"
              onClick={handleLogout}
              aria-label="Logout"
              title="Logout"
            >
              <img src={assets.logout_icon} alt="Logout" className="logout-icon" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>

      {/* Dropdown Menu for Small Screens */}
      <div className={`dropdown-menu ${isMenuOpen ? "active" : ""}`}>
        {/* Auth Buttons in Dropdown (for small screens) */}
        {!loggedIn && (
          <>
            <button
              className="dropdown-button"
              onClick={() => {
                setShowLogin(true); // Show login popup
                setIsSignUp(false); // Ensure it's the login form
                setIsMenuOpen(false); // Close the menu
              }}
            >
              Sign In
            </button>
            <button
              className="dropdown-button"
              onClick={() => {
                setShowLogin(true); // Show login popup
                setIsSignUp(true); // Ensure it's the signup form
                setIsMenuOpen(false); // Close the menu
              }}
            >
              Sign Up
            </button>
          </>
        )}

        {/* Cart in Dropdown (for small screens) */}
        {loggedIn && (
          <div className="dropdown-button" onClick={handleCartClick}>
            <img src={assets.basket_icon} alt="Cart" />
            {totalQuantity > 0 && <div className="dot">{totalQuantity}</div>}
          </div>
        )}

        {/* Logout in Dropdown (for small screens) */}
        {loggedIn && (
          <button
            className="dropdown-button"
            onClick={() => {
              handleLogout();
              setIsMenuOpen(false); // Close the menu
            }}
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;