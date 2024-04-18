import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SearchBar from './SearchBar'; // Ensure this path matches your file structure
import './ProductList.css';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();

    const [rating, setRating] = useState(0);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const searchQuery = queryParams.get('search');
        const section = queryParams.get('section'); // Get the section parameter from the URL

        const fetchAndFilterProducts = async () => {
            try {
                const response = await fetch('http://localhost:3000/products');
                const data = await response.json();
                let fetchedProducts = Array.isArray(data) ? data : data.products || [];

                // Filter by section if it's specified in the URL
                if (section) {
                    fetchedProducts = fetchedProducts.filter(product => product.id.startsWith(section));
                }

                // Existing search filtering logic
                if (searchQuery) {
                    const lowerCaseQuery = searchQuery.toLowerCase();
                    fetchedProducts = fetchedProducts.filter(product =>
                        product.id.toLowerCase().includes(lowerCaseQuery) ||
                        product.name.toLowerCase().includes(lowerCaseQuery) ||
                        product.description.toLowerCase().includes(lowerCaseQuery)
                    );
                }

                setProducts(fetchedProducts);
                setFilteredProducts(fetchedProducts);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };

        fetchAndFilterProducts();
    }, [location.search]); // React to changes in search query and section

    const handleSearch = (query) => {
        // Navigate to the same page but with the new search query, replacing any existing query
        navigate(`?search=${encodeURIComponent(query)}`);
    };

    const handleRatingChange = (newRating) => {
        setRating(newRating);
    };

    const submitRating = async (productId, productName) => {
        const username = localStorage.getItem("username");
        if (!username) {
            alert("Please log in to submit a rating.");
            return;
        }

        if (rating === 0) {
            alert("Please select a rating before submitting.");
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/submitRating", {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, productId, productName, rating }),
            });

            if (response.ok) {
                alert("Rating submitted successfully!");
                setRating(0);

                // Fetch the updated product data

                const updatedProductsResponse = await fetch('http://localhost:3000/products');
                const updatedProductsData = await updatedProductsResponse.json();
                const updatedProducts = Array.isArray(updatedProductsData) ? updatedProductsData : updatedProductsData.products || [];

                setProducts(updatedProducts);
                setFilteredProducts(updatedProducts);

                if (selectedProduct && selectedProduct.id === productId) {
                    const updatedSelectedProduct = updatedProducts.find(product => product.id === productId);
                    setSelectedProduct(updatedSelectedProduct);
                }
            } else {
                alert("Failed to submit rating: " + response.message);
            }
        } catch (error) {
            console.error("Error submitting rating:", error);
            alert("An error occurred while submitting the rating: " + error.message);
        }
    };

    useEffect(() => {
        fetchCartItems();
    }, []);

    const fetchCartItems = async () => {
        const username = localStorage.getItem("username");
        if (username) {
            try {
                const response = await fetch(`http://localhost:3000/cart/${username}`);
                const data = await response.json();
                setCartItems(data);
            } catch (error) {
                console.error("Error fetching cart items:", error);
            }
        }
    };

    const addItemToCart = async (product) => {
        const username = localStorage.getItem("username");
        const response = await fetch(`http://localhost:3000/cart/${username}`);
    
        if (!response.ok) {
            alert('Failed to fetch cart items: ' + response.message);
            return;
        }
    
        const cartItems = await response.json();
    
        // Validate that cartItems is an array
        if (!Array.isArray(cartItems)) {
            console.error('Expected cartItems to be an array', cartItems);
            alert('Error processing cart items');
            return;
        }
    
        const existingItem = cartItems.find(item => item.id === product.id);
        const quantityInCart = existingItem ? existingItem.quantity : 0;
    
        if (quantityInCart + 1 > product.quantity) {
            alert('Product is already in cart, check your cart for details.');
            fetchCartItems(); // Fetch the updated cart items after the alert
            navigate('/cart');
            return;
        }
    
        const addToCartResponse = await fetch('http://localhost:3000/addToCart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, item: { ...product, maxQuantity: product.quantity } }),
        });
    
        if (!addToCartResponse.ok) {
            alert('Failed to add item to cart');
            return;
        }
    
        const data = await addToCartResponse.json();
        if (data.success) {
            alert('Item added to cart successfully');
            fetchCartItems(); // Fetch the updated cart items after successful addition
        } else {
            alert('Failed to add item to cart: ' + data.message);
        }
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
                    <SearchBar onSearch={handleSearch} placeholder="Search for items..." />
                <button 
                    className="cart-button" 
                    onClick={() => navigate('/cart')}
                >
                    Cart
            </button>
            </div>
            {selectedProduct ? (
                <>
                    <div className="product-details">
                        <img src={`/images/${selectedProduct.id}.jpg`} alt={selectedProduct.name} className="product-image-large" />
                        <div className="product-info">
                            <h2>{selectedProduct.name} - {selectedProduct.price} AED</h2>
                            {selectedProduct.quantity == 0 && (
                                <p className="out-of-stock-message">OUT OF STOCK</p>
                            )}
                            <p>{selectedProduct.description}</p>
                            <div className="rating-container">
                                <span>Rate this product:</span>
                                <div className="rating-stars">
                                    {[...Array(5)].map((_, index) => (
                                        <span
                                            key={index}
                                            className={`star ${rating >= index + 1 ? "filled" : ""}`}
                                            onClick={() => handleRatingChange(index + 1)}
                                        >
                                            &#9733;
                                        </span>
                                    ))}
                                </div>
                                <button onClick={() => submitRating(selectedProduct.id, selectedProduct.name)}>
                                    Submit Rating
                                </button>
                                <div className="average-rating">
                                Average Rating: {selectedProduct.averageRating ? selectedProduct.averageRating.toFixed(1) : 'N/A'}
                                </div>
                            </div>
                            <button 
                                className={`add-to-cart-button ${selectedProduct.quantity == 0 ? 'disabled' : ''}`}
                                disabled={selectedProduct.quantity == 0} // This line disables the button functionally and visually
                                onClick={() => {
                                    if (selectedProduct.quantity > 0) {
                                        addItemToCart({
                                            id: selectedProduct.id,
                                            title: selectedProduct.name,
                                            price: selectedProduct.price,
                                            quantity: 1
                                        });
                                    }
                                }}
                            >
                                Add to Cart
                            </button>
                            <button className="back-button" onClick={() => setSelectedProduct(null)}>Back to Products</button>
                        </div>
                    </div>
                    <div className="similar-products-container">
                        <h3>Similar Products</h3>
                        <div className="similar-products">
                            {products.filter(product => 
                                product.id.startsWith(selectedProduct.id.slice(0, selectedProduct.id.lastIndexOf("-")))
                                && product.id !== selectedProduct.id
                            )
                            .map(similarProduct => (
                                <div 
                                    key={similarProduct.id} 
                                    className="similar-product-item" 
                                    onClick={() => {
                                        setSelectedProduct(similarProduct);
                                        window.scrollTo(0, 0); // Scroll to the top of the page
                                    }}
                                >
                                    <img src={`/images/${similarProduct.id}.jpg`} alt={similarProduct.name} className="similar-product-image" />
                                    <div>{similarProduct.name} - {similarProduct.price} AED</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <h1>Products</h1>
                    <div className="products-grid">
                        {filteredProducts.map((product, index) => (
                            <div key={index} className="product-item">
                                <img src={`/images/${product.id}.jpg`} alt={product.name} className="product-image" />
                                {product.quantity == 0 && (
                                    <p className="out-of-stock-message">OUT OF STOCK</p>
                                )}
                                <h2 className="product-title">{product.name} - {product.price} AED</h2>
                                <p>{product.description}</p>
                                <div className="average-rating">
                                    Average Rating: {product.averageRating ? product.averageRating.toFixed(1) : 'N/A'}
                                </div>
                                <button 
                                    className="view-details-button" 
                                    onClick={() => setSelectedProduct(product)}
                                >
                                    View Details
                                </button>
                                <button 
                                    className={`add-to-cart-button ${product.quantity == 0 ? 'disabled' : ''}`}
                                    disabled={product.quantity == 0}
                                    onClick={() => {
                                        if (product.quantity > 0) {
                                            addItemToCart({
                                                id: product.id,
                                                title: product.name,
                                                price: product.price,
                                                quantity: 1
                                            });
                                        }
                                    }}
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
