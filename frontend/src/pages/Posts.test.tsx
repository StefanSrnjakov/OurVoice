import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Posts from './Posts';
import { UserContext } from '../userContext';
import '@testing-library/jest-dom/extend-expect';

const mockSetUserContext = jest.fn();
const mockToast = jest.fn();

jest.mock('@chakra-ui/react', () => {
  const originalModule = jest.requireActual('@chakra-ui/react');
  return {
    ...originalModule,
    useToast: () => mockToast,
  };
});

describe('Posts Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading spinner', () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    ) as jest.Mock;

    render(
      <BrowserRouter>
        <UserContext.Provider
          value={{ user: null, setUserContext: mockSetUserContext }}
        >
          <Posts />
        </UserContext.Provider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Forum - Objave/i)).toBeInTheDocument();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  test('renders no posts message', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    ) as jest.Mock;

    render(
      <BrowserRouter>
        <UserContext.Provider
          value={{ user: null, setUserContext: mockSetUserContext }}
        >
          <Posts />
        </UserContext.Provider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Trenutno ni nobenih objav./i)
      ).toBeInTheDocument();
    });
  });

  test('renders posts', async () => {
    const mockPosts = [
      {
        _id: '1',
        title: 'Test Post 1',
        category: 'Tehnologija',
        userId: { _id: 'user1', username: 'testuser1' },
        likes: [],
        dislikes: [],
        views: 10,
        image: null,
      },
      {
        _id: '2',
        title: 'Test Post 2',
        category: 'Zdravje',
        userId: { _id: 'user2', username: 'testuser2' },
        likes: [],
        dislikes: [],
        views: 20,
        image: null,
      },
    ];

    global.fetch = jest.fn((url) => {
      if (url.includes('hot=true')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPosts),
      });
    }) as jest.Mock;

    render(
      <BrowserRouter>
        <UserContext.Provider
          value={{ user: null, setUserContext: mockSetUserContext }}
        >
          <Posts />
        </UserContext.Provider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Test Post 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Test Post 2/i)).toBeInTheDocument();
    });
  });
});
