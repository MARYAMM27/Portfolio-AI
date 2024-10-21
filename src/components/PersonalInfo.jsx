import React, { useState } from 'react';
import PropTypes from 'prop-types';
import '../styles/PersonalInfo.css';

const PersonalInfo = ({ formData, setFormData, handleUpdate }) => {
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFormUpdate = async () => {
    try {
      await handleUpdate();
      setSuccessMessage('Data updated successfully!');
      setErrorMessage('');
    } catch (error) {
      setErrorMessage('Error updating data. Please try again.');
      setSuccessMessage('');
    }
  };

  return (
    <div className="personal-info-container">
      <h2>Personal Information</h2>
      <form onSubmit={(e) => e.preventDefault()}>
        {/* Prevent default form submission */}
        <div className="info-field">
          <label htmlFor="name">
            Name:
            <input
              className="info-input"
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Name"
              required
            />
          </label>
        </div>
        <div className="info-field">
          <label htmlFor="email">
            Email:
            <input
              className="info-input"
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Email"
              required
            />
          </label>
        </div>
        <div className="info-field">
          <label htmlFor="phone">
            Phone:
            <input
              className="info-input"
              id="phone"
              type="tel" // Changed to "tel" for better semantics
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Phone"
              required
            />
          </label>
        </div>
        <div className="info-field">
          <label htmlFor="address">
            Address:
            <input
              className="info-input"
              id="address"
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Address"
              required
            />
          </label>
        </div>
        <button
          className="update-button"
          type="button" // Keep as button to prevent form submission
          onClick={handleFormUpdate}
        >
          Update Data
        </button>
      </form>
      {successMessage && <p className="success-message">{successMessage}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
};

// Prop types validation
PersonalInfo.propTypes = {
  formData: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    phone: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
  }).isRequired,
  setFormData: PropTypes.func.isRequired,
  handleUpdate: PropTypes.func.isRequired,
};

export default PersonalInfo;
