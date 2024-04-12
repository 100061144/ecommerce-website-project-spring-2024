import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './SearchBar.css'; // Assuming you'll create a CSS file for styling

const SearchBar = ({ onSearch }) => {
    const [query, setQuery] = useState('');
    const navigate = useNavigate(); // Initialize useNavigate

    const handleInputChange = (e) => {
        setQuery(e.target.value);
        // Optionally, you can call onSearch here if you want to search as the user types
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(query);
        navigate('/products'); // Navigate to the products page on submit
    };

    return (
        <form onSubmit={handleSubmit} className="search-bar">
            <input
                type="text"
                value={query}
                onChange={handleInputChange}
                placeholder="Search for items..."
                className="search-input"
            />
            <button type="submit" className="search-button">Search</button>
        </form>
    );
};

export default SearchBar;