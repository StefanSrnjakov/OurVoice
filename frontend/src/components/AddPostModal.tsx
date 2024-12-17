// AddPostModal.tsx
import React, { useState, useRef, useContext, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useToast, Select,
} from '@chakra-ui/react';
import { UserContext } from '../userContext';
import { Post } from '../interfaces/Post';

interface AddPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostAdded: () => void;
  post: Post | null;
}

const AddPostModal: React.FC<AddPostModalProps> = ({
  isOpen,
  onClose,
  onPostAdded,
  post,
}) => {
  const { user } = useContext(UserContext); // Get the currently logged-in user
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState<string | null>(null); 
  const toast = useToast();
  const titleInputRef = useRef<HTMLInputElement>(null);

  const categories = ["Tehnologija", "Zdravje", "Izobraževanje", "Zabava", "Šport", "Poslovanje", "Potovanja",
    "Življenjski slog", "Znanost", "Hrana", "Umetnost", "Moda", "Avtomobilizem", "Narava", "Kultura", "Glasba",
    "Filmi", "Politika", "Prosti čas","Drugo"
  ];

  // Populate fields when post is provided (for editing)
  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
      setCategory(post.category);
      setImage(post.image ?? null);
    } else {
      setTitle('');
      setContent('');
      setCategory('Drugo');
      setImage(null);
    }
  }, [post]);

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file); // Convert file to Base64
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      convertFileToBase64(file)
        .then((base64) => setImage(base64))
        .catch(() => {
          toast({
            title: 'Greška pri učitavanju slike.',
            status: 'error',
          });
        });
    } else {
      setImage(null);
    }
  };

  const handleSubmit = () => {
    if (!user) {
      toast({ title: 'Napaka: Uporabnik ni prijavljen.', status: 'error' });
      return;
    }

    const url = post
      ? `http://localhost:3000/post/${post._id}`
      : 'http://localhost:3000/post';
    const method = post ? 'PUT' : 'POST';

    const payload = {
      title,
      content,
      category,
      image, 
      userId: user._id,
    };  
    console.log('Payload:', payload);

    fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        content,
        category,
        image,
        userId: user._id, // Include userId
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(() => {
        toast({
          title: post
            ? 'Objava uspešno posodobljena!'
            : 'Objava uspešno dodana!',
          status: 'success',
        });
        setTitle('');
        setContent('');
        setCategory('');
        onPostAdded();
        onClose();
      })
      .catch((error) => {
        console.error('Error adding/updating post:', error);
        toast({
          title: 'Napaka pri dodajanju/posodabljanju objave.',
          status: 'error',
        });
      });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      initialFocusRef={titleInputRef} // Set focus on the first input field
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{post ? 'Uredi objavo' : 'Dodaj novo objavo'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl mb={4}>
            <FormLabel>Naslov</FormLabel>
            <Input
              ref={titleInputRef} // Ref for focus
              placeholder="Vnesite naslov"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Kategorija</FormLabel>
            <Select
                placeholder="Izberite kategorijo"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
              ))}
            </Select>
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Slika</FormLabel>
            <Input
              type="file"
              onChange={handleImageChange}
            />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Vsebina</FormLabel>
            <Textarea
              placeholder="Vnesite vsebino"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={handleSubmit} mr={3}>
            {post ? 'Shrani' : 'Dodaj'}
          </Button>
          <Button onClick={onClose}>Prekliči</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddPostModal;
