import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Profile from './Profile';
import { UserContext } from '../userContext';
import '@testing-library/jest-dom/extend-expect';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Profile Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders profile page when user is not logged in', () => {
    render(
      <BrowserRouter>
        <UserContext.Provider value={{ user: null, setUserContext: jest.fn() }}>
          <Profile />
        </UserContext.Provider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Profil uporabnika/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Za ogled profila se morate prijaviti./i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Prijava/i })
    ).toBeInTheDocument();
  });

  test('navigates to login page when user is not logged in and clicks login button', () => {
    render(
      <BrowserRouter>
        <UserContext.Provider value={{ user: null, setUserContext: jest.fn() }}>
          <Profile />
        </UserContext.Provider>
      </BrowserRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /Prijava/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('renders profile page when user is logged in', () => {
    const mockUser = {
      _id: '1',
      id: '1',
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'password',
      name: 'Test User',
      createdAt: '2023-01-01T00:00:00.000Z',
      userReports: [{ reportingUserId: '', reportReason: '' }] as [
        { reportingUserId: string; reportReason: string },
      ],
      isBanned: false,
      role: 'user',
    };

    render(
      <BrowserRouter>
        <UserContext.Provider
          value={{ user: mockUser, setUserContext: jest.fn() }}
        >
          <Profile />
        </UserContext.Provider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Profil uporabnika/i)).toBeInTheDocument();
    expect(screen.getByText(/Ime:/i)).toBeInTheDocument();
    expect(screen.getByText(/E-pošta:/i)).toBeInTheDocument();
    expect(screen.getByText(/Datum registracije:/i)).toBeInTheDocument();
    expect(screen.getByText(mockUser.username)).toBeInTheDocument();
    expect(screen.getByText(mockUser.email)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Domov/i })).toBeInTheDocument();
  });

  test('navigates to home page when user is logged in and clicks home button', () => {
    const mockUser = {
      _id: '1',
      id: '1',
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'password',
      name: 'Test User',
      createdAt: '2023-01-01T00:00:00.000Z',
      userReports: [{ reportingUserId: '', reportReason: '' }] as [
        { reportingUserId: string; reportReason: string },
      ],
      isBanned: false,
      role: 'user',
    };

    render(
      <BrowserRouter>
        <UserContext.Provider
          value={{ user: mockUser, setUserContext: jest.fn() }}
        >
          <Profile />
        </UserContext.Provider>
      </BrowserRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /Domov/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
