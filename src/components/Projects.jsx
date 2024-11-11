import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebaseConfig';
import '../styles/Projects.css';

const FileUpload = ({
  onFileUpload, initialData = {}, onCancel, isEditMode = false, onSaveEdit,
}) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState(initialData.title || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [hyperlink, setHyperlink] = useState(initialData.hyperlink || '');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validFileTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validFileTypes.includes(selectedFile.type)) {
        setError('Invalid file type. Please upload a JPEG or PNG image.');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file || !title) {
      setError('File and title are required');
      return;
    }

    const storageRef = ref(storage, `uploads/${file.name}`);
    setIsLoading(true);
    try {
      await uploadBytes(storageRef, file);
      const fileURL = await getDownloadURL(storageRef);

      onFileUpload({
        title,
        description,
        hyperlink,
        fileURL,
        fileName: file.name,
      });

      setFile(null);
      setTitle('');
      setDescription('');
      setHyperlink('');
      setError('');
    } catch (uploadError) {
      setError(`Error uploading file: ${uploadError.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (!title) {
      setError('Title is required');
      return;
    }

    const updatedData = {
      ...initialData,
      title,
      description,
      hyperlink,
      fileURL: file ? URL.createObjectURL(file) : initialData.fileURL,
    };

    onSaveEdit(updatedData);
  };

  return (
    <div className="file-upload-container">
      <input
        type="text"
        className="file-upload-input"
        placeholder="Project Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        className="file-upload-textarea"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="text"
        className="file-upload-input"
        placeholder="Hyperlink"
        value={hyperlink}
        onChange={(e) => setHyperlink(e.target.value)}
      />
      {!isEditMode && (
        <input
          type="file"
          className="file-upload-input"
          onChange={handleFileChange}
          required
        />
      )}
      {initialData && !file && (
        <div className="uploaded-image-preview">
          <img
            src={initialData.fileURL}
            alt={initialData.fileName}
            className="uploaded-image"
          />
        </div>
      )}
      {isEditMode ? (
        <button
          type="button"
          className="file-upload-button"
          onClick={handleSave}
          disabled={isLoading || !title}
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      ) : (
        <button
          type="button"
          className="file-upload-button"
          onClick={handleUpload}
          disabled={isLoading || !file}
        >
          {isLoading ? 'Uploading...' : 'Upload File'}
        </button>
      )}
      <button type="button" className="cancel-button" onClick={onCancel}>
        Cancel
      </button>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

FileUpload.propTypes = {
  onFileUpload: PropTypes.func.isRequired,
  initialData: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    hyperlink: PropTypes.string,
    fileURL: PropTypes.string,
    fileName: PropTypes.string,
  }),
  onCancel: PropTypes.func.isRequired,
  isEditMode: PropTypes.bool,
  onSaveEdit: PropTypes.func.isRequired,

};
FileUpload.defaultProps = {
  initialData: {},
  isEditMode: false,
};

const Projects = ({ formData, setFormData }) => {
  const [projects, setProjects] = useState(() => {
    const storedProjects = localStorage.getItem('projects');
    return storedProjects ? JSON.parse(storedProjects) : formData.projects || [];
  });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  const handleFileUpload = (uploadedData) => {
    const newProject = {
      id: Date.now(),
      title: uploadedData.title,
      description: uploadedData.description || '',
      hyperlink: uploadedData.hyperlink || '',
      fileURL: uploadedData.fileURL,
      fileName: uploadedData.fileName,
    };

    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    setFormData({ ...formData, projects: updatedProjects });
    setIsAddingProject(false);
  };

  const handleEditProject = (index) => {
    setEditData({ ...projects[index], index });
  };

  const handleSaveEdit = (updatedData) => {
    const updatedProjects = [...projects];
    updatedProjects[updatedData.index] = updatedData;
    setProjects(updatedProjects);
    setFormData({ ...formData, projects: updatedProjects });
    setEditData(null);
  };

  const handleDeleteProject = (index) => {
    const updatedProjects = projects.filter((_, i) => i !== index);
    setProjects(updatedProjects);
    setFormData({ ...formData, projects: updatedProjects });
  };

  const handleNextImage = () => {
    if (projects.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % projects.length);
    }
  };

  const handlePrevImage = () => {
    if (projects.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? projects.length - 1 : prevIndex - 1));
    }
  };

  return (
    <div className="projects-container">
      <h2>Manage Projects</h2>

      {!isAddingProject && (
        <button onClick={() => setIsAddingProject(true)} className="add-project-button" type="button">
          Add New Project
        </button>
      )}

      {isAddingProject && (
        <FileUpload
          onFileUpload={handleFileUpload}
          onCancel={() => setIsAddingProject(false)}
        />
      )}

      <h3>Projects</h3>
      {projects.length > 0 ? (
        <>
          <div className="project-slider">
            {projects.length > 1 && (
              <>
                <button className="prev-button" onClick={handlePrevImage} type="button">
                  &#9664;
                </button>
                <button className="next-button" onClick={handleNextImage} type="button">
                  &#9654;
                </button>
              </>
            )}
            {projects[currentImageIndex] && (
              <div className="slider-image-container">
                <img
                  src={projects[currentImageIndex].fileURL}
                  alt={projects[currentImageIndex].fileName}
                  className="slider-image"
                  style={{ objectFit: 'contain', width: '100%', height: '300px' }}
                />
              </div>
            )}
          </div>

          <div className="project-details">
            {editData && editData.index === currentImageIndex ? (
              <FileUpload
                initialData={editData}
                onFileUpload={handleSaveEdit}
                onCancel={() => setEditData(null)}
                isEditMode
                onSaveEdit={handleSaveEdit}
              />
            ) : (
              <>
                <h4 style={{ fontWeight: 'bold' }}>{projects[currentImageIndex].title}</h4>
                <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '10px' }}>
                  Description:
                </p>
                <p>{projects[currentImageIndex].description}</p>
                {projects[currentImageIndex].hyperlink && (
                  <a
                    href={projects[currentImageIndex].hyperlink.startsWith('http') ? projects[currentImageIndex].hyperlink : `https://${projects[currentImageIndex].hyperlink}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-link"
                  >
                    Visit Project
                  </a>
                )}

                <button
                  className="edit-project-button"
                  onClick={() => handleEditProject(currentImageIndex)}
                  type="button"
                >
                  Edit
                </button>
                <button
                  className="delete-project-button"
                  onClick={() => handleDeleteProject(currentImageIndex)}
                  type="button"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </>
      ) : (
        <p>No projects available. Please add a project.</p>
      )}
    </div>
  );
};

Projects.propTypes = {
  formData: PropTypes.shape({
    projects: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string,
        description: PropTypes.string,
        hyperlink: PropTypes.string,
        fileURL: PropTypes.string,
        fileName: PropTypes.string,
      }),
    ),
  }).isRequired,
  setFormData: PropTypes.func.isRequired,
};

export default Projects;
