import React from 'react';
import { Navigate } from 'react-router-dom';
import { User } from '../interfaces/User'; // Adjust the path as needed

interface ProtectedRouteProps {
  user: User | null;
  element: React.ReactElement; // The route component to render
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ user, element }) => {
  // If the user is not authenticated, redirect to the login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If the user is authenticated, render the requested element
  return element;
};

export default ProtectedRoute;
