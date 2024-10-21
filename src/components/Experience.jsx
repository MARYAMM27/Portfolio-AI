import React, { useState } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes for validation
import '../styles/Experience.css';

const Experience = ({ formData, setFormData, handleUpdate }) => {
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleExperienceChange = (e, index, field) => {
    const newExperiences = [...formData.experiences];
    newExperiences[index] = {
      ...newExperiences[index],
      [field]: e.target.value,
    };
    setFormData({ ...formData, experiences: newExperiences });
  };

  const addExperience = () => {
    setFormData({
      ...formData,
      experiences: [
        ...formData.experiences,
        {
          id: Date.now(), // Assign a unique id based on timestamp
          jobTitle: '',
          company: '',
          startDate: '',
          endDate: '',
        },
      ],
    });
  };

  const deleteExperience = (index) => {
    const newExperiences = formData.experiences.filter((_, i) => i !== index);
    setFormData({ ...formData, experiences: newExperiences });
    setSuccessMessage('Experience deleted successfully!');
    setErrorMessage('');
  };

  const handleExperiencesUpdate = async () => {
    try {
      await handleUpdate();
      setSuccessMessage('Experiences updated successfully!');
      setErrorMessage('');
    } catch (error) {
      setErrorMessage('Error updating experiences. Please try again.');
      setSuccessMessage('');
    }
  };

  return (
    <div className="experience-container">
      <h2>Experience</h2>
      {formData.experiences.map((experience, index) => (
        <div key={experience.id || index} className="experience-field">
          <input
            className="experience-input"
            type="text"
            value={experience.jobTitle}
            onChange={(e) => handleExperienceChange(e, index, 'jobTitle')}
            placeholder={`Job Title ${index + 1}`}
          />
          <input
            className="experience-input"
            type="text"
            value={experience.company}
            onChange={(e) => handleExperienceChange(e, index, 'company')}
            placeholder="Company"
          />
          <input
            className="experience-input"
            type="date"
            value={experience.startDate}
            onChange={(e) => handleExperienceChange(e, index, 'startDate')}
          />
          <input
            className="experience-input"
            type="date"
            value={experience.endDate}
            onChange={(e) => handleExperienceChange(e, index, 'endDate')}
          />
          <button
            className="delete-experience-button"
            type="button" // Added explicit type attribute
            onClick={() => deleteExperience(index)}
          >
            Delete
          </button>
        </div>
      ))}
      <button
        className="add-experience-button"
        type="button" // Added explicit type attribute
        onClick={addExperience}
      >
        Add Experience
      </button>
      <button
        className="update-button"
        type="button" // Added explicit type attribute
        onClick={handleExperiencesUpdate}
      >
        Update Experiences
      </button>
      {successMessage && <p className="success-message">{successMessage}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
};

// Prop types validation
Experience.propTypes = {
  formData: PropTypes.shape({
    experiences: PropTypes.arrayOf(
      PropTypes.shape({
        jobTitle: PropTypes.string.isRequired,
        company: PropTypes.string.isRequired,
        startDate: PropTypes.string.isRequired,
        endDate: PropTypes.string.isRequired,
        id: PropTypes.number, // Include id in prop types
      }),
    ).isRequired,
  }).isRequired,
  setFormData: PropTypes.func.isRequired,
  handleUpdate: PropTypes.func.isRequired,
};

export default Experience;
