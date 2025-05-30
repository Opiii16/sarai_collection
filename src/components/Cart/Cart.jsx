import React, { useState, useEffect } from 'react';
import { FiX, FiPlus, FiMinus, FiShoppingCart } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import './Cart.css'; // Update the path as needed

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setCartItems([
      {
        id: 1,
        name: 'Gold Embellished Evening Gown',
        price: 299.99,
        quantity: 1,
        image: '/assets/images/kids1.jpeg',
        size: 'M',
      },
      {
        id: 2,
        name: 'Silk Satin Blouse',
        price: 149.99,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        size: 'S',
      },
    ]);
  }, []);

  const updateQuantity = (id, quantity) => {
    if (quantity < 1) return;
    setCartItems(prev =>
      prev.map(item => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const removeItem = id => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const shipping = 15.0;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <FiShoppingCart className="text-gray-800 text-2xl" />
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">Your Shopping Cart</h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow-sm">
            <p className="text-lg text-gray-600 mb-6">Your cart is currently empty.</p>
            <button
              onClick={() => navigate('/shop')}
              className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-md transition-colors duration-200"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              {cartItems.map(item => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row gap-4 items-start bg-white p-4 rounded-lg shadow-sm border border-gray-100"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full sm:w-32 h-32 object-cover rounded-md"
                  />
                  <div className="flex-1 w-full">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-lg font-medium text-gray-800">
                          {item.name}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Size: {item.size}</p>
                        <p className="text-base text-gray-800 font-medium mt-1">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <FiX size={18} />
                      </button>
                    </div>

                    <div className="flex items-center gap-4 mt-4">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        <FiMinus size={14} />
                      </button>
                      <span className="text-gray-800 w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        <FiPlus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Order Summary
              </h2>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-800">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-800">${shipping.toFixed(2)}</span>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-4 flex justify-between font-medium">
                <span className="text-gray-800">Total</span>
                <span className="text-gray-900">${total.toFixed(2)}</span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full mt-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-md transition-colors duration-200"
              >
                Proceed to Checkout
              </button>

              <button
                onClick={() => navigate('/shop')}
                className="w-full py-2.5 mt-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md transition-colors duration-200"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;