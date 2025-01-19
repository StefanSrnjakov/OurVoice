import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';
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

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders input fields and button', () => {
    render(
      <BrowserRouter>
        <UserContext.Provider
          value={{ user: null, setUserContext: mockSetUserContext }}
        >
          <Login />
        </UserContext.Provider>
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/Uporabniško ime/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Prijava/i })
    ).toBeInTheDocument();
  });

  test('successful login', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ _id: '123', username: 'testuser' }),
      })
    ) as jest.Mock;

    render(
      <BrowserRouter>
        <UserContext.Provider
          value={{ user: null, setUserContext: mockSetUserContext }}
        >
          <Login />
        </UserContext.Provider>
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/Uporabniško ime/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByTestId(/geslo/i), {
      target: { value: 'password' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Prijava/i }));

    await waitFor(() => {
      expect(mockSetUserContext).toHaveBeenCalledWith({
        _id: '123',
        username: 'testuser',
      });
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Prijava uspešna',
          description: 'Dobrodošli, testuser!',
          status: 'success',
        })
      );
    });
  });

  test('failed login with network error', async () => {
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('Network error'))
    ) as jest.Mock;

    render(
      <BrowserRouter>
        <UserContext.Provider
          value={{ user: null, setUserContext: mockSetUserContext }}
        >
          <Login />
        </UserContext.Provider>
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/Uporabniško ime/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByTestId(/geslo/i), {
      target: { value: 'password' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Prijava/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Napaka pri prijavi. Poskusite znova./i)
      ).toBeInTheDocument();
    });
  });
});
