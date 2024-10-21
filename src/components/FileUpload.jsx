import React, { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import PropTypes from 'prop-types';
import { storage } from '../firebaseConfig'; // Adjust import based on your structure
import '../styles/FileUpload.css'; // Import the CSS file for FileUpload styles

const FileUpload = ({ onFileUpload }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hyperlink, setHyperlink] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
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

      // Pass the uploaded file data to the parent component
      onFileUpload({
        title,
        description,
        hyperlink,
        fileURL,
        fileName: file.name, // Send file name
      });

      // Clear form after successful upload
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
      <input
        type="file"
        className="file-upload-input"
        onChange={handleFileChange}
        required
      />
      <button
        type="button"
        className="file-upload-button"
        onClick={handleUpload}
        disabled={isLoading}
      >
        {isLoading ? 'Uploading...' : 'Upload File'}
      </button>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

FileUpload.propTypes = {
  onFileUpload: PropTypes.func.isRequired,
};

export default FileUpload;
