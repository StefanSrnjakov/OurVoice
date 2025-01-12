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
  Select,
  Image,
  Flex,
} from '@chakra-ui/react';
import { UserContext } from '../userContext';
import AddPostModal from '../components/AddPostModal';
import { Post } from '../interfaces/Post';
import { Link } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { FaThumbsUp, FaThumbsDown, FaEye, FaFlag } from 'react-icons/fa';
import HotPostsRibbon from '../components/HotPostsRibbon';
import { API_URL } from '../config';

const Posts: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [hotPosts, setHotPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null); // Track selected post for editing
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user } = useContext(UserContext);
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || ''; // Read 'category' from URL
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);

  const categories = ['Tehnologija', "Zdravje", "Izobraževanje", "Zabava", "Šport", "Poslovanje", "Potovanja",
    "Življenjski slog", "Znanost", "Hrana", "Umetnost", "Moda", "Avtomobilizem", "Narava", "Kultura", "Glasba",
    "Filmi", "Politika", "Prosti čas","Drugo"
  ];

  const filteredPosts = selectedCategory
      ? posts.filter((post) => {
        const postCategory = post.category;
        const filterCategory = selectedCategory;

        console.log(
            `Post category (cleaned): "${postCategory}", Filter category: "${filterCategory}"`
        );

        return postCategory === filterCategory;
      })
      : posts;



  //console.log('Posts Categories:', posts.map((post) => `"${post.category}"`));




  const loadPosts = () => {
    setLoading(true);
    fetch(`${API_URL}/post?hot=true`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setHotPosts(data);
      })
      .catch((error) => {
        console.error('Napaka pri pridobivanju objav:', error);
      });

    fetch(`${API_URL}/post`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setPosts(data);
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
      const response = await fetch(`${API_URL}/post/${postId}/${actionParam}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user?._id }),
      });

      if (!response.ok) {
        throw new Error('Failed to update like/dislike');
      }

      const updatedPostResponse = await response.json();

      const updatedPost: Post = updatedPostResponse.post;
      // Update the specific post in the state
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post._id === updatedPost._id) {
            return {
              ...post,
              likes: updatedPost.likes,
              dislikes: updatedPost.dislikes,
            };
          }
          return post;
        })
      );
      
    } catch (error) {
      console.error('Napaka pri posodobitvi lajkov/dislajkov:', error);
    }
  };

  useEffect(() => {
    loadPosts();
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  const handlePostAdded = () => {
    loadPosts();
    setSelectedPost(null); // Reset selected post after adding
  };

  const handleEditPost = (post: Post) => {
    setSelectedPost(post); // Set the selected post for editing
    onOpen(); // Open the modal
  };

  const handleDeletePost = (id: string) => {
    fetch(`${API_URL}/post/${id}`, {
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

  const handleReport = async (postId: string) => {
    try {
      const response = await fetch(`${API_URL}/post/report/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user?._id }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to report post');
      }
  
      const data = await response.json();
      if (data.message === 'You have already reported this post') {
        alert('Već ste prijavili ovu objavu.');
      } else if (data.message === 'Post deleted due to excessive reports') {
        alert('Ova objava je obrisana zbog prekomernog broja prijava.');
      } else {
        alert('Prijava uspešno poslata. Hvala vam!');
      }
    } catch (error) {
      console.error('Napaka pri prijavi objave:', error);
      alert('Došlo je do greške prilikom slanja prijave.');
    }
  };

  return (
    <Box p={6} maxW="container.lg" mx="auto">
      <Heading as="h2" size="xl" mb={6} textAlign="center">
        Forum - Objave
      </Heading>

      {/* Align gumb in filter */}
      <Box mb={6}>
        <Flex
            direction={{ base: 'column', md: 'row' }}
            align="center"
            justify="space-between"
        >
          {/* Nov Post */}
          {user && !user.isBanned && (
              <Button onClick={onOpen} colorScheme="blue" mb={{ base: 4, md: 0 }}>
                Dodaj novo objavo
              </Button>
          )}

          {/* Dropdown za filter */}
          <Box maxW="300px" width="100%" textAlign={{ base: 'center', md: 'right' }}>
            <Select
                placeholder="Izberite kategorijo"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
              ))}
            </Select>
          </Box>
        </Flex>
      </Box>



      {loading ? (
        <Box textAlign="center" mt={8}>
          <Spinner size="xl" />
        </Box>
      ) : posts.length === 0 ? (
        <Text fontSize="lg" color="gray.500" textAlign="center" mt={8}>
          Trenutno ni nobenih objav.
        </Text>
      ) : filteredPosts.length === 0 ? (
          // Case: Posts exist but none match the selected category
          <Text fontSize="lg" color="gray.500" textAlign="center" mt={8}>
            Ni objav za izbrano kategorijo.
          </Text>
      ) : (
        <Stack spacing={6}>
          <HotPostsRibbon hotPosts={hotPosts} />
          {filteredPosts.map((post) => (
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
                Avtor:{' '}
                <Link to={`/user/${post.userId?._id}`}>
                  {post?.userId?.username || 'Neznan uporabnik'}
                </Link>
              </Text>
              <Text mt={2} fontSize="sm" color="gray.500">
                <Flex align="center">
                  <FaEye color="gray.500" style={{ marginRight: '4px' }} />{' '}
                  <strong>{post.views}</strong>
                </Flex>
              </Text>
              {post.image && (
                <Box mt={4}>
                  <Image
                    src={post.image} // Prikazivanje slike (Base64 string ili URL)
                    alt={post.title}
                    borderRadius="md"
                    mb={2}
                    width="100%"
                    height="auto"
                    maxHeight="250px"
                    objectFit="cover"
                  />
                </Box>
              )}
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
                <IconButton
                  icon={<FaFlag />}
                  aria-label="Report"
                  onClick={() => handleReport(post._id)}
                  colorScheme="yellow"
                  ml={4}
                />
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
                    onClick={() => handleEditPost(post)} // Edit post
                  >
                    Uredi
                  </Button>
                  <Button
                    colorScheme="red"
                    onClick={() => handleDeletePost(post._id)} // Delete post
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
          setSelectedPost(null); // Reset selected post when modal closes
        }}
        onPostAdded={handlePostAdded}
        post={selectedPost} // Pass selected post to the modal
      />
    </Box>
  );
};

export default Posts;
