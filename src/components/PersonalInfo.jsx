import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../styles/PersonalInfo.css';
import { FaEdit, FaTrash } from 'react-icons/fa';

const PersonalInfo = ({ formData, setFormData, handleUpdate }) => {
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [entry, setEntry] = useState(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const storedEntry = JSON.parse(localStorage.getItem('personalInfoEntry'));
    if (storedEntry) {
      storedEntry.education = Array.isArray(storedEntry.education)
        ? storedEntry.education
        : [storedEntry.education];
      setEntry(storedEntry);
    }
  }, []);

  const handleFormUpdate = async () => {
    try {
      await handleUpdate();

      const updatedEntry = {
        ...formData,
        education: Array.isArray(formData.education) ? formData.education : [formData.education],
        introduction: formData.introduction || '',
      };
      setEntry(updatedEntry);
      setEditing(false);

      localStorage.setItem('personalInfoEntry', JSON.stringify(updatedEntry));

      setSuccessMessage('Data updated successfully!');
      setErrorMessage('');
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        education: [],
        introduction: '', // Reset introduction
      });
    } catch (error) {
      setErrorMessage('Error updating data. Please try again.');
      setSuccessMessage('');
    }
  };

  const handleEdit = () => {
    setFormData(entry);
    setEditing(true);
    setEntry(null);
  };

  const handleDelete = () => {
    if (!entry) {
      setErrorMessage('Please add an entry before attempting to delete.');
      return;
    }
    setEntry(null);
    localStorage.removeItem('personalInfoEntry');
    setSuccessMessage('Entry deleted successfully!');
    setErrorMessage('');
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      education: [],
      introduction: '', // Reset introduction
    });
  };

  return (
    <div className="personal-info-page">
      <h2 className="cv-title">Personal Information</h2>

      {!entry || editing ? (
        <form onSubmit={(e) => e.preventDefault()} style={{ width: '100%' }}>
          <div className="cv-info-field">
            <label htmlFor="name">Name:</label>
            <input
              className="cv-info-input"
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Name"
              required
            />
          </div>
          <div className="cv-info-field">
            <label htmlFor="email">Email:</label>
            <input
              className="cv-info-input"
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Email"
              required
            />
          </div>
          <div className="cv-info-field">
            <label htmlFor="phone">Phone:</label>
            <input
              className="cv-info-input"
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Phone"
              required
            />
          </div>
          <div className="cv-info-field">
            <label htmlFor="address">Address:</label>
            <input
              className="cv-info-input"
              id="address"
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Address"
              required
            />
          </div>
          <div className="cv-info-field">
            <label htmlFor="education">Education:</label>
            <textarea
              className="cv-info-input"
              id="education"
              value={formData.education.join('\n')}
              onChange={(e) => setFormData({ ...formData, education: e.target.value.split('\n') })}
              placeholder="Enter each education entry on a new line"
              required
            />
          </div>
          <div className="cv-info-field">
            <label htmlFor="introduction">About Me:</label>
            <input
              className="cv-info-input"
              id="introduction"
              type="text"
              value={formData.introduction}
              onChange={(e) => setFormData({ ...formData, introduction: e.target.value })}
              placeholder="A brief paragraph about yourself"
            />
          </div>
          <button className="cv-update-button" type="button" onClick={handleFormUpdate}>
            {editing ? 'Update Entry' : 'Add Entry'}
          </button>
          {editing && (
            <button className="cv-cancel-button" type="button" onClick={handleCancelEdit}>
              Cancel
            </button>
          )}
        </form>
      ) : null}

      {successMessage && <p className="success-message">{successMessage}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {!editing && entry && (
        <div className="cv-entry-details">
          <div className="cv-entry-content">
            <h4>Name:</h4>
            <p>{entry.name}</p>
            <h4>Email:</h4>
            <p>{entry.email}</p>
            <h4>Phone:</h4>
            <p>{entry.phone}</p>
            <h4>Address:</h4>
            <p>{entry.address}</p>
            <h4>Education:</h4>
            <ul>
              {entry.education.map((edu) => (
                <li key={`education-${edu}`}>{edu}</li> // Use edu as the key if unique
              ))}
            </ul>
            <h4>About Me:</h4>
            <p>{entry.introduction}</p>
          </div>
          <div className="cv-entry-item">
            <button className="cv-action-button" type="button" onClick={handleEdit}>
              <FaEdit />
              {' '}
              Edit
            </button>
            <button className="cv-action-button" type="button" onClick={handleDelete}>
              <FaTrash />
              {' '}
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

PersonalInfo.propTypes = {
  formData: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    phone: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    education: PropTypes.arrayOf(PropTypes.string).isRequired,
    introduction: PropTypes.string, // Change paragraph to introduction
  }).isRequired,
  setFormData: PropTypes.func.isRequired,
  handleUpdate: PropTypes.func.isRequired,
};

export default PersonalInfo;
