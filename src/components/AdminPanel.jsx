import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import PropTypes from 'prop-types';
import { auth, db } from '../firebaseConfig';
import '../styles/AdminPanel.css';

const AdminPanel = ({ cvData, setCvData }) => {
  const [formData, setFormData] = useState(cvData);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Handle login or signup process
  const handleLoginOrSignup = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isSigningUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        setSuccessMessage('Sign up successful! Please log in.');
        setIsSigningUp(false); // Switch back to Login after Sign-Up
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setIsAuthenticated(true);
        setSuccessMessage('Login successful!');
      }
      setTimeout(() => setSuccessMessage(''), 3000); // Clear success message after 3 seconds
    } catch (error) {
      setError(error.message || 'Authentication failed. Please check your credentials.');
    }
  };

  // Update the CV data in Firestore
  const handleUpdate = async () => {
    try {
      const docRef = doc(db, 'cvData', 'cvData');
      await updateDoc(docRef, formData);
      setCvData(formData);
      setSuccessMessage('Data updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000); // Clear success message
    } catch (error) {
      setError('Error updating data. Please try again.');
    }
  };

  // Resize textarea based on content
  const handleTextareaResize = (e) => {
    e.target.style.height = 'auto'; // Reset height
    e.target.style.height = `${e.target.scrollHeight}px`; // Set height based on content
  };

  // Toggle between login and signup modes
  const toggleAuthMode = () => {
    setIsSigningUp((prev) => !prev);
    setError(''); // Clear any existing errors
  };

  return (
    <div className="admin-panel">
      {!isAuthenticated ? (
        <div>
          <h2>{isSigningUp ? 'Sign Up' : 'Login'}</h2>
          {error && <p className="error-message">{error}</p>}
          {successMessage && <p className="success-message">{successMessage}</p>}
          <form onSubmit={handleLoginOrSignup}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">{isSigningUp ? 'Sign Up' : 'Login'}</button>
          </form>
          <button type="button" onClick={toggleAuthMode}>
            {isSigningUp ? 'Switch to Login' : 'Switch to Sign Up'}
          </button>
        </div>
      ) : (
        <div>
          <h2>Edit Profile Data</h2>
          {error && <p className="error-message">{error}</p>}
          {successMessage && <p className="success-message">{successMessage}</p>}
          <form>
            <label htmlFor="name">
              Name:
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </label>
            <label htmlFor="contact">
              Contact:
              <input
                type="text"
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              />
            </label>
            <label htmlFor="skills">
              Skills:
              <textarea
                id="skills"
                name="skills"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                onInput={handleTextareaResize}
                placeholder="Add skills (press Enter to add new line)"
              />
            </label>
            <label htmlFor="experience">
              Experience:
              <textarea
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                onInput={handleTextareaResize}
                placeholder="Add experience details (press Enter to add new line)"
              />
            </label>
            <label htmlFor="education">
              Education:
              <textarea
                id="education"
                name="education"
                value={formData.education}
                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                onInput={handleTextareaResize}
                placeholder="Add education details (press Enter to add new line)"
              />
            </label>
            <label htmlFor="projects">
              Projects:
              <textarea
                id="projects"
                name="projects"
                value={formData.projects}
                onChange={(e) => setFormData({ ...formData, projects: e.target.value })}
                onInput={handleTextareaResize}
                placeholder="Add project details (press Enter to add new line)"
              />
            </label>
            <button type="button" onClick={handleUpdate}>Update Data</button>
          </form>
        </div>
      )}
    </div>
  );
};

// Define PropTypes for type-checking
AdminPanel.propTypes = {
  cvData: PropTypes.shape({
    name: PropTypes.string.isRequired,
    contact: PropTypes.string.isRequired,
    skills: PropTypes.string,
    experience: PropTypes.string,
    education: PropTypes.string,
    projects: PropTypes.string,
  }).isRequired,
  setCvData: PropTypes.func.isRequired,
};

export default AdminPanel;
