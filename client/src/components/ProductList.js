import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProductList.css';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('http://localhost:3000/products')
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setProducts(data);
                } else if (Array.isArray(data.products)) {
                    setProducts(data.products);
                } else {
                    console.error("Fetched data is not an array:", data);
                    setProducts([]);
                }
            })
            .catch(error => {
                console.error("Error fetching products:", error);
                setProducts([]);
            });
    }, []);

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
                <h2>{product.name} - ${product.price}</h2>
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
            {selectedProduct ? (
                renderProductDetails(selectedProduct)
            ) : (
                <>
                    <h1>Products</h1>
                    <div className="products-grid">
                        {products.map((product, index) => {
                            const imageUrl = `/images/${product.id}.jpg`; // Adjust if you have a different naming convention
                            return (
                                <div key={index} className="product-item">
                                    <img src={imageUrl} alt={product.name} className="product-image" />
                                    <h2 className="product-title">{product.name} - ${product.price}</h2>
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
                            );
                        })}
                    </div>
                    <button 
                        className="back-to-home-button" 
                        onClick={() => navigate('/')}
                    >
                        Back to Home
                    </button>
                </>
            )}
        </div>
    );
};

export default ProductList;