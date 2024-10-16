import React, { useState, useEffect } from 'react';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import PropTypes from 'prop-types';
import { auth, db } from '../firebaseConfig';
import FileUpload from './FileUpload'; // Import the FileUpload component
import '../styles/AdminPanel.css';

const AdminPanel = ({ cvData, setCvData }) => {
  const [formData, setFormData] = useState({
    name: cvData.name || '',
    contact: cvData.contact || '',
    skills: cvData.skills || [],
    experience: cvData.experience || '',
    education: cvData.education || '',
    projects: [], // New state for projects
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch existing projects from Firestore on mount
  useEffect(() => {
    const docRef = doc(db, 'cvData', 'cvData');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFormData((prevData) => ({
          ...prevData,
          projects: data.projects || [], // Load projects from Firestore
        }));
      }
    });

    return () => unsubscribe(); // Clean up the listener on unmount
  }, []);

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
    setIsLoading(true); // Set loading state
    try {
      const docRef = doc(db, 'cvData', 'cvData');
      await updateDoc(docRef, formData);
      setCvData(formData);
      setSuccessMessage('Data updated successfully!');
    } catch (error) {
      setError('Error updating data. Please try again.');
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  // Handle file upload completion for projects
  const handleFileUpload = async (fileData) => {
    // Update the form data with the new file
    setFormData((prevFormData) => {
      const updatedProjects = [...prevFormData.projects];

      const projectIndex = updatedProjects.findIndex((project) => project.title === fileData.title);
      if (projectIndex > -1) {
        updatedProjects[projectIndex].files.push({
          ...fileData,
          isImage: fileData.fileURL.endsWith('.jpg') || fileData.fileURL.endsWith('.png') || fileData.fileURL.endsWith('.jpeg'),
        });
      } else {
        updatedProjects.push({
          title: fileData.title,
          description: fileData.description,
          hyperlink: fileData.hyperlink,
          files: [{ ...fileData, isImage: fileData.fileURL.endsWith('.jpg') || fileData.fileURL.endsWith('.png') || fileData.fileURL.endsWith('.jpeg') }],
        });
      }

      return { ...prevFormData, projects: updatedProjects };
    });

    // Update Firestore after adding a new project
    const docRef = doc(db, 'cvData', 'cvData');
    await updateDoc(docRef, { projects: formData.projects });

    // Set a success message for file upload
    setSuccessMessage('File uploaded successfully!');
    setTimeout(() => setSuccessMessage(''), 3000); // Clear success message after 3 seconds
  };

  // Handle file deletion
  const handleDeleteFile = (projectIndex, fileIndex) => {
    setFormData((prevFormData) => {
      const updatedProjects = [...prevFormData.projects];
      updatedProjects[projectIndex].files.splice(fileIndex, 1); // Remove the file from the project
      return { ...prevFormData, projects: updatedProjects };
    });

    setSuccessMessage('File deleted successfully!');
    setTimeout(() => setSuccessMessage(''), 3000); // Clear success message after 3 seconds
  };

  // Handle project deletion
  const handleDeleteProject = (projectIndex) => {
    setFormData((prevFormData) => {
      const updatedProjects = [...prevFormData.projects];
      updatedProjects.splice(projectIndex, 1); // Remove the entire project
      return { ...prevFormData, projects: updatedProjects };
    });

    setSuccessMessage('Project deleted successfully!');
    setTimeout(() => setSuccessMessage(''), 3000); // Clear success message after 3 seconds
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
                value={formData.skills.join(', ')} // Join the array for display
                onChange={(e) => {
                  const skillsArray = e.target.value.split(', ').map((skill) => skill.trim());
                  setFormData({ ...formData, skills: skillsArray }); // Update as an array
                }}
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
              {/* File Upload Section for Projects */}
              <FileUpload onFileUpload={handleFileUpload} />

              {/* Display Uploaded Files for Projects */}
              {formData.projects.length > 0 ? (
                <ul>
                  {formData.projects.map((project, projectIndex) => (
                    <li key={project.title}>
                      {' '}
                      {/* Use project.title instead of index */}
                      <h4>
                        Title:
                        {project.title}
                      </h4>
                      <p>
                        Description:
                        {project.description}
                      </p>
                      <p>
                        Hyperlink:
                        {' '}
                        <a href={project.hyperlink.startsWith('http') ? project.hyperlink : `https://${project.hyperlink}`} target="_blank" rel="noopener noreferrer">{project.hyperlink}</a>
                      </p>
                      <ul>
                        {project.files.map((fileData, fileIndex) => (
                          <li key={fileData.fileURL}>
                            {' '}
                            {/* Use fileData.fileURL instead of index */}
                            <p>
                              {fileData.isImage ? (
                                <img src={fileData.fileURL} alt="Uploaded" style={{ maxWidth: '100px' }} />
                              ) : (
                                <a href={fileData.fileURL} target="_blank" rel="noopener noreferrer">View File</a>
                              )}
                              <button type="button" onClick={() => handleDeleteFile(projectIndex, fileIndex)}>Delete</button>
                            </p>
                          </li>
                        ))}
                      </ul>
                      <button type="button" onClick={() => handleDeleteProject(projectIndex)}>Delete Project</button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No projects uploaded yet.</p>
              )}
            </label>
          </form>
          {isLoading && <p>Loading...</p>}
          <button type="button" onClick={handleUpdate}>Update Data</button>
        </div>
      )}
    </div>
  );
};

AdminPanel.propTypes = {
  cvData: PropTypes.shape({
    name: PropTypes.string,
    contact: PropTypes.string,
    skills: PropTypes.arrayOf(PropTypes.string),
    experience: PropTypes.string,
    education: PropTypes.string,
    projects: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.string,
      files: PropTypes.arrayOf(PropTypes.shape({ // Changed from PropTypes.object to PropTypes.shape
        fileURL: PropTypes.string.isRequired,
        description: PropTypes.string,
        hyperlink: PropTypes.string,
        isImage: PropTypes.bool,
      })),
    })),
  }),
  setCvData: PropTypes.func.isRequired,
};

AdminPanel.defaultProps = { // Added defaultProps declaration
  cvData: {},
};

export default AdminPanel;
