import { Box, Button, Heading, Image, Stack, Text } from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDoorOpen } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <Box p={6} bg="gray.50">
      <Stack
        direction={{ base: 'column', md: 'row' }}
        spacing={8}
        align="center"
        justify="space-between"
        maxW="container.xl"
        mx="auto"
      >
        {/* Left Column */}
        <Box flex={1} textAlign={{ base: 'center', md: 'left' }} px={4}>
          <Heading as="h1" size="xl" mb={4}>
            Forum YourVoice
          </Heading>
          <Text fontSize="lg" color="gray.700" mb={6}>
            YourVoice je interaktivni forum, zasnovan za izmenjavo informacij in
            povezovanje uporabnikov. Aplikacija omogoča prijavljenim
            uporabnikom, da objavljajo svoje vsebine, komentirajo, ocenjujejo
            objave drugih ter urejajo svoj profil. Prijavljeni uporabniki lahko
            tudi aktivno sodelujejo pri predlogih in ocenjevanju izboljšav
            spletnega foruma. Neprijavljeni uporabniki lahko brskajo po objavah,
            vendar brez možnosti interakcije. Napredne funkcionalnosti
            vključujejo filtriranje in sortiranje objav, napredno iskanje ter
            ostale možnosti. Aplikacija vključuje tudi posebne funkcionalnosti
            ter pravice za moderatorje in administratorje. Za razvoj je
            uporabljen MERN sklad.
          </Text>

          <Box textAlign="center" mt={8}>
            <Heading as="h3" size="md" mb={4}>
              Vstop v forum
            </Heading>
            <Button
              as={RouterLink}
              to="/posts"
              size="lg"
              colorScheme="blue"
              rounded="full"
              px={6}
              rightIcon={<FontAwesomeIcon icon={faDoorOpen} />}
              _hover={{
                bg: 'blue.300',
              }}
            >
              Vstopi
            </Button>
          </Box>
        </Box>

        {/* Right Column */}
        <Box flex={1} display="flex" justifyContent="center">
          <Image
            src="images/default.png"
            alt="YourVoice logo"
            boxSize="100%"
            maxW="500px"
            borderRadius="lg"
          />
        </Box>
      </Stack>
    </Box>
  );
};

export default Home;
