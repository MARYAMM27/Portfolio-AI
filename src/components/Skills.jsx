import React, { useState } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes for validation
import '../styles/Skills.css'; // Ensure this import is correct

const Skills = ({ formData, setFormData, handleUpdate }) => {
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSkillChange = (e, index) => {
    const newSkills = [...formData.skills];
    newSkills[index] = e.target.value;
    setFormData({ ...formData, skills: newSkills });
  };

  const addSkill = () => {
    setFormData({
      ...formData,
      skills: [...formData.skills, { id: Date.now(), name: '' }],
    });
  };

  const deleteSkill = (index) => {
    const newSkills = formData.skills.filter((_, i) => i !== index);
    setFormData({ ...formData, skills: newSkills });
    setSuccessMessage('Skill deleted successfully!'); // Show success message
    setErrorMessage(''); // Clear any previous error messages
  };

  const handleSkillsUpdate = async () => {
    try {
      await handleUpdate(); // Call the update function passed as a prop
      setSuccessMessage('Skills updated successfully!');
      setErrorMessage(''); // Clear any previous error messages
    } catch (error) {
      setErrorMessage('Error updating skills. Please try again.');
      setSuccessMessage(''); // Clear any previous success messages
    }
  };

  return (
    <div className="skills-container">
      <h2>Skills</h2>
      {formData.skills.map((skill, index) => (
        <div key={skill.id} className="info-field">
          {' '}
          {/* Use unique id as key */}
          <input
            className="info-input"
            type="text"
            value={skill.name}
            onChange={(e) => handleSkillChange(e, index)}
            placeholder={`Skill ${index + 1}`}
          />
          <button
            className="delete-skill-button"
            type="button" // Added explicit type attribute
            onClick={() => deleteSkill(index)}
          >
            Delete
          </button>
        </div>
      ))}
      <button
        className="add-skill-button"
        type="button" // Added explicit type attribute
        onClick={addSkill}
      >
        Add Skill
      </button>
      <button
        className="update-button"
        type="button" // Added explicit type attribute
        onClick={handleSkillsUpdate}
      >
        Update Skills
      </button>
      {successMessage && <p className="success-message">{successMessage}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
};

// Prop types validation
Skills.propTypes = {
  formData: PropTypes.shape({
    skills: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired, // Add id for uniqueness
        name: PropTypes.string.isRequired, // Change to object with name
      }),
    ).isRequired,
  }).isRequired,
  setFormData: PropTypes.func.isRequired,
  handleUpdate: PropTypes.func.isRequired,
};

export default Skills;
