// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Cart from './components/Cart';
import Payment from './components/Payment';
import Profile from './components/Profile';
import Login from './components/Login';
import Signup from './components/Signup';
import Catalogue from './components/Catalogue'; // Make sure to import the Catalogue component
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/catalogue" element={<Catalogue />} /> {/* Add Catalogue route here */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
