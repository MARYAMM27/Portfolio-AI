import React, { useState, useEffect, useRef } from 'react';
import nlp from 'compromise';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCog, faPaperPlane, faCode, faBriefcase, faGraduationCap, faProjectDiagram,
} from '@fortawesome/free-solid-svg-icons';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import '../styles/ChatBot.css';
import AdminPanel from './AdminPanel';
import profileImage from '../assets/image.png';

const ChatBot = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [cvData, setCvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdminPanelVisible, setIsAdminPanelVisible] = useState(false);
  const chatWindowRef = useRef(null);

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

  const fetchCvData = () => {
    const docRef = doc(db, 'cvData', 'cvData');
    onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (typeof data.skills === 'string') {
          data.skills = data.skills.split(',').map((skill) => skill.trim());
        }
        setCvData(data);
      } else {
        // console.error('No CV data found'); // Removed console statement
      }
      setLoading(false);
    }, () => {
      // console.error('Error fetching data:', error); // Removed console statement
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), text: 'Error fetching data. Please try again later.', sender: 'bot' },
      ]);
      setLoading(false);
    });
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
    hi: 'Hello! It’s a pleasure to have you here. I’m excited to assist you with any inquiries about my portfolio. How may I guide you today?',

    name: () => `My name is ${cvData?.name || 'N/A'}, and I’m thrilled to share my experiences and expertise with you. Feel free to ask me about my background, projects, or anything else you'd like to know.`,

    profession: () => `I specialize in the field of ${cvData?.profession || 'N/A'}, where I strive to bring creativity, innovation, and technical expertise to every project I undertake. If you're interested in learning more about my work, let's dive into the details.`,

    skills: () => {
      const skillsList = Array.isArray(cvData?.skills) && cvData.skills.length > 0
        ? cvData.skills.join(', ')
        : 'Skills data is currently unavailable.';
      return `Throughout my career, I have developed a broad set of skills that include: ${skillsList}. These skills empower me to handle diverse challenges effectively and adapt to new trends in the industry.`;
    },

    experience: () => (cvData?.experience
      ? `Over the course of my professional journey, I’ve accumulated valuable experience as a ${cvData.experience}, working on various projects that have honed my skills and expanded my expertise. I’d love to tell you more about these experiences and how they’ve shaped my approach to work.`
      : 'Currently, my professional experience is still growing, but I am eager to take on new opportunities that will help me further develop and apply my knowledge.'),

    projects: () => {
      if (Array.isArray(cvData?.projects) && cvData.projects.length > 0) {
        const projectDetails = cvData.projects
          .map((project, index) => {
            const projectFiles = project.files || [];
            const fileLinks = projectFiles.length > 0
              ? projectFiles.map((file) => `<a href="${file.fileURL}" target="_blank" rel="noopener noreferrer">${file.fileName}</a>`).join(', ')
              : 'No files available';

            // Include the hyperlink in the project details
            const projectHyperlink = project.hyperlink
              ? `<a href="${project.hyperlink.startsWith('http') ? project.hyperlink : `https://${project.hyperlink}`}" target="_blank" rel="noopener noreferrer">${project.hyperlink}</a>`
              : 'No hyperlink available.';

            return `
                  <strong>${index + 1}. ${project.title}:</strong> 
                  ${projectHyperlink} <br />
                  ${project.description || 'No description available.'} <br />
                  <strong>Files:</strong> ${fileLinks}
                `;
          })
          .join('<br /><br />'); // Join project details with line breaks for better readability

        return `I’ve had the privilege of completing several significant projects, including:<br />${projectDetails}<br />Each project reflects my commitment to quality and attention to detail.`;
      }
      return 'At the moment, I do not have any projects listed, but I’m always working on new initiatives and collaborations. I look forward to sharing them soon! You can also use the admin panel to manage projects.';
    },

    education: () => (cvData?.education
      ? `My academic journey includes a degree in ${cvData.education}, which has provided me with a solid foundation in my field. This education has equipped me with both theoretical knowledge and practical skills that I apply in my professional endeavors.`
      : 'Currently, I don’t have any formal education listed, but my ongoing self-learning and professional development keep me at the forefront of my field.'),

    contact: () => `I’d be happy to connect with you! Feel free to reach out via email at ${cvData?.contact?.email || 'N/A'} or by phone at ${cvData?.contact?.phone || 'N/A'}. Whether you have further inquiries or would like to discuss potential opportunities, I’m always open to conversation.`,
  };

  const handleBotResponse = (query) => {
    const normalizedQuery = normalizeQuery(query);
    const doc = nlp(normalizedQuery);
    const responseKey = Object.keys(responseMap).find((key) => doc.has(key));

    if (responseKey) {
      const response = responseMap[responseKey];
      return typeof response === 'function' ? response() : response;
    }
    return "I'm sorry, I don't have an answer for that. Try asking about my skills, experience, or projects.";
  };

  const handleSubmit = (query) => {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length > 3) {
      const userMessage = { id: Date.now(), text: trimmedQuery, sender: 'user' };
      setMessages((prev) => [...prev, userMessage]);
      const botResponse = handleBotResponse(trimmedQuery);
      setTimeout(() => {
        const botMessage = { id: Date.now() + 1, text: botResponse, sender: 'bot' };
        setMessages((prev) => [...prev, botMessage]);
      }, 500);
      setInput('');
    }
  };

  const handleTagClick = (query) => {
    handleSubmit(query);
  };

  const toggleAdminPanel = () => {
    if (cvData) {
      setIsAdminPanelVisible((prev) => !prev);
    }
  };

  return (
    <div className="chatbot-container">
      {loading ? (
        <div className="loading-spinner">Loading...</div>
      ) : (
        <div className="chatbot-wrapper">
          {/* Sidebar for Profile Info */}
          <div className="sidebar-extended">
            <img src={profileImage} alt="Profile" className="profile-image" />
            <div className="sidebar-info">
              <h3>{cvData?.name || 'N/A'}</h3>
              <p><strong>Email:</strong></p>
              <p>{cvData?.contact || 'N/A'}</p>
              <p><strong>Skills:</strong></p>
              <ul className="skills-list">
                {Array.isArray(cvData?.skills)
                  ? cvData.skills.map((skill) => <li key={skill}>{skill}</li>)
                  : 'No skills listed.'}
              </ul>
              <p><strong>Experience:</strong></p>
              <p>{cvData?.experience || 'N/A'}</p>
              <p><strong>Education:</strong></p>
              <p>{cvData?.education || 'N/A'}</p>
            </div>
          </div>

          {/* Chat Area */}
          <div className="chatbot-main">
            {isAdminPanelVisible && cvData ? (
              <AdminPanel cvData={cvData} setCvData={setCvData} />
            ) : (
              <>
                <div className="chat-window" ref={chatWindowRef}>
                  {messages.map((msg) => (
                    <div key={msg.id} className={`message ${msg.sender}`} dangerouslySetInnerHTML={{ __html: msg.text }} />
                  ))}
                </div>

                <div className="predefined-tags">
                  {predefinedTags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleTagClick(tag.query)}
                      className="tag-button glow-circle"
                      type="button"
                    >
                      <FontAwesomeIcon icon={tag.icon} className="tag-icon" />
                      {tag.label}
                    </button>
                  ))}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit(input);
                  }}
                  className="input-form"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me about my portfolio..."
                    className="chat-input"
                  />
                  <button type="submit" className="send-button" aria-label="Send">
                    <FontAwesomeIcon icon={faPaperPlane} />
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Admin Toggle Button Sidebar */}
          <div className="admin-toggle-sidebar">
            <button
              onClick={toggleAdminPanel}
              type="button"
              className="admin-toggle-button"
              aria-label="Admin Panel"
            >
              <FontAwesomeIcon icon={faCog} className="admin-icon" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
