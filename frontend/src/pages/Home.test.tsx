import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from './Home';
import '@testing-library/jest-dom/extend-expect';

describe('Home Component', () => {
  test('renders main heading', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    const headingElement = screen.getByRole('heading', {
      name: /Forum YourVoice/i,
    });
    expect(headingElement).toBeInTheDocument();
  });

  test('renders description text', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    const descriptionText = screen.getByText(
      /YourVoice je interaktivni forum/i
    );
    expect(descriptionText).toBeInTheDocument();
  });

  test('renders image with correct src and alt attributes', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    const imageElement = screen.getByRole('img', { name: /YourVoice logo/i });
    expect(imageElement).toHaveAttribute('src', 'images/default.png');
    expect(imageElement).toHaveAttribute('alt', 'YourVoice logo');
  });
});
