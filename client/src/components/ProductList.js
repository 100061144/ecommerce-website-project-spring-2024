import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SearchBar from './SearchBar'; // Ensure this path matches your file structure
import './ProductList.css';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

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
        if (!query.trim()) {
            setFilteredProducts(products);
            return;
        }
        const lowerCaseQuery = query.toLowerCase();
        const filtered = products.filter(product =>
            product.id.toLowerCase().includes(lowerCaseQuery) ||
            product.name.toLowerCase().includes(lowerCaseQuery) ||
            product.description.toLowerCase().includes(lowerCaseQuery)
        );
        setFilteredProducts(filtered);
    };

    const addItemToCart = async (product) => {
        const username = localStorage.getItem("username");
        const response = await fetch('http://localhost:3000/addToCart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, item: product }),
        });
        const data = await response.json();
        if (data.success) {
            alert('Item added to cart successfully');
        } else {
            alert('Failed to add item to cart');
        }
    };

    return (
        <div className="product-list-container">
            <div className="search-bar-container">
                <button 
                    className="back-to-home-button" 
                    onClick={() => navigate('/')}
                >
                    Back
                </button>
                <SearchBar onSearch={handleSearch} />
            </div>
            {selectedProduct ? (
                <>
                    <div className="product-details">
                        <img src={`/images/${selectedProduct.id}.jpg`} alt={selectedProduct.name} className="product-image-large" />
                        <div className="product-info">
                            <h2>{selectedProduct.name} - {selectedProduct.price} AED</h2>
                            <p>{selectedProduct.description}</p>
                            <button 
                                className="add-to-cart-button" 
                                onClick={() => addItemToCart({
                                    id: selectedProduct.id,
                                    title: selectedProduct.name,
                                    price: selectedProduct.price,
                                    quantity: 1
                                })}
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
