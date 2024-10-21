import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes for validation
import FileUpload from './FileUpload'; // Import the FileUpload component
import '../styles/Projects.css'; // Ensure to import the new CSS file

const Projects = ({ formData, setFormData }) => {
  // Initialize projects state with localStorage data or formData.projects
  const [projects, setProjects] = useState(() => {
    const storedProjects = localStorage.getItem('projects');
    return storedProjects ? JSON.parse(storedProjects) : formData.projects || [];
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Save projects to localStorage when the projects state changes
  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  // Handle file upload and add new project
  const handleFileUpload = (uploadedData) => {
    if (!uploadedData || !uploadedData.title || !uploadedData.fileURL) {
      setErrorMessage('Invalid project data. Please ensure all fields are filled.');
      setSuccessMessage('');
      return;
    }

    const newProject = {
      id: Date.now(), // Create a unique ID based on timestamp
      title: uploadedData.title,
      description: uploadedData.description || '',
      hyperlink: uploadedData.hyperlink || '',
      fileURL: uploadedData.fileURL,
      fileName: uploadedData.fileName || uploadedData.fileURL.split('/').pop(),
    };

    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    setFormData({ ...formData, projects: updatedProjects });
    setSuccessMessage('Project added successfully!');
    setErrorMessage('');
  };

  // Handle project deletion
  const handleDeleteProject = (index) => {
    const updatedProjects = projects.filter((_, i) => i !== index);
    setProjects(updatedProjects);
    setFormData({ ...formData, projects: updatedProjects });
    setSuccessMessage('Project deleted successfully!');
    setErrorMessage('');
  };

  return (
    <div className="projects-container">
      <h2>Upload Project Files</h2>
      <FileUpload onFileUpload={handleFileUpload} />

      <h3>Projects</h3>
      {projects.length > 0 ? (
        projects.map((project) => (
          <div key={project.id} className="project-item">
            {' '}
            {/* Use unique ID for key */}
            <h4>{project.title}</h4>
            <p>{project.description}</p>
            {project.hyperlink && (
              <a href={project.hyperlink} target="_blank" rel="noopener noreferrer">
                View Project Link
              </a>
            )}
            <p>
              Uploaded File:
              {project.fileURL ? (
                <a href={project.fileURL} target="_blank" rel="noopener noreferrer">
                  {project.fileName}
                </a>
              ) : (
                ' No file uploaded.'
              )}
            </p>
            <button
              className="delete-button"
              type="button" // Added type attribute
              onClick={() => handleDeleteProject(project.id)} // Use unique ID for deletion
            >
              Delete
            </button>
          </div>
        ))
      ) : (
        <p>No projects added yet.</p>
      )}

      {successMessage && <p className="success-message">{successMessage}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
};

// Prop types validation
Projects.propTypes = {
  formData: PropTypes.shape({
    projects: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string.isRequired,
        description: PropTypes.string,
        hyperlink: PropTypes.string,
        fileURL: PropTypes.string.isRequired,
        fileName: PropTypes.string,
      }),
    ).isRequired,
  }).isRequired,
  setFormData: PropTypes.func.isRequired,
};

export default Projects;
