import React, { useContext, useEffect, useState } from 'react';
import { Box, Heading, Text, List, ListItem, Spinner } from '@chakra-ui/react';
import { UserContext } from '../userContext';
import { API_URL } from '../config';

const Banned: React.FC = () => {
  const { user, setUserContext } = useContext(UserContext); // Access user and setUserContext from context
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user || !user._id) {
      setLoading(false);
      return;
    }

    // Fetch banned user data using the user ID from context
    fetch(`${API_URL}/user/${user._id}`)
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          setUserContext(data); // Update the user context with the fetched data
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
        setLoading(false);
      });
  }, [user, setUserContext]);

  if (loading) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="100vh"
        textAlign="center"
        bg="gray.100"
      >
        <Spinner size="xl" />
      </Box>
    );
  }

  if (!user || !user.isBanned) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="100vh"
        textAlign="center"
        bg="gray.100"
      >
        <Text color="red.500" fontSize="lg">
          Error: User not found or not banned.
        </Text>
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      textAlign="center"
      bg="gray.100"
      p={4}
    >
      <Heading as="h1" size="2xl" mb={4} color="red.600">
        You are Banned
      </Heading>
      <Text fontSize="lg" mb={6}>
        Below are the reasons why your account was banned:
      </Text>

      {user.userReports.length > 0 ? (
        <Box
          bg="white"
          borderWidth="1px"
          borderRadius="md"
          boxShadow="sm"
          p={6}
          width={{ base: '90%', md: '60%' }}
        >
          <Heading as="h2" size="md" mb={4} color="gray.800">
            Reasons for Ban
          </Heading>
          <List spacing={3}>
            {user.userReports.map((report, index) => (
              <ListItem key={index}>
                <Text fontSize="md" color="gray.700">
                  {index + 1}. {report.reportReason}
                </Text>
              </ListItem>
            ))}
          </List>
        </Box>
      ) : (
        <Text fontSize="md" color="gray.500">
          No reasons were provided for the ban.
        </Text>
      )}
    </Box>
  );
};

export default Banned;
