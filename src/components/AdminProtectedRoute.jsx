// src/components/AdminProtectedRoute.jsx
import React from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import { Navigate } from 'react-router-dom';
import { auth } from '../firebaseConfig'; // Import your Firebase auth

const AdminProtectedRoute = ({ children }) => {
  const user = auth.currentUser; // Get the current user

  // You can check if the user has admin privileges here
  const isAdmin = user && user.email === 'admin@example.com'; // Replace with your admin email or role check

  return isAdmin ? children : <Navigate to="/" />; // Redirect if not admin
};

// Prop Types
AdminProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired, // Validate that children is required
};

export default AdminProtectedRoute;
