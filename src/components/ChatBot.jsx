import React, { useState, useEffect, useRef } from 'react';
import nlp from 'compromise';
import { FontAwesomeIcon }
  from '@fortawesome/react-fontawesome';
import {
  faCode,
  faBriefcase,
  faGraduationCap,
  faProjectDiagram,
} from '@fortawesome/free-solid-svg-icons';

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import '../styles/ChatBot.css';
import AdminPanel from './AdminPanel';

const ChatBot = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [cvData, setCvData] = useState(null);
  const [isAdminPanelVisible, setIsAdminPanelVisible] = useState(false);
  const chatWindowRef = useRef(null);

  // Predefined tags with icons
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

  const infoBubbles = [
    { id: 'a', text: "I'm here to help you with my portfolio." },
    { id: 'b', text: 'You can ask me about my skills, experience, or projects.' },
    { id: 'c', text: 'Feel free to click on predefined tags for quick questions.' },
    { id: 'd', text: "I'm a virtual assistant designed to make information accessible!" },
  ];

  const fetchCvData = async () => {
    try {
      const docRef = doc(db, 'cvData', 'cvData');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setCvData(docSnap.data());
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), text: 'Error fetching data. Please try again later.', sender: 'bot' },
      ]);
    }
  };

  useEffect(() => {
  //   setMessages([
  //     {
  //       id: Date.now(),
  //       text: 'Hello! I am your Portfolio Assistant. Feel
  // free to ask me about skills, experience, or projects.',
  //       sender: 'bot',
  //     },
  //   ]);
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
    hi: 'Hello! I am here to assist you with information about my portfolio. How can I help you today?',
    name: () => `My name is ${cvData?.name || 'N/A'}. It's a pleasure to meet you.`,
    profession: () => `I am a dedicated professional in the field of ${cvData?.profession || 'N/A'}.`,
    skills: () => `I possess a range of skills, including: ${cvData?.skills || 'N/A'}.`,
    experience: () => (cvData?.experience ? `I have professional experience as a ${cvData.experience}.` : 'I currently do not have any documented professional experience.'),
    projects: () => (cvData?.projects ? `I have successfully completed several projects, including: ${cvData.projects}.` : 'I do not have any projects listed at this moment.'),
    education: () => (cvData?.education ? `I hold a degree in ${cvData.education}.` : 'I currently do not have any educational qualifications listed.'),
    contact: () => `You can reach me via email at ${cvData?.contact?.email || 'N/A'} or by phone at ${cvData?.contact?.phone || 'N/A'}.`,
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
    if (query.trim()) {
      const userMessage = { id: Date.now(), text: query, sender: 'user' };
      setMessages((prev) => [...prev, userMessage]);
      const botResponse = handleBotResponse(query);
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
      <div className="info-bubbles">
        {infoBubbles.map((bubble) => (
          <div key={bubble.id} className="info-bubble">
            {bubble.text}
          </div>
        ))}
      </div>

      <div className="chatbot-full-page">
        {isAdminPanelVisible && cvData ? (
          <AdminPanel cvData={cvData} setCvData={setCvData} />
        ) : (
          <>
            <div className="chat-window" ref={chatWindowRef}>
              {messages.map((msg) => (
                <div key={msg.id} className={`message ${msg.sender}`}>
                  {msg.text}
                </div>
              ))}
            </div>

            <div className="predefined-tags">
              {predefinedTags.map((tag) => (
                <button key={tag.id} onClick={() => handleTagClick(tag.query)} className="tag-button glow-circle" type="button">
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
              <button type="submit" className="send-button">Send</button>
            </form>
          </>
        )}

        <button onClick={toggleAdminPanel} type="button" className="admin-toggle-button">
          {isAdminPanelVisible ? 'Back to Chat' : 'Admin Panel'}
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
