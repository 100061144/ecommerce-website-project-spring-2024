import React from 'react';
import { Link } from 'react-router-dom';
import './Catalogue.css'; // Create and import your CSS file for styling

const Catalogue = () => {
  return (
    <div className="catalogue-container">
      <h1>Catalogue</h1>
      <div className="catalogue-sections">
        <Link to="/catalogue/men" className="catalogue-section">Men</Link>
        <Link to="/catalogue/women" className="catalogue-section">Women</Link>
      </div>
    </div>
  );
};

export default Catalogue;
