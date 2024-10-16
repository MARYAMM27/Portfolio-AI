// src/components/ProjectList.jsx
import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'projects'), (snapshot) => {
      const projectList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProjects(projectList);
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  return (
    <div className="project-list">
      <h3>My Projects</h3>
      {projects.length > 0 ? (
        <ul>
          {projects.map((project) => (
            <li key={project.id} className="project-item">
              <h4>{project.title}</h4>
              <p>{project.description}</p>
              <img src={project.imageUrl} alt={project.title} className="project-image" />
              <a href={project.link} target="_blank" rel="noopener noreferrer">View Project</a>
            </li>
          ))}
        </ul>
      ) : (
        <p>No projects available.</p>
      )}
    </div>
  );
};

export default ProjectList;
