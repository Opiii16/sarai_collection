import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min.js'
import HomePage from './components/Homepage/Homepage.jsx';
import Signin from './components/Signin';
import Signup from './components/Signup';
import Ladies from './components/Ladies/Ladies.jsx';
import Men from './components/Men/Men.jsx';
import Kids from './components/Kids/Kids.jsx';
import Admindashboard from './components/Admindashboard.jsx';
import AboutUs from './components/AboutUs/AboutUs.jsx'
import Makepayment from './components/Makepayment/Makepayment.jsx'
import PaymentSuccess from './components/Makepayment/PaymentSuccess.jsx'
import Cart from './components/Cart/Cart.jsx';
import Product from './components/Product.jsx'
import UserDetails from './components/UsersDetails.jsx';
import AddProductForm from './components/AddProductForm';
import EditProductForm from './components/EditProductForm.jsx';
import { ToastContainer } from 'react-toastify';
import OrderHistory from './components/OrderHistory';
import OrderDetails from './components/OrderDetails';

function App() {
  return (
    <Router>
      <div className="app-container">
        <ToastContainer />
        <main className="app-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/ladies" element={<Ladies />} />
            <Route path="/men" element={<Men />} />
            <Route path="/kids" element={<Kids />} />

            <Route path="/signin" element={<Signin />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/admin" element={<Admindashboard/>} />
            <Route path="/about-us" element={<AboutUs/>} />
            <Route path="/products" element={<Product/>} />
            <Route path="/admin/users/:id" element={<UserDetails />} />
            <Route path="/cart" element={<Cart/>} />

            <Route path="/payment" element={<Makepayment/>} />
            <Route path="/payment-success" element={<PaymentSuccess/>} />
            <Route path='/admin/products/new' element={<AddProductForm />} /> 
            <Route path="/admin/products/edit/:id" element={<EditProductForm />} />

            <Route path="/orders" element={<OrderHistory />} />
            <Route path="/orders/:orderId" element={<OrderDetails />} />  

          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
