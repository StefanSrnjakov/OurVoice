import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from './Register';
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

describe('Register Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders input fields and button', () => {
    render(
      <BrowserRouter>
        <UserContext.Provider
          value={{ user: null, setUserContext: mockSetUserContext }}
        >
          <Register />
        </UserContext.Provider>
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/Email:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Uporabniško ime/i)).toBeInTheDocument();
    expect(screen.getByTestId(/Geslo/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Registracija/i })
    ).toBeInTheDocument();
  });

  test('successful registration', async () => {
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
          <Register />
        </UserContext.Provider>
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/Email:/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Uporabniško ime/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByTestId(/Geslo/i), {
      target: { value: 'password' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Registracija/i }));

    await waitFor(() => {
      expect(mockSetUserContext).toHaveBeenCalledWith({
        _id: '123',
        username: 'testuser',
      });
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Registracija uspešna!',
          description: 'Dobrodošli, testuser!',
          status: 'success',
        })
      );
    });
  });

  test('failed registration with network error', async () => {
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('Network error'))
    ) as jest.Mock;

    render(
      <BrowserRouter>
        <UserContext.Provider
          value={{ user: null, setUserContext: mockSetUserContext }}
        >
          <Register />
        </UserContext.Provider>
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/Email:/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Uporabniško ime/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByTestId(/Geslo/i), {
      target: { value: 'password' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Registracija/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Registracija ni uspela. Prosimo, poskusite znova./i)
      ).toBeInTheDocument();
    });
  });
});
