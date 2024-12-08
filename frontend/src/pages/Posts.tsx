import React, { useEffect, useState, useContext } from 'react';
import {
  Box,
  Heading,
  Button,
  Stack,
  Text,
  Spinner,
  useDisclosure,
  IconButton,
} from '@chakra-ui/react';
import { UserContext } from '../userContext';
import AddPostModal from '../components/AddPostModal';
import { Post } from '../interfaces/Post';
import { Link } from 'react-router-dom';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';

const Posts: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user } = useContext(UserContext);

  const loadPosts = () => {
    setLoading(true);
    fetch('http://localhost:3000/post')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setPosts(data.reverse());
        setLoading(false);
      })
      .catch((error) => {
        console.error('Napaka pri pridobivanju objav:', error);
        setLoading(false);
      });
  };

  const handleLikeDislike = async (postId: string, action: 'like' | 'dislike') => {
    const actionParam = action === 'like' ? 'toggle-like' : 'toggle-dislike';
  
    try {
      const response = await fetch(`http://localhost:3000/post/${postId}/${actionParam}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user?._id }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update like/dislike');
      }
  
      const updatedPost = await response.json();
  
      // Update the specific post in the state
      setPosts((prevPosts) =>
        prevPosts.map((post) => (post._id === updatedPost.post._id ? updatedPost.post : post))
      );
    } catch (error) {
      console.error('Napaka pri posodobitvi lajkov/dislajkov:', error);
    }
  };
  
  

  useEffect(() => {
    loadPosts();
  }, []);

  const handlePostAdded = () => {
    loadPosts();
    setSelectedPost(null); // Reset selected post after adding
  };

  const handleEditPost = (post: Post) => {
    setSelectedPost(post); // Set the selected post for editing
    onOpen(); // Open the modal
  };

  const handleDeletePost = (id: string) => {
    fetch(`http://localhost:3000/post/${id}`, {
      method: 'DELETE',
    })
      .then((response) => {
        if (response.ok) {
          loadPosts(); // Reload posts after deletion
        } else {
          console.error('Napaka pri brisanju objave');
        }
      })
      .catch((error) => {
        console.error('Napaka pri brisanju objave:', error);
      });
  };

  return (
    <Box p={6} maxW="container.lg" mx="auto">
        <Heading as="h2" size="xl" mb={6} textAlign="center">
          Forum - Objave
        </Heading>
      {user && (
        <Button onClick={onOpen} colorScheme="blue" mb={6}>
          Dodaj novo objavo
        </Button>
      )}
      {loading ? (
        <Spinner size="xl" />
      ) : posts.length === 0 ? (
        <Text fontSize="lg" color="gray.500" textAlign="center" mt={8}>
          Trenutno ni nobenih objav.
        </Text>
      ) : (
        <Stack spacing={6}>
          {posts.map((post) => (
            <Box
              key={post._id}
              p={5}
              shadow="md"
              borderWidth="1px"
              borderRadius="lg"
              _hover={{ bg: 'gray.50' }}
            >
              <Heading fontSize="xl">{post.title}</Heading>
              <Text mt={2} fontSize="md" color="gray.600">
                Kategorija: {post.category}
              </Text>
              <Text mt={2} fontSize="sm" color="gray.500">
                Avtor: {post?.userId?.username || 'Neznan uporabnik'}
              </Text>
              <Box mt={4} display="flex" alignItems="center">
                <IconButton
                  icon={<FaThumbsUp />}
                  aria-label="Like"
                  onClick={() => handleLikeDislike(post._id, 'like')}
                  colorScheme={user && post.likes.includes(user?._id) ? 'blue' : 'gray'}
                  mr={2}
                />
                <Text>{post.likes.length}</Text>
                <IconButton
                  icon={<FaThumbsDown />}
                  aria-label="Dislike"
                  onClick={() => handleLikeDislike(post._id, 'dislike')}
                  colorScheme={user && post.dislikes.includes(user?._id) ? 'red' : 'gray'}
                  ml={4}
                  mr={2}
                />
                <Text>{post.dislikes.length}</Text>
              </Box>
              <Link to={`/posts/${post._id}`}>
                <Button colorScheme="teal" mt={4}>
                  Preberi več
                </Button>
              </Link>
              {user && post.userId && post.userId._id === user._id && (
                <Box mt={4}>
                  <Button
                    colorScheme="green"
                    mr={3}
                    onClick={() => handleEditPost(post)}
                  >
                    Uredi
                  </Button>
                  <Button
                    colorScheme="red"
                    onClick={() => handleDeletePost(post._id)}
                  >
                    Izbriši
                  </Button>
                </Box>
              )}
            </Box>
          ))}
        </Stack>
      )}
      <AddPostModal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setSelectedPost(null);
        }}
        onPostAdded={handlePostAdded}
        post={selectedPost}
      />
    </Box>
  );
};

export default Posts;