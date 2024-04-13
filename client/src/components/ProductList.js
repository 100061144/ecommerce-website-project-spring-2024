import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar'; // Ensure this path matches your file structure
import './ProductList.css';

const ProductList = () => {
    const [products, setProducts] = useState([]); // Original list of products
    const [filteredProducts, setFilteredProducts] = useState([]); // Products to display based on search
    const [selectedProduct, setSelectedProduct] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('http://localhost:3000/products')
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setProducts(data);
                    setFilteredProducts(data); // Initially, filteredProducts is the same as the full product list
                } else if (Array.isArray(data.products)) {
                    setProducts(data.products);
                    setFilteredProducts(data.products);
                } else {
                    console.error("Fetched data is not an array:", data);
                    setProducts([]);
                    setFilteredProducts([]);
                }
            })
            .catch(error => {
                console.error("Error fetching products:", error);
                setProducts([]);
                setFilteredProducts([]);
            });
    }, []);

    const handleSearch = (query) => {
        if (!query.trim()) {
            setFilteredProducts(products); // Reset to original list if search query is empty
            return;
        }
        const lowerCaseQuery = query.toLowerCase();
        const filtered = products.filter(product =>
            product.id.toLowerCase().includes(lowerCaseQuery) ||
            product.name.toLowerCase().includes(lowerCaseQuery) ||
            product.description.toLowerCase().includes(lowerCaseQuery)
        );
        setFilteredProducts(filtered); // Update only the filteredProducts state
    };

    const addItemToCart = async (item) => {
        const username = localStorage.getItem("username");
        const response = await fetch('http://localhost:3000/addToCart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, item }),
        });
        const data = await response.json();
        if (data.success) {
            alert('Item added to cart successfully');
        } else {
            alert('Failed to add item to cart');
        }
    };

    const renderProductDetails = (product) => {
        const imageUrl = `/images/${product.id}.jpg`; // Adjust if you have a different naming convention
        return (
            <div className="product-details">
                <img src={imageUrl} alt={product.name} className="product-image-large" />
                <h2>{product.name} - {product.price} AED</h2>
                <p>{product.description}</p>
                <button 
                    className="add-to-cart-button" 
                    onClick={() => addItemToCart({
                        id: product.id,
                        title: product.name,
                        price: product.price,
                        quantity: 1
                    })}
                >
                    Add to Cart
                </button>
                <button className="back-button" onClick={() => setSelectedProduct(null)}>Back to Products</button>
            </div>
        );
    };

    return (
        <div className="product-list-container">
            <div className="search-bar-container">
                <button 
                    className="back-to-home-button" 
                    onClick={() => navigate('/')}
                >
                    Back to Home
                </button>
                <div className="search-bar-wrapper">
                    <SearchBar onSearch={handleSearch} />
                </div>
            </div>
            {selectedProduct ? (
                renderProductDetails(selectedProduct)
            ) : (
                <>
                    <h1>Products</h1>
                    <div className="products-grid">
                        {filteredProducts.map((product, index) => (
                            <div key={index} className="product-item">
                            <img src={`/images/${product.id}.jpg`} alt={product.name} className="product-image" />
                            <h2 className="product-title">{product.name} - {product.price} AED</h2>
                            <p>{product.description}</p>
                            <button 
                                className="view-details-button" 
                                onClick={() => setSelectedProduct(product)}
                            >
                                View Details
                            </button>
                            <button 
                                className="add-to-cart-button" 
                                onClick={() => addItemToCart({
                                    id: product.id,
                                    title: product.name,
                                    price: product.price,
                                    quantity: 1
                                })}
                            >
                                Add to Cart
                            </button>
                        </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default ProductList;
