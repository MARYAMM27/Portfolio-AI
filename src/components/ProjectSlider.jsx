// src/components/ProjectSlider.js
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const ProjectSlider = () => {
  const [projects, setProjects] = useState([]);

  const fetchProjects = async () => {
    const querySnapshot = await getDocs(collection(db, 'projects'));
    const projectsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setProjects(projectsData);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="project-slider">
      {projects.length > 0 ? (
        projects.map((project) => (
          <div key={project.id} className="project-card">
            <h3>{project.title}</h3>
            <img src={project.image} alt={project.title} style={{ width: '200px', height: 'auto' }} />
            <p>{project.description}</p>
            <a href={project.link} target="_blank" rel="noopener noreferrer">View Project</a>
          </div>
        ))
      ) : (
        <p>No projects available.</p>
      )}
    </div>
  );
};

export default ProjectSlider;
