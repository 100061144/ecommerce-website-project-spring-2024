// Add this to Home.js

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';
import './Home.css';

const Home = () => {
  const navigateOnSearch = "/products"; // go to products page
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const username = localStorage.getItem("username"); // Getting stored username in localStorage

  useEffect(() => {
    const fetchRecommendedProducts = async () => {
      if (!username) return;

      try {
        // Fetch orders for the current user
        const ordersResponse = await fetch(`http://localhost:3000/orders/${username}`);
        const ordersData = await ordersResponse.json();
        const subsectionIds = new Set();
        ordersData.orders.forEach(order => {
          order.products.forEach(product => {
            // Extract subsection from product ID (e.g., "101-011" -> "101-01")
            const subsectionId = product.id.slice(0, product.id.lastIndexOf('-') + 3);
            subsectionIds.add(subsectionId);
          });
        });

        // Fetch all products
        const productsResponse = await fetch('http://localhost:3000/products');
        const productsData = await productsResponse.json();
        const recommended = productsData.products.filter(product => {
          // Check if product belongs to any of the user's subsections
          const productSubsectionId = product.id.slice(0, product.id.lastIndexOf('-') + 3);
          return subsectionIds.has(productSubsectionId);
        });

        setRecommendedProducts(recommended);
      } catch (error) {
        console.error("Error fetching recommended products:", error);
      }
    };

    fetchRecommendedProducts();
  }, [username]);

  return (
    <div className="home-container">
      <img src={`/images/UAE_Traditional_Mart.png`} alt="Banner" className="home-banner" />
      <SearchBar navigateOnSearch={navigateOnSearch} placeholder="Search for products..." />
      <div className="home-buttons">
        <Link to="/catalogue" className="home-button">Catalogue</Link>
        <Link to="/orders" className="home-button">Orders</Link>
        <Link to="/cart" className="home-button">View Cart</Link>
        <Link to="/profile" className="home-button">Profile</Link>
      </div>
      <div className="similar-products-container">
        <h3>Recommended for You</h3>
        <div className="similar-products">
          {recommendedProducts.map(product => (
            <div 
              key={product.id} 
              className="similar-product-item" 
              onClick={() => {
                window.location.href = `/products?search=${product.name}`; // Navigate to product details
              }}
            >
              <img src={`/images/${product.id}.jpg`} alt={product.name} className="similar-product-image" />
              <div>{product.name} - {product.price} AED</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;