import React from 'react';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar'; // Import the SearchBar component
import './Home.css';

const Home = () => {
  const handleSearch = (query) => {
    console.log("Search for:", query);
    // Here you will handle the search operation

  };

  return (
    <div className="home-container">
      <SearchBar onSearch={handleSearch} /> {/* Include the SearchBar at the top */}
      <h1>Welcome to UAE Traditional Mart!</h1>
      <div className="home-buttons">
        <Link to="/cart" className="home-button">View Cart</Link>
        <Link to="/profile" className="home-button">Profile</Link>
        <Link to="/catalogue" className="home-button">Catalogue</Link>
      </div>
    </div>
  );
};

export default Home;
