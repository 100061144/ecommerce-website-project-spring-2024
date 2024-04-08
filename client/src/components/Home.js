import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
 return (
    <div className="home-container">
      <h1>Welcome to Our Clothing Store</h1>
      <div className="home-buttons">
        <Link to="/cart" className="home-button">View Cart</Link>
        <Link to="/profile" className="home-button">Profile</Link>
      </div>
    </div>
 );
};

export default Home;
