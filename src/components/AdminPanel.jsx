import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import {
  Route, Routes, Link, useNavigate,
} from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAngleLeft, faAngleRight, faUser, faTools,
  faGraduationCap, faFolder, faSignOutAlt, faSun, faMoon,
} from '@fortawesome/free-solid-svg-icons';
import { db, auth } from '../firebaseConfig';
import PersonalInfo from './PersonalInfo';
import Skills from './Skills';
import Education from './Education';
import Projects from './Projects';
import Experience from './Experience'; // Import the Experience component
import '../styles/AdminPanel.css';

const AdminPanel = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    skills: [''],
    education: [''],
    experiences: [], // Add experiences to formData
    projects: [],
  });

  const [error, setError] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState('light');
  const navigate = useNavigate();

  // Fetch data from Firestore
  useEffect(() => {
    const docRef = doc(db, 'cvData', 'cvData');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFormData((prevData) => ({
          ...prevData,
          ...data,
          education: Array.isArray(data.education) ? data.education : [],
          skills: Array.isArray(data.skills) ? data.skills : [''],
          experiences: Array.isArray(data.experiences) ? data.experiences : [],
        }));
      }
    });
    return () => unsubscribe();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      setError('Error logging out. Please try again.');
    }
  };

  // Toggle theme
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Update Firestore
  const updateFirestore = async () => {
    const docRef = doc(db, 'cvData', 'cvData');
    try {
      await updateDoc(docRef, formData);
    } catch (error) {
      setError('Error updating data in Firestore. Please try again.');
    }
  };

  return (
    <div className={`admin-panel ${theme}-theme`}>
      <nav className={`navbar ${collapsed ? 'collapsed' : ''}`}>
        <button
          className="toggle-nav"
          type="button"
          onClick={() => setCollapsed(!collapsed)}
        >
          <FontAwesomeIcon icon={collapsed ? faAngleRight : faAngleLeft} />
        </button>
        <ul>
          <li>
            <Link to="personal-info">
              <FontAwesomeIcon icon={faUser} />
              {!collapsed && ' Personal Information'}
            </Link>
          </li>
          <li>
            <Link to="skills">
              <FontAwesomeIcon icon={faTools} />
              {!collapsed && ' Skills'}
            </Link>
          </li>
          <li>
            <Link to="education">
              <FontAwesomeIcon icon={faGraduationCap} />
              {!collapsed && ' Education'}
            </Link>
          </li>
          <li>
            <Link to="projects">
              <FontAwesomeIcon icon={faFolder} />
              {!collapsed && ' Projects'}
            </Link>
          </li>
          <li>
            <Link to="experience">
              <FontAwesomeIcon icon={faFolder} />
              {!collapsed && ' Experience'}
            </Link>
          </li>
        </ul>
        <button
          onClick={handleLogout}
          className="logout-button"
          type="button"
        >
          <FontAwesomeIcon icon={faSignOutAlt} />
          {!collapsed && ' Logout'}
        </button>
        <button
          onClick={toggleTheme}
          className="theme-toggle-button"
          type="button"
        >
          <FontAwesomeIcon icon={theme === 'light' ? faSun : faMoon} />
        </button>
      </nav>

      <div className="admin-content">
        <h1>Welcome to the Administration Editor</h1>
        <p>Welcome to the administration editor to edit, add, update your data.</p>

        <div className="content-scroll">
          <Routes>
            <Route
              path="personal-info"
              element={(
                <PersonalInfo
                  formData={formData}
                  setFormData={setFormData}
                  handleUpdate={updateFirestore}
                />
              )}
            />
            <Route
              path="skills"
              element={(
                <Skills
                  formData={formData}
                  setFormData={setFormData}
                  handleUpdate={updateFirestore}
                />
              )}
            />
            <Route
              path="education"
              element={(
                <Education
                  formData={formData}
                  setFormData={setFormData}
                  handleUpdate={updateFirestore}
                />
              )}
            />
            <Route
              path="projects"
              element={(
                <Projects
                  formData={formData}
                  setFormData={setFormData}
                  handleUpdate={updateFirestore}
                />
              )}
            />
            <Route
              path="experience"
              element={(
                <Experience
                  formData={formData}
                  setFormData={setFormData}
                  handleUpdate={updateFirestore}
                />
              )}
            />
          </Routes>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default AdminPanel;
