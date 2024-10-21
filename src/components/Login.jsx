import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons'; // Import the cross icon
import { auth } from '../firebaseConfig'; // Ensure this path is correct
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;

      // Get the auth token (ID token)
      const token = await user.getIdToken();

      // Store the token in localStorage
      localStorage.setItem('authToken', token);

      // Redirect to the 'adminpanel' page
      setTimeout(() => navigate('/adminpanel'), 500);
    } catch (error) {
      setError('Invalid email or password');
    }
  };

  // Handle key press for accessibility
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      navigate('/'); // Handle Enter key to navigate
    }
  };

  return (
    <div className="auth-container">
      {/* Cross icon in the top-right corner to go back */}
      <button
        type="button" // Specify type here
        className="close-icon"
        onClick={() => navigate('/')}
        onKeyPress={handleKeyPress}
        aria-label="Close"
        tabIndex={0} // Make it focusable
      >
        <FontAwesomeIcon icon={faTimes} size="2x" />
      </button>

      <h1>Login</h1>
      {error && <p className="error-message">{error}</p>}
      <form className="auth-form" onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      <p>
        Don&apos;t have an account?
        <a href="/signup"> Sign Up</a>
      </p>
    </div>
  );
};

export default Login;
