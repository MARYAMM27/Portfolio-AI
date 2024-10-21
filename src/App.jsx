import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import ChatBot from './components/ChatBot';
import AdminPanel from './components/AdminPanel';
import ProtectedRoute from './components/ProtectedRoutes';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProtectedRoute><ChatBot /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* Added wildcard (*) for nested routes in AdminPanel */}
        <Route path="/adminpanel/*" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
