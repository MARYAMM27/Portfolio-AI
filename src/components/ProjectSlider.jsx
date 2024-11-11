import React, { useState } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes

const ProjectSlider = ({ projects }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Navigate to the next project in the slider
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % projects.length);
  };

  // Navigate to the previous project in the slider
  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + projects.length) % projects.length);
  };

  // Destructure the current project data
  const currentProject = projects[currentIndex];

  const sliderButtonStyle = (direction) => ({
    position: 'absolute',
    top: '50%',
    [direction]: '10px',
    transform: 'translateY(-50%)',
    fontSize: '24px',
    background: 'rgba(0, 0, 0, 0.5)',
    color: 'white',
    border: 'none',
    padding: '10px',
    cursor: 'pointer',
    borderRadius: '50%',
    zIndex: 10,
  });

  return (
    <div style={{
      position: 'relative', width: '100%', maxWidth: '800px', margin: 'auto', textAlign: 'center',
    }}
    >
      {/* Project Content */}
      <h3>{currentProject?.title}</h3>
      <p>{currentProject?.description}</p>
      {currentProject?.fileURL && (
        <img
          src={currentProject?.fileURL}
          alt={currentProject?.title}
          style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
        />
      )}
      {currentProject?.hyperlink && (
        <p>
          For more details, visit:
          {' '}
          <a href={currentProject?.hyperlink} target="_blank" rel="noopener noreferrer">
            {currentProject?.hyperlink}
          </a>
        </p>
      )}

      {/* Slider Navigation Buttons */}
      <button type="button" onClick={prevSlide} style={sliderButtonStyle('left')}>←</button>
      <button type="button" onClick={nextSlide} style={sliderButtonStyle('right')}>→</button>
    </div>
  );
};

// Style for the navigation buttons

// Prop validation
ProjectSlider.propTypes = {
  projects: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      fileURL: PropTypes.string,
      hyperlink: PropTypes.string,
    }),
  ).isRequired,
};

export default ProjectSlider;
