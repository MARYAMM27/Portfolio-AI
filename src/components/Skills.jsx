import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { getAuth } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import '../styles/Skills.css'; // Import your CSS for styling
import { db } from '../firebaseConfig'; // Import your Firebase configuration

const Skills = ({ formData, setFormData, handleUpdate }) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [currentSkill, setCurrentSkill] = useState('');

  // Ensure formData.skills is defined and use an empty array if undefined
  const skills = useMemo(() => formData.skills || [], [formData.skills]);

  // Fetch skills from Firestore when component mounts
  useEffect(() => {
    const fetchSkillsFromFirestore = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const userId = user.uid;
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const skillsArray = data.skills || [];
          setFormData((prev) => ({ ...prev, skills: skillsArray }));
          localStorage.setItem('skills', JSON.stringify(skillsArray));
        }
      }
    };

    fetchSkillsFromFirestore();
  }, [setFormData]);

  // Update local storage whenever skills change
  useEffect(() => {
    localStorage.setItem('skills', JSON.stringify(skills));
  }, [skills]);

  // Update skills in Firestore
  const updateSkillsInFirestore = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const userId = user.uid;
        const docRef = doc(db, 'users', userId);

        await setDoc(docRef, { skills: formData.skills }, { merge: true });
      }
    } catch (error) {
      // Handle error if necessary
    }
  };

  const addSkill = () => {
    const newSkills = [...skills, { id: Date.now(), name: '' }];
    setFormData({ ...formData, skills: newSkills });
    setEditingIndex(newSkills.length - 1);
    updateSkillsInFirestore(); // Update Firestore after adding a skill
  };

  const deleteSkill = (index) => {
    const newSkills = skills.filter((_, i) => i !== index);
    setFormData({ ...formData, skills: newSkills });
    setSuccessMessage('Skill deleted successfully!');
    setErrorMessage('');
    updateSkillsInFirestore(); // Update Firestore after deletion
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setCurrentSkill(skills[index].name);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setCurrentSkill('');
  };

  const handleSaveEdit = (index) => {
    const newSkills = [...skills];
    newSkills[index].name = currentSkill;
    setFormData({ ...formData, skills: newSkills });
    setEditingIndex(null);
    setCurrentSkill('');
    setSuccessMessage('Skill updated successfully!');
    updateSkillsInFirestore(); // Update Firestore after saving edits
  };

  const handleSkillsUpdate = async () => {
    try {
      await handleUpdate();
      await updateSkillsInFirestore(); // Update Firestore with all skills
      setSuccessMessage('All skills updated successfully!');
      setErrorMessage('');
    } catch (error) {
      setErrorMessage('Error updating skills. Please try again.');
      setSuccessMessage('');
    }
  };

  return (
    <div className="skills-container">
      <h2>Skills</h2>
      {skills.map((skill, index) => (
        <div key={skill.id} className="skill-entry">
          {editingIndex === index ? (
            <div className="info-field">
              <input
                className="info-input"
                type="text"
                value={currentSkill}
                onChange={(e) => setCurrentSkill(e.target.value)}
                placeholder="Edit skill"
              />
              <button
                className="save-skill-button"
                type="button"
                onClick={() => handleSaveEdit(index)}
              >
                Save
              </button>
              <button
                className="cancel-skill-button"
                type="button"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="skill-details">
              <p>{skill.name}</p>
              <div>
                <button
                  className="edit-skill-button"
                  type="button"
                  onClick={() => handleEdit(index)}
                >
                  Edit
                </button>
                <button
                  className="delete-skill-button"
                  type="button"
                  onClick={() => deleteSkill(index)}
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      <button className="add-skill-button" type="button" onClick={addSkill}>
        Add Skill
      </button>
      <button className="update-button" type="button" onClick={handleSkillsUpdate}>
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
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
      }),
    ).isRequired,
  }).isRequired,
  setFormData: PropTypes.func.isRequired,
  handleUpdate: PropTypes.func.isRequired,
};

export default Skills;
