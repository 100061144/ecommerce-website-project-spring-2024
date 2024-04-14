import React from 'react';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar'; // Make sure this path is correct for your project structure
import './Home.css'; // Adjust the import path as necessary for your CSS file

const Home = () => {
  // Assuming '/products' is the route for the ProductList page
  // and you want to navigate to this page with the search query
  const navigateOnSearch = "/products";

  return (
    <div className="home-container">
      <SearchBar navigateOnSearch={navigateOnSearch} placeholder="Search for products..." />
      <h1>Welcome to UAE Traditional Mart!</h1>
      <div className="home-buttons">
        <Link to="/catalogue" className="home-button">Catalogue</Link>
        <Link to="/orders" className="home-button">Orders</Link>
        <Link to="/cart" className="home-button">View Cart</Link>
        <Link to="/profile" className="home-button">Profile</Link>
      </div>
    </div>
  );
};

export default Home;