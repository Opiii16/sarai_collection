import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min.js'
import HomePage from './components/Homepage/Homepage.jsx';
import Signin from './components/Signin';
import Signup from './components/Signup';
import Admindashboard from './components/Admindashboard.jsx';
import AboutUs from './components/AboutUs/AboutUs.jsx'
import Carousel from './components/Carousel/Carousel.jsx'

import Makepayment from './components/Makepayment/Makepayment.jsx'
import PaymentSuccess from './components/Makepayment/PaymentSuccess.jsx'
import Footer from './components/Footer';
import Cart from './components/Cart/Cart.jsx';
import UserDetails from './components/UsersDetails.jsx';
import AddProductForm from './components/AddProductForm';
import EditProductForm from './components/EditProductForm.jsx';

function App() {
  return (
    <Router>
      <div className="app-container">


       
        <main className="app-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/admin" element={<Admindashboard/>} />
            <Route path="/" element={<Footer/>} />
            <Route path="/" element={<Carousel/>} />
            <Route path="/about-us" element={<AboutUs/>} />
            
            <Route path="/admin/users/:id" element={<UserDetails />} />
            <Route path="/cart" element={<Cart/>} />
            <Route path="/make-payment" element={<Makepayment/>} />
            <Route path="/payment-success" element={<PaymentSuccess/>} />
            <Route path='/admin/products/new' element={<AddProductForm />} /> 
            <Route path="/admin/products/edit/:id" element={<EditProductForm />} />     

          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
