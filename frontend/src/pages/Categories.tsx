import React from 'react';
import { Box, Heading, Stack, Text, SimpleGrid } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const Categories: React.FC = () => {
  // Expanded categories translated to Slovene
  const categories = [
    'Tehnologija',
    'Zdravje',
    'Izobraževanje',
    'Zabava',
    'Šport',
    'Poslovanje',
    'Potovanja',
    'življenjski slog',
    'Znanost',
    'Hrana',
    'Umetnost',
    'Moda',
    'Avtomobilizem',
    'Narava',
    'Kultura',
    'Glasba',
    'Filmi',
    'Politika',
    'Prosti čas',
    'Drugo',
  ];

  const navigate = useNavigate();

  const handleCategoryClick = (category: string) => {
    navigate(`/posts?category=${encodeURIComponent(category)}`);
  };

  return (
    <Box p={6} bg="gray.50">
      <Stack spacing={8} align="center" maxW="container.xl" mx="auto">
        <Box textAlign="center">
          <Heading as="h1" size="xl" mb={4}>
            Kategorije
          </Heading>
          <Text fontSize="lg" color="gray.700">
            Izberite kategorijo, ki vas zanima, in odkrijte objave ter teme,
            povezane z njo!
          </Text>
        </Box>

        {/*Grid kategorij*/}
        <SimpleGrid
          columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
          spacing={6}
          w="100%"
        >
          {categories.map((category, index) => (
            <Box
              key={index}
              bg="white"
              p={6}
              borderRadius="lg"
              boxShadow="md"
              textAlign="center"
              transition="transform 0.2s"
              cursor="pointer"
              _hover={{ transform: 'scale(1.05)', boxShadow: 'lg' }}
              onClick={() => handleCategoryClick(category)}
            >
              <Heading as="h3" size="md" mb={2} color="blue.600">
                {category}
              </Heading>
            </Box>
          ))}
        </SimpleGrid>
      </Stack>
    </Box>
  );
};

export default Categories;
