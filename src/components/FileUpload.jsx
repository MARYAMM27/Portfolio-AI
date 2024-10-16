import React, { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import PropTypes from 'prop-types'; // Import prop-types
import { storage } from '../firebaseConfig'; // Adjust import based on your structure

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

    const storageRef = ref(storage, `uploads/${file.name}`); // Adjust the path as necessary
    setIsLoading(true);
    try {
      await uploadBytes(storageRef, file);
      const fileURL = await getDownloadURL(storageRef); // Get the download URL

      // Call the parent component function to handle the uploaded file data
      onFileUpload({
        title, description, hyperlink, fileURL,
      });
      setFile(null); // Clear the file input
      setTitle(''); // Clear title
      setDescription(''); // Clear description
      setHyperlink(''); // Clear hyperlink
      setError('');
    } catch (uploadError) {
      setError(`Error uploading file: ${uploadError.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <input type="text" placeholder="Project Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <input type="text" placeholder="Hyperlink" value={hyperlink} onChange={(e) => setHyperlink(e.target.value)} />
      <input type="file" onChange={handleFileChange} required />
      <button type="button" onClick={handleUpload} disabled={isLoading}>
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
