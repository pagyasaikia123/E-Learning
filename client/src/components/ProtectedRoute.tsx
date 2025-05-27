import React from 'react';
import { Route, Redirect, RouteProps } from 'wouter';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps extends RouteProps {
  // component is already part of RouteProps from wouter if using that way
  // If not, define it: component: React.ComponentType<any>;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = (props) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <p>Loading session...</p>; // Or a more sophisticated loading spinner
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  // If user is authenticated, render the route as normally
  // Pass all props (path, component, etc.) to the original Route component
  return <Route {...props} />;
};

export default ProtectedRoute;
