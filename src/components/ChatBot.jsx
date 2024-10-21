import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import nlp from 'compromise';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCog,
  faPaperPlane,
  faCode,
  faBriefcase,
  faGraduationCap,
  faProjectDiagram,
} from '@fortawesome/free-solid-svg-icons';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Ensure the import path is correct
import '../styles/ChatBot.css';
import profileImage from '../assets/image.png';

const ChatBot = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [cvData, setCvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const chatWindowRef = useRef(null);
  const navigate = useNavigate(); // Initialize navigate

  const predefinedTags = [
    {
      id: '1', label: 'Skills', query: 'What skills do you have?', icon: faCode,
    },
    {
      id: '2', label: 'Experience', query: 'Tell me about your experience.', icon: faBriefcase,
    },
    {
      id: '3', label: 'Education', query: 'Tell me about your education.', icon: faGraduationCap,
    },
    {
      id: '4', label: 'Projects', query: 'What projects have you worked on?', icon: faProjectDiagram,
    },
  ];

  // Fetch CV data from Firestore
  const fetchCvData = () => {
    const docRef = doc(db, 'cvData', 'cvData');
    onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (typeof data.skills === 'string') {
            data.skills = data.skills.split(',').map((skill) => skill.trim());
          }
          if (typeof data.experience === 'string') {
            data.experience = data.experience.split(',').map((exp) => exp.trim());
          }
          setCvData(data);
        }
        setLoading(false);
      },
      () => {
        setMessages((prev) => [
          ...prev,
          { id: Date.now(), text: 'Error fetching data. Please try again later.', sender: 'bot' },
        ]);
        setLoading(false);
      },
    );
  };

  useEffect(() => {
    fetchCvData();
  }, []);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const normalizeQuery = (query) => {
    const doc = nlp(query.toLowerCase());
    let normalizedQuery = query.toLowerCase();

    const synonyms = {
      hi: ['hello', 'hey there', 'hey'],
      skills: ['skills', 'abilities', 'qualities'],
      experience: ['experience', 'background', 'work history'],
      education: ['education', 'qualifications', 'academic background'],
      projects: ['projects', 'works', 'portfolio', 'expertise'],
      contact: ['contact', 'reach', 'get in touch'],
    };

    Object.keys(synonyms).forEach((key) => {
      synonyms[key].forEach((synonym) => {
        if (doc.has(synonym)) {
          normalizedQuery = normalizedQuery.replace(synonym, key);
        }
      });
    });

    return normalizedQuery;
  };

  const responseMap = {
    hi: () => `Greetings! It's a pleasure to welcome you. 
    I am here to assist you with any inquiries regarding my portfolio. 
    How may I assist you today?`,

    name: () => `My name is ${cvData?.name || 'N/A'}.\nI am pleased to share my professional experiences and
     expertise with you. I am dedicated to continuous learning and committed to excellence in my work. 
     My goal is to provide valuable insights and support as you explore my portfolio. 
     \nWhat do you know about me, and how can I assist you further in your inquiries?`,

    profession: () => `I specialize in the field of ${cvData?.profession || 'N/A'}.\nWhere I strive to bring creativity and expertise.`,

    skills: () => {
      const skillsList = Array.isArray(cvData?.skills) && cvData.skills.length > 0
        ? cvData.skills.join(', ')
        : 'Skills data is currently unavailable.';
      return `Here are some of my skills:\n${skillsList}.`;
    },

    experience: () => {
      if (Array.isArray(cvData?.experiences) && cvData.experiences.length > 0) {
        const experienceDetails = cvData.experiences
          .map((experience, index) => {
            const {
              jobTitle, company, startDate, endDate,
            } = experience;
            return `${index + 1}. ${jobTitle || 'N/A'} at ${company || 'N/A'} from ${startDate || 'N/A'} to ${endDate || 'N/A'}`;
          })
          .join('\n');
        return `My professional experience includes:\n${experienceDetails}.`;
      }
      return 'Experience data is currently unavailable.';
    },
    projects: () => {
      // Retrieve the projects from localStorage (or replace this with your fetch logic)
      const storedProjects = localStorage.getItem('projects');
      const cvDataProjects = storedProjects ? JSON.parse(storedProjects) : [];

      // Check if projects exist and map through them
      if (Array.isArray(cvDataProjects) && cvDataProjects.length > 0) {
        const projectDetails = cvDataProjects.map((project, index) => {
          const projectHyperlink = project.hyperlink
            ? `<a href="${project.hyperlink.startsWith('http') ? project.hyperlink : `https://${project.hyperlink}`}" target="_blank" rel="noopener noreferrer">${project.hyperlink}</a>`
            : 'No hyperlink available.';

          return `<strong>${index + 1}. ${project.title}</strong>\n
          ${project.description || 'No description available.'}\n
          <strong>Hyperlink:</strong> ${projectHyperlink}\n
          <strong>Uploaded File:</strong> <a href="${project.fileURL}" target="_blank" rel="noopener noreferrer">${project.fileName}</a>`;
        }).join('\n\n');

        return `I am skilled in various projects, some of are more fascinating also these projects highlight my domain expertise:\n\n${projectDetails}`;
      }

      return 'No projects available.';
    },

    education: () => (cvData?.education ? `I hold a degree in ${cvData.education}.` : 'Education data is currently unavailable.'),

    contact: () => `You can reach me via email at ${cvData?.email || 'N/A'}.`,

    goodbye: () => 'Thank you for your time! If you have any more questions, feel free to ask. Have a great day!',
  };

  const handleBotResponse = (query) => {
    const normalizedQuery = normalizeQuery(query);
    const doc = nlp(normalizedQuery);
    const responseKey = Object.keys(responseMap).find((key) => doc.has(key));

    if (responseKey) {
      const response = responseMap[responseKey];
      return typeof response === 'function' ? response() : response;
    }
    return "I'm sorry, I don't have an answer for that.";
  };

  const handleSubmit = (query) => {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length > 0) {
      const userMessage = { id: Date.now(), text: trimmedQuery, sender: 'user' };
      setMessages((prev) => [...prev, userMessage]);

      const botResponse = handleBotResponse(trimmedQuery);

      setTimeout(() => {
        const botMessage = { id: Date.now() + 1, text: botResponse, sender: 'bot' };
        setMessages((prev) => [...prev, botMessage]);
      }, 500);

      setInput(''); // Clear the input after submitting
    }
  };

  const handleTagClick = (query) => {
    handleSubmit(query);
  };

  const toggleAdminPanel = () => {
    navigate('/login'); // Navigate to the Login page
  };

  return (
    <div className="chatbot-container">
      {loading ? (
        <div className="loading-spinner">Loading...</div>
      ) : (
        <div className="chatbot-wrapper">
          <div className="sidebar-extended">
            <img src={profileImage} alt="Profile" className="profile-image" />
            <div className="sidebar-info">
              <h3>{cvData?.name || 'N/A'}</h3>

              <div className="sidebar-section">
                <p><strong>Email:</strong></p>
                <ul className="email-list">
                  <li>{cvData?.email || 'N/A'}</li>
                </ul>
              </div>

              <div className="sidebar-section">
                <p><strong>Skills:</strong></p>
                <ul className="skills-list">
                  {Array.isArray(cvData?.skills) && cvData.skills.length > 0 ? (
                    cvData.skills.map((skill) => (
                      <li key={skill}>{skill || 'No skills available.'}</li> // Use skill as key
                    ))
                  ) : (
                    <li>No skills listed.</li>
                  )}
                </ul>
              </div>

              <div className="sidebar-section">
                <p><strong>Experience:</strong></p>
                <ul className="experience-list">
                  {Array.isArray(cvData?.experiences) && cvData.experiences.length > 0 ? (
                    cvData.experiences.map((exp) => (
                      <li key={exp.id || `${exp.jobTitle}-${exp.company}-${exp.startDate}`}>
                        {' '}
                        {/* Use exp.id or a unique string as key */}
                        {`${exp.jobTitle || 'N/A'} at ${exp.company || 'N/A'} (${exp.startDate || 'N/A'} - ${exp.endDate || 'N/A'})`}
                      </li>
                    ))
                  ) : (
                    <li>No experience listed.</li>
                  )}
                </ul>
              </div>

              <div className="sidebar-section">
                <p><strong>Education:</strong></p>
                <ul className="education-list">
                  <li>{cvData?.education || 'N/A'}</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="chatbot-main">
            <div className="chat-window" ref={chatWindowRef}>
              {messages.map((msg) => (
                <div key={msg.id} className={`message ${msg.sender}`} dangerouslySetInnerHTML={{ __html: msg.text }} />
              ))}
            </div>

            <div className="predefined-tags">
              {predefinedTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button" // Added type attribute
                  onClick={() => handleTagClick(tag.query)}
                  className="tag-button glow-circle"
                  aria-label={tag.label}
                >
                  <FontAwesomeIcon icon={tag.icon} />
                  {tag.label}
                </button>

              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault(); // Prevent default form behavior
                handleSubmit(input); // Submit the message
              }}
              className="input-form"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me about my portfolio..."
                className="chat-input"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault(); // Prevent new line on enter
                    handleSubmit(input); // Submit the message
                  }
                }}
              />
              <button type="submit" className="send-button" aria-label="Send">
                <FontAwesomeIcon icon={faPaperPlane} />
              </button>
            </form>
          </div>

          <div className="admin-toggle">
            <button type="button" onClick={toggleAdminPanel} className="admin-button">
              <FontAwesomeIcon icon={faCog} />
              {' '}
              Admin
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
