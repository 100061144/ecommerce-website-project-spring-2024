import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Keep this for navigation
import './SearchBar.css';

const SearchBar = ({ onSearch, navigateOnSearch, placeholder = "Search..." }) => {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        setQuery(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (navigateOnSearch) {
            // Navigate to the specified path with the search query
            navigate(`${navigateOnSearch}?search=${encodeURIComponent(query)}`);
        } else {
            // Call onSearch for in-page filtering
            onSearch(query);
        }
    };

    const clearQuery = () => {
        setQuery('');
        if (navigateOnSearch) {
            navigate(navigateOnSearch);
        } else {
            onSearch('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="search-bar">
            <input
                type="text"
                value={query}
                onChange={handleInputChange}
                placeholder={placeholder} // Use the placeholder prop
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