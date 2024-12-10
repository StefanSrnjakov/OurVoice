import React from 'react';
import { Box, Heading, Text, Flex, Image, keyframes } from '@chakra-ui/react';
import { FaFire } from 'react-icons/fa';
import { Post } from '../interfaces/Post';
import { Link } from 'react-router-dom';

interface HotPostsRibbonProps {
  hotPosts: Post[];
}

const HotPostsRibbon: React.FC<HotPostsRibbonProps> = ({ hotPosts }) => {
  if (hotPosts.length === 0) return null; // Do not render if there are no hot posts

  const scrollAnimation = keyframes`
    0% { transform: translateX(0); }
    100% { transform: translateX(-100%); }
  `;

  return (
    <Box
      bg="red.500"
      p={4}
      borderRadius="md"
      mb={6}
      position="relative"
      overflow="hidden"
    >
      <Box
        whiteSpace="nowrap"
        display="inline-block"
        animation={`${scrollAnimation} 10s linear infinite`}
        position="absolute"
        top="5px"
        left="0"
        transform="translateY(-50%)"
        width="100%"
      >
        {Array.from({ length: 10 }).map((_, index) => (
          <Flex
            as="span"
            align="center"
            key={index}
            mr={8}
            display="inline-flex"
          >
            <FaFire size={24} color="white" />
            <Heading as="h3" size="lg" ml={2} color="white">
              Priljubljene objave
            </Heading>
            <FaFire size={24} color="white" />
          </Flex>
        ))}
      </Box>

      <Flex justify="space-around" wrap="wrap" gap={4} mt={8}>
        {hotPosts.map((post) => (
          <Box
            key={post._id}
            p={3}
            bg="white"
            color="black"
            borderRadius="md"
            shadow="md"
            mx={2}
            minW="250px"
          >
            <Heading size="sm" mb={2}>
              {post.title}
            </Heading>
            {post.image && (
              <Image
                src={post.image}
                alt={post.title}
                borderRadius="md"
                mb={2}
                width="100%"
                height="100px"
                objectFit="cover"
              />
            )}
            <Text fontSize="sm" color="gray.700" noOfLines={2}>
              {post.category}
            </Text>
            <Text fontSize="xs" mt={1} color="gray.500">
              Avtor: {post?.userId?.username || 'Neznan uporabnik'}
            </Text>
            <Link to={`/posts/${post._id}`}>
              <Text color="blue.500" mt={2} fontSize="sm">
                Preberi več
              </Text>
            </Link>
          </Box>
        ))}
      </Flex>
    </Box>
  );
};

export default HotPostsRibbon;
