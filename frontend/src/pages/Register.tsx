import React, { useState, FormEvent, useContext } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
  Heading,
  useToast,
  Checkbox,
} from '@chakra-ui/react';
import { UserContext, UserContextType } from '../userContext';
import { useNavigate } from 'react-router-dom';

// TODO - Add validation for input fields
// TODO - Display differend errors (from backend) for failed registration

const Register: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false); // Stan za prikaz gesla

  const userContext = useContext<UserContextType>(UserContext);
  const toast = useToast();
  const navigate = useNavigate();

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:3000/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email }),
      });

      if (!res.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await res.json();

      if (data && data._id) {
        userContext.setUserContext(data); // Setting user context with the new user data

        toast({
          title: 'Registracija uspešna!',
          description: `Dobrodošli, ${username}!`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        /*
        setTimeout(() => {
          navigate('/');
        }, 2000);
        */
      } else {
        setError('Napaka pri registraciji. Preverite vnos in poskusite znova.');
      }
    } catch (error) {
      console.error(error);
      setError('Registracija ni uspela. Prosimo, poskusite znova.');
    }
  };

  return (
    <Box
      maxW="lg"
      mx="auto"
      mt={12}
      p={8}
      borderWidth={1}
      borderRadius="lg"
      boxShadow="2xl"
      bg="white"
    >
      <Stack align="center" mb={6}>
        <Heading as="h2" size="lg" color="blue.600">
          Registracija YourVoice
        </Heading>
        <Text fontSize="md" color="gray.600">
          Pridružite se naši skupnosti!
        </Text>
      </Stack>

      <form onSubmit={handleRegister}>
        <Stack spacing={5}>
          <FormControl id="email" isRequired>
            <FormLabel fontSize="lg">Email:</FormLabel>
            <Input
              type="text"
              placeholder="Vnesite svoj email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              size="lg"
            />
          </FormControl>

          <FormControl id="username" isRequired>
            <FormLabel fontSize="lg">Uporabniško ime</FormLabel>
            <Input
              type="text"
              placeholder="Vnesite uporabniško ime"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              size="lg"
            />
          </FormControl>

          <FormControl id="password" isRequired>
            <FormLabel fontSize="lg">Geslo</FormLabel>
            <Input
              type={showPassword ? 'text' : 'password'} // Uporabi 'text' ali 'password' glede na stanje
              placeholder="Vnesite geslo"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              size="lg"
            />
            <Checkbox
              mt={2}
              isChecked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
              required={false}
            >
              Prikaži geslo
            </Checkbox>
          </FormControl>

          {error && (
            <Text color="red.500" fontSize="sm" textAlign="center">
              {error}
            </Text>
          )}

          <Button
            colorScheme="blue"
            type="submit"
            mt={4}
            size="lg"
            width="full"
          >
            Registracija
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default Register;
