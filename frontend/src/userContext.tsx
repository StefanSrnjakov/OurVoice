import { createContext, Dispatch, SetStateAction } from 'react';
import { User } from './interfaces/User'; // Ensure this path is correct

export interface UserContextType {
  user: User | null; // User can be null or an object
  setUserContext: Dispatch<SetStateAction<User | null>>; // This should allow both User and function types
}

export const UserContext = createContext<UserContextType>({
  user: null,
  setUserContext: () => {}, // Initialize with a no-op function
});
