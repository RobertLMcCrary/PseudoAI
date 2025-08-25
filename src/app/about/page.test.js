/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import About from './page';

// Mock Navbar and Footer with display names to avoid ESLint errors
jest.mock('../components/Navbar', () => {
  const MockNavbar = () => <nav data-testid="navbar" />;
  MockNavbar.displayName = 'MockNavbar';
  return MockNavbar;
});

jest.mock('../components/Footer', () => {
  const MockFooter = () => <footer data-testid="footer" />;
  MockFooter.displayName = 'MockFooter';
  return MockFooter;
});

describe('About Page', () => {
  it('renders the main heading', () => {
    render(<About />);
    expect(screen.getByRole('heading', { name: /about pseudoai/i })).toBeInTheDocument();
  });

  it('renders the subheading', () => {
    render(<About />);
    expect(screen.getByText(/your partner in mastering coding interviews/i)).toBeInTheDocument();
  });

  it('renders all feature cards', () => {
    render(<About />);
    expect(screen.getByText(/guided problem solving/i)).toBeInTheDocument();
    expect(screen.getByText(/no spoilers/i)).toBeInTheDocument();
    expect(screen.getByText(/interview confidence/i)).toBeInTheDocument();
  });

  it('renders the "Why It Works" section', () => {
    render(<About />);
    expect(screen.getByRole('heading', { name: /why it works/i })).toBeInTheDocument();
    expect(screen.getByText(/pseudoai focuses on incremental progress/i)).toBeInTheDocument();
  });

  it('renders Navbar and Footer', () => {
    render(<About />);
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });
});