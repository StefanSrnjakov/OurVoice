import { useEffect, useContext } from 'react';
import { UserContext, UserContextType } from '../userContext'; // Ensure UserContextType is defined
import { Navigate } from 'react-router-dom';

const Logout: React.FC = () => {
  const userContext = useContext<UserContextType>(UserContext); // Ensure UserContext is properly typed

  useEffect(() => {
    const logout = async () => {
      try {
        // Update the user context to null
        userContext.setUserContext(null);

        // Make the logout request
        const res = await fetch('http://localhost:3001/users/logout', {
          method: 'POST', // or GET, based on your backend implementation
          credentials: 'include',
        });

        // Check if the response is okay
        if (!res.ok) {
          throw new Error('Logout failed');
        }
      } catch (error) {
        console.error('Logout error:', error);
        // You might want to show an error message to the user here
      }
    };

    logout();
  }, [userContext]); // `userContext` is not expected to change, but you can keep it for safety

  return <Navigate replace to="/" />;
};

export default Logout;
