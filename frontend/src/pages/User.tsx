import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Spinner,
  Button,
  Divider,
  VStack,
  Image,
} from '@chakra-ui/react';
import { Post } from '../interfaces/Post';
import { User } from '../interfaces/User';
import { Link } from 'react-router-dom';

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!userId) return;

    setLoading(true);

    fetch(`http://localhost:3000/user/${userId}`)
      .then((response) => response.json())
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching user profile:', error);
        setLoading(false);
      });

    fetch(`http://localhost:3000/post?userId=${userId}`)
      .then((response) => response.json())
      .then((data) => {
        setPosts(data.reverse());
      })
      .catch((error) => {
        console.error('Error fetching user posts:', error);
      });
  }, [userId]);

  if (loading) {
    return <Spinner size="xl" />;
  }

  const totalLikes = posts.reduce((sum, post) => sum + post.likes.length, 0);
  const totalDislikes = posts.reduce(
    (sum, post) => sum + post.dislikes.length,
    0
  );
  const totalViews = posts.reduce((sum, post) => sum + post.views, 0);

  return (
    <Box
      p={8}
      maxW="container.md"
      mx="auto"
      borderWidth="1px"
      borderRadius="lg"
      shadow="lg"
    >
      {profile ? (
        <>
          {/* User Profile Information */}
          <Heading as="h2" size="xl" mb={4} textAlign="center" color="teal.600">
            Profil uporabnika {profile.username}
          </Heading>
          <Divider mb={4} />
          <Text fontSize="lg" mb={2}>
            <strong>Email:</strong> {profile.email}
          </Text>
          <Text fontSize="lg" mb={2}>
            <strong>Ime:</strong> {profile.username}
          </Text>
          <Text fontSize="sm" color="gray.500" mb={4}>
            <strong>Ustvarjeno:</strong>{' '}
            {new Date(profile.createdAt).toLocaleDateString()}
          </Text>
          <Box mb={4}>
            <Text fontSize="lg" mb={2}>
              <strong>Skupaj ogledov:</strong> {totalViews}
            </Text>
            <Text fontSize="lg" mb={2}>
              <strong>Skupaj likes:</strong> {totalLikes}
            </Text>
            <Text fontSize="lg">
              <strong>Skupaj dislikes:</strong> {totalDislikes}
            </Text>
          </Box>

          <Divider mb={4} />

          <Heading as="h3" size="md" mb={4}>
            Objave uporabnika
          </Heading>

          {posts.length > 0 ? (
            <VStack spacing={4} align="start">
              {posts.map((post) => (
                <Box
                  key={post._id}
                  p={4}
                  borderWidth="1px"
                  borderRadius="md"
                  w="full"
                  bg="gray.50"
                >
                  <Heading as="h4" size="sm" mb={2}>
                    {post.title}
                  </Heading>
                  <Text fontSize="sm" color="gray.500" mb={2}>
                    <strong>Kategorija:</strong> {post.category}
                  </Text>
                  <Text mt={2}>{post.content}</Text>
                  {post.image && (
                    <Image
                      src={post.image}
                      alt={post.title}
                      width="100%"
                      maxHeight="250px"
                      objectFit="cover"
                      my={4}
                    />
                  )}
                  <Text fontSize="sm" color="gray.600" mt={2} mb={4}>
                    <strong>Likes:</strong> {post.likes.length} likes |{' '}
                    <strong>Dislikes:</strong> {post.dislikes.length} dislikes
                  </Text>
                  <Link to={`/posts/${post._id}`}>
                    <Button colorScheme="teal" onClick={() => {}} w="full">
                      Ogled objave
                    </Button>
                  </Link>
                </Box>
              ))}
            </VStack>
          ) : (
            <Text color="gray.500">Ni objav za tega uporabnika.</Text>
          )}
        </>
      ) : (
        <Text color="red.500">Uporabnik ni najden.</Text>
      )}
    </Box>
  );
};

export default UserProfile;
