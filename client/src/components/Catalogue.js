import React, { useState } from 'react';
import './Catalogue.css'; // Ensure this CSS file exists and is correctly linked
import { Link, useNavigate } from 'react-router-dom';

const Catalogue = () => {
  const [activeSection, setActiveSection] = useState('');

  const navigate = useNavigate();

  const handleSubSectionClick = (idPrefix) => {
    navigate(`/products?search=${encodeURIComponent(idPrefix)}`);
  };

  const handleSectionClick = (sectionName) => {
    setActiveSection(activeSection === sectionName ? '' : sectionName);
  };

  const sectionsData = [
    {
      name: 'Men',
      idPrefix: '101',
      image: '/images/men_section.jpg',
      subSections: [
        { name: 'Kandoora', idPrefix: '101-00', image: '/images/men_kandoora.jpg' },
        { name: 'Ghutra', idPrefix: '101-01', image: '/images/men_ghutra.jpg' },
        { name: 'Agal', idPrefix: '101-02', image: '/images/men_agal.jpeg' },
      ],
    },
    {
      name: 'Women',
      idPrefix: '102',
      image: '/images/women_section.jpg',
      subSections: [
        { name: 'Abaya', idPrefix: '102-00', image: '/images/women_abaya.jpg' },
        { name: 'Sheila', idPrefix: '102-01', image: '/images/women_sheila.jpg' },
      ],
    },
    {
      name: 'Kids',
      idPrefix: '103',
      image: '/images/kids_section.jpg',
      subSections: [
        { name: 'Boys', idPrefix: '103-00', image: '/images/kids_boys.jpg' },
        { name: 'Girls', idPrefix: '103-01', image: '/images/kids_girls.jpg' },
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
    height: '150px',
    width: '150px',
    margin: '10px',
    transition: 'transform 0.2s ease-in-out',
    cursor: 'pointer',
  };

  return (
    <div className="catalogue-container">
      <Link to="/" className="home-button">Home</Link>
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
              onClick={() => handleSubSectionClick(subSection.idPrefix)}
            >
              {subSection.name}
            </div>
          </div>
        ))}
    </div>
  );
};

export default Catalogue;