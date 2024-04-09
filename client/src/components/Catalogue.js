import React, { useState } from 'react';
import './Catalogue.css'; // Ensure this CSS file exists and is correctly linked
import { Link } from 'react-router-dom';

const Catalogue = () => {
  const [activeSection, setActiveSection] = useState('');

  const handleSectionClick = (sectionName) => {
    setActiveSection(activeSection === sectionName ? '' : sectionName);
  };

  const sectionsData = [
    {
      name: 'Men',
      image: '/images/men_section.jpg',
      subSections: [
        { name: 'Kandoora', image: '/images/men_kandoora.jpg' },
        { name: 'Ghutra', image: '/images/men_ghutra.jpg' },
        { name: 'Agal', image: '/images/men_agal.jpeg' },
        // Add more sub-sections as needed
      ],
    },
    {
      name: 'Women',
      image: '/images/women_section.jpg',
      subSections: [
        { name: 'Abaya', image: '/images/women_abaya.jpg' },
        { name: 'Sheila', image: '/images/women_sheila.jpg' },
        // Add more sub-sections as needed
      ],
    },
    {
      name: 'Kids',
      image: '/images/kids_section.jpg',
      subSections: [
        { name: 'Ghutra', image: '/images/kids_ghutra.jpg' },
        { name: 'Books', image: '/images/kids_books.jpg' },
        // Add more sub-sections as needed
      ],
    },
  ];

  const commonStyle = {
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    height: '300px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    width: '100%',
    cursor: 'pointer',
    transition: 'transform 0.2s ease-in-out',
  };

  const commonSubSectionStyle = {
    ...commonStyle,
    height: '150px', // Adjust the height to ensure a more square-ish look
    width: '150px', // Adjust the width as necessary
    margin: '10px', // Add margins to prevent the buttons from sticking to each other
    transition: 'transform 0.2s ease-in-out', // Smooth transition effect
    cursor: 'pointer', // Change cursor to pointer to indicate clickable items
  };

  return (
    <div className="catalogue-container">
      <Link to="/" className="home-button">Home</Link> {/* Add this line */}
      <h1>Catalogue</h1>
      <div className="catalogue-sections">
        {sectionsData.map((section) => (
          <div
            key={section.name}
            onClick={() => handleSectionClick(section.name)}
            style={{ backgroundImage: `url(${section.image})`, ...commonStyle }}
            className="catalogue-section"
          >
            {section.name}
          </div>
        ))}
      </div>
      {sectionsData
        .find((section) => section.name === activeSection)?.subSections
        .map((subSection) => (
          <div key={subSection.name} className="sub-sections-container">
            <div
              style={{ backgroundImage: `url(${subSection.image})`, ...commonSubSectionStyle }}
              className="catalogue-sub-section"
            >
              {subSection.name}
            </div>
          </div>
        ))}
    </div>
  );
};

export default Catalogue;
