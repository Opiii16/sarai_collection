import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min.js'
import HomePage from './components/Homepage/Homepage.jsx';
import Signin from './components/Signin';
import Signup from './components/Signup';
import AboutUs from './components/AboutUs/AboutUs.jsx'
import Products from './components/Products/Products.jsx'
import Makepayment from './components/Makepayment/Makepayment.jsx'
import PaymentSuccess from './components/Makepayment/PaymentSuccess.jsx'
import Footer from './components/Footer.jsx';
import Cart from './components/Cart/Cart.jsx';

function App() {
  return (
    <Router>
      <div className="app-container">
       
        <main className="app-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<Footer/>} />
            <Route path="/about-us" element={<AboutUs/>} />

            <Route path="/products" element={<Products/>} />


            <Route path="/cart" element={<Cart/>} />
            <Route path="/make-payment" element={<Makepayment/>} />
            <Route path="/payment-success" element={<PaymentSuccess/>} />
            


            

          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
