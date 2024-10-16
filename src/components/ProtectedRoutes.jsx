import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/'); // Redirect to login page if not authenticated
      }
    });

    // Cleanup the subscription on unmount
    return () => unsubscribe();
  }, [navigate]);

  return children; // Render child components if authenticated
};

export default ProtectedRoute;
