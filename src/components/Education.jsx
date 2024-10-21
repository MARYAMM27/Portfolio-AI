import React, { useState } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes for validation
import '../styles/Education.css'; // Ensure this import is correct

const Education = ({ formData, setFormData, handleUpdate }) => {
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleEducationChange = (e, index) => {
    const newEducation = [...formData.education];
    newEducation[index] = e.target.value;
    setFormData({ ...formData, education: newEducation });
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [...formData.education, { id: Date.now(), name: '' }],
    });
  };

  const handleEducationUpdate = async () => {
    try {
      await handleUpdate(); // Call the update function passed as a prop
      setSuccessMessage('Education updated successfully!'); // Success message
      setErrorMessage(''); // Clear any previous error messages
    } catch (error) {
      setErrorMessage('Error updating education. Please try again.'); // Error message
      setSuccessMessage(''); // Clear any previous success messages
    }
  };

  const deleteEducation = (index) => {
    const newEducation = formData.education.filter((_, i) => i !== index);
    setFormData({ ...formData, education: newEducation });
  };

  return (
    <div className="education-container">
      <h2>Education</h2>
      {formData.education.map((edu, index) => (
        <div key={edu.id || index} className="info-field">
          <input
            type="text"
            value={edu.name}
            onChange={(e) => handleEducationChange(e, index)}
            placeholder={`Education ${index + 1}`}
            className="info-input"
          />
          <button
            className="delete-button"
            type="button" // Explicit type attribute
            onClick={() => deleteEducation(index)}
          >
            Delete
          </button>
        </div>
      ))}
      <button
        className="add-button"
        type="button"
        onClick={addEducation}
      >
        Add Education
      </button>
      <button
        className="update-button"
        type="button"
        onClick={handleEducationUpdate}
      >
        Update Education
      </button>
      {successMessage && <p className="success-message">{successMessage}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
};

// Prop types validation
Education.propTypes = {
  formData: PropTypes.shape({
    education: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number, // Add id for uniqueness
        name: PropTypes.string.isRequired, // Change to object with name
      }),
    ).isRequired,
  }).isRequired,
  setFormData: PropTypes.func.isRequired,
  handleUpdate: PropTypes.func.isRequired,
};

export default Education;
