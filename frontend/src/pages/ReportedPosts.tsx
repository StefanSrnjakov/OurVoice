import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Text,
  Tooltip,
  Flex,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';

const ReportedPosts: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch(`${API_URL}/post/reported`)
      .then((response) => response.json())
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching reported posts:', error);
        setLoading(false);
      });
  }, []);

  const deletePost = async (postId: string) => {
    try {
      const response = await fetch(`${API_URL}/post/${postId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete post');
      }
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  if (loading) {
    return <Spinner size="xl" />;
  }

  return (
    <Box
      p={6}
      maxW="container.xlg"
      mx="auto"
      borderWidth="1px"
      borderRadius="lg"
      shadow="lg"
    >
      <Heading as="h2" size="xl" mb={6} textAlign="center" color="teal.600">
        Prijavljene objave
      </Heading>

      {posts.length > 0 ? (
        <Box overflowX="auto" p={6}>
          <Table variant="striped" colorScheme="teal">
            <Thead>
              <Tr>
                <Th>Naslov</Th>
                <Th>Kategorija</Th>
                <Th>Uporabnik</Th>
                <Th>Število prijav</Th>
                <Th>Akcije</Th>
              </Tr>
            </Thead>
            <Tbody>
              {posts.map((post) => (
                <Tr key={post._id}>
                  <Td>{post.title}</Td>
                  <Td>{post.category}</Td>
                  <Td>{post.userId?.username || 'Neznan'}</Td>
                  <Td>
                    <Tooltip
                      label={post.reports.join(', ')}
                      fontSize="md"
                      hasArrow
                      placement="top"
                    >
                      <Text>{post.reports.length}</Text>
                    </Tooltip>
                  </Td>
                  <Td>
                    <Flex direction="column" align="start" gap={2}>
                      <Link to={`/posts/${post._id}`}>
                        <Button colorScheme="teal" size="sm">
                          Pogledaj Objavo
                        </Button>
                      </Link>
                      <Button
                        colorScheme="red"
                        size="sm"
                        onClick={() => deletePost(post._id)}
                      >
                        Izbriši Objavo
                      </Button>
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      ) : (
        <Text color="gray.500" textAlign="center">
          Trenutno ni prijavljenih objav.
        </Text>
      )}
    </Box>
  );
};

export default ReportedPosts;
