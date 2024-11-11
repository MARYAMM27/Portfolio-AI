// ChatBot.jsx
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
import { db } from '../firebaseConfig';
import '../styles/ChatBot.css';
import profileImage from '../assets/image.png';
import ProjectSlider from './ProjectSlider';

const ChatBot = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [cvData, setCvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const chatWindowRef = useRef(null);
  const navigate = useNavigate();

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
    onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Ensure skills and experience are arrays
          data.skills = Array.isArray(data.skills)
            ? data.skills
            : data.skills?.split(',').map((skill) => skill.trim()) || [];
          data.experience = Array.isArray(data.experience)
            ? data.experience
            : data.experience?.split(',').map((exp) => exp.trim()) || [];
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
    chatWindowRef.current?.scrollTo({ top: chatWindowRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const normalizeQuery = (query) => {
    const doc = nlp(query.toLowerCase());
    let normalizedQuery = query.toLowerCase();
    const synonyms = {
      introduce: ['tell me something about you', 'who are you', 'tell me about yourself', 'introduce yourself'],
      hi: ['hello', 'hey there', 'hey'],
      skills: ['skills', 'abilities', 'qualities'],
      experience: ['experience', 'background', 'work history'],
      education: ['education', 'qualifications', 'academic background'],
      projects: ['projects', 'works', 'portfolio', 'expertise'],
      contact: ['contact', 'reach', 'get in touch'],
    };
    Object.keys(synonyms).forEach((key) => {
      synonyms[key].forEach((synonym) => {
        if (doc.has(synonym)) normalizedQuery = key;
      });
    });
    return normalizedQuery;
  };

  const responseMap = {
    introduce: () => {
      const introduction = cvData?.introduction || 'I am a dedicated professional eager to assist you!';

      // Check for specific keywords in the introduction
      if (introduction.toLowerCase().includes('software')) {
        return `
          I have a strong background in software development,
           particularly in data analytics and machine learning using Python. My expertise includes designing and implementing algorithms that extract insights from data, facilitating better decision-making. I am passionate about leveraging technology to drive innovation and efficiency.
        `;
      } if (introduction.toLowerCase().includes('electrical') || introduction.toLowerCase().includes('telecom')) {
        return `
          I specialize in electrical power systems and telecommunications, 
          focusing on optimizing network performance and ensuring reliable energy distribution.
           My experience includes designing electrical systems and managing telecommunications projects that enhance connectivity and operational efficiency. I am dedicated to advancing technology in these critical sectors.
        `;
      }
      return `
          As a professional in management, I hold degrees in BBA and MBA, with a focus on finance. 
          I possess a solid understanding of financial principles and management strategies that drive organizational success. My experience encompasses leading teams, managing projects, and optimizing operations for sustainable growth.
        `;
    },
    hi: () => "Hello there! I'm here to help you explore my portfolio. Feel free to ask any questions or let me know what you’d like to learn more about!",
    name: () => `My name is ${cvData?.name || 'N/A'}, and I am pleased to meet you. I bring a wealth of experience and a passion for excellence in my work. Let's connect and explore how I can contribute to your success.`,
    profession: () => {
      const skillsList = cvData?.skills?.map((skill, i) => `${i + 1}. ${skill.name || skill}`).join(', ') || 'N/A';
      return `I specialize in ${skillsList}, where I leverage my skills to deliver impactful solutions. My expertise allows me to contribute effectively and drive success in various projects. I'm committed to continuous learning and staying ahead in my field.`;
    },
    skills: () => {
      const skillList = cvData?.skills?.map((skill, i) => (
        <div key={skill.id || skill.name || `skill-${i}`}>
          <strong>
            {i + 1}
            .
            {skill.name || skill}
          </strong>
        </div>

      )) || <div>N/A</div>;

      return (
        <div>
          <p>
            I possess a diverse set of abilities:
          </p>
          <div style={{ margin: '10px 0' }}>
            {skillList}
          </div>
          <p>
            These skills enable me to tackle challenges effectively and
            deliver high-quality results in my work.
            I&apos;m always eager to learn new skills to stay relevant in my field.
          </p>
        </div>
      );
    },

    experience: () => (cvData?.experiences?.length ? (
      <>
        Here’s a summary of my professional experience:
        {cvData.experiences.map((exp, i) => (
          <div key={exp.id || `experience-${i}`} style={{ marginTop: '10px' }}>
            {i + 1}
            .
            <strong>Position:</strong>
            {' '}
            {exp.jobTitle}
            <br />
            <strong>Company:</strong>
            {' '}
            {exp.company}
            <br />
            <strong>Duration:</strong>
            {' '}
            {exp.startDate}
            {' '}
            -
            {' '}
            {exp.endDate}
            <br />
          </div>
        ))}
        <p>Feel free to ask more about any specific role!</p>
      </>
    ) : (
      'I&apos;m currently unable to provide experience details. Please check back later.'
    )),

    projects: () => {
      const storedProjects = JSON.parse(localStorage.getItem('projects') || '[]');

      if (storedProjects.length === 0) {
        return <p>No projects available.</p>;
      }

      return (
        <div>
          <h3>Here are some of my projects:</h3>
          <ProjectSlider projects={storedProjects} />
        </div>
      );
    },

    education: () => {
      const educationField = cvData?.education || 'N/A';
      const educationDescription = Array.isArray(educationField)
        ? educationField[0] : educationField;
      let description = '';

      if (educationDescription.toLowerCase().includes('computer')
            || educationDescription.toLowerCase().includes('software')
            || educationDescription.toLowerCase().includes('ai')) {
        description = (
          <span>
            <strong>{educationDescription}</strong>
            : My education equips me with the skills to develop innovative solutions
            in data analytics and software development.
          </span>
        );
      } else if (educationDescription.toLowerCase().includes('mba')
                   || educationDescription.toLowerCase().includes('finance')
                   || educationDescription.toLowerCase().includes('bba')
                   || educationDescription.toLowerCase().includes('accounts')) {
        description = (
          <span>
            <strong>{educationDescription}</strong>
            : I have a background in management, focusing on strategic
            financial decision-making and business administration.
          </span>
        );
      } else if (educationDescription.toLowerCase().includes('engineering')
                   || educationDescription.toLowerCase().includes('electrical')
                   || educationDescription.toLowerCase().includes('telecommunication')) {
        description = (
          <span>
            <strong>{educationDescription}</strong>
            : My engineering education empowers me to design and implement effective
            solutions in electrical systems and telecommunications.
          </span>
        );
      } else {
        description = (
          <span>
            <strong>{educationDescription}</strong>
            : My educational background provides a solid foundation for my career.
          </span>
        );
      }

      return (
        <div>
          {description}
        </div>
      );
    },

    contact: () => `Reach me at ${cvData?.email || 'N/A'}.`,
    goodbye: () => 'Thank you for your time! Have a great day!',
  };

  const handleBotResponse = (query) => {
    const responseKey = Object.keys(responseMap).find((key) => nlp(normalizeQuery(query)).has(key));
    const response = responseKey
      ? responseMap[responseKey]()
      : 'Im sorry, I dont have an answer for that.';
    return typeof response === 'string' ? <p>{response}</p> : response;
  };

  const handleSubmit = (query) => {
    if (!query.trim()) return;
    const userMessage = { id: Date.now(), text: query, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);

    const botResponse = handleBotResponse(query);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, text: botResponse, sender: 'bot' },
      ]);
    }, 500);
    setInput('');
  };

  const handleTagClick = (query) => handleSubmit(query);
  const toggleAdminPanel = () => navigate('/login');

  return (
    <div className="chatbot-container">
      {loading ? (
        <div className="loading-spinner">Loading...</div>
      ) : (
        <div className="chatbot-wrapper">
          <div className="sidebar-extended">
            <img src={profileImage} alt="Profile" className="profile-image" />
            <h3>{cvData?.name || 'N/A'}</h3>
            <ul className="info-list">
              <li>
                <strong>Email:</strong>
                <ul className="email-list">
                  <li>{cvData?.email || 'N/A'}</li>
                </ul>
              </li>
              <li>
                <strong>Skills:</strong>
                <ul className="skills-list">
                  {cvData?.skills?.map((skill) => (
                    <li key={skill.name || skill}>{skill.name || skill}</li>
                  )) || <li>N/A</li>}
                </ul>
              </li>
              <li>
                <strong>Experience:</strong>
                <ul className="experience-list">
                  {cvData?.experiences?.length
                    ? cvData.experiences.map((exp) => (
                      <li key={exp.id} className="experience-item">
                        {exp.jobTitle}
                        {' '}
                        at
                        {exp.company}
                      </li>
                    ))
                    : <li>No experience listed.</li>}
                </ul>
              </li>
              <li>
                <strong>Education:</strong>
                <ul className="education-list">
                  <li>{cvData?.education || 'N/A'}</li>
                </ul>
              </li>
            </ul>
          </div>

          <div className="chatbot-main">
            <div className="chat-window" ref={chatWindowRef}>
              {messages.map((msg) => (
                <div key={msg.id} className={`message ${msg.sender}`}>
                  {typeof msg.text === 'string' ? <p>{msg.text}</p> : msg.text}
                </div>
              ))}
            </div>

            <div className="predefined-tags">
              {predefinedTags.map((tag) => (
                <button
                  type="button"
                  key={tag.id}
                  onClick={() => handleTagClick(tag.query)}
                  className="tag-button"
                >
                  <FontAwesomeIcon icon={tag.icon} />
                  {' '}
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
              <button type="submit" className="send-button">
                <FontAwesomeIcon icon={faPaperPlane} />
              </button>
            </form>
          </div>

          <button type="button" onClick={toggleAdminPanel} className="admin-button">
            <FontAwesomeIcon icon={faCog} />
            {' '}
            Admin
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
