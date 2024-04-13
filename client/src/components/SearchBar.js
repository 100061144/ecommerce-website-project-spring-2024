import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchBar.css'; // Assuming you'll create a CSS file for styling

const SearchBar = ({ onSearch }) => {
    const [query, setQuery] = useState('');
    const navigate = useNavigate(); // Initialize useNavigate

    const handleInputChange = (e) => {
        setQuery(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Update the URL with the search query without navigating away
        navigate(`/products?search=${encodeURIComponent(query)}`);
    };

    const clearQuery = () => {
        setQuery('');
        navigate('/products');
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
            {query && (
                <button type="button" onClick={clearQuery} className="clear-button">
                    X
                </button>
            )}
            <button type="submit" className="search-button">Search</button>
        </form>
    );
};

export default SearchBar;
