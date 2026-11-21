import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginForm from './LoginForm';

const login = vi.fn(() => Promise.resolve(true));
vi.mock('../../../../Context/AuthProvider', () => ({ useAuth: () => ({ login }) }));

afterEach(cleanup);

const setup = () => render(<MemoryRouter><LoginForm /></MemoryRouter>);

describe('LoginForm', () => {
  it('shows validation messages and does not call login for empty fields', async () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByText('Enter your email')).toBeInTheDocument();
    expect(screen.getByText('Enter your password')).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it('submits trimmed credentials and toggles password visibility', async () => {
    setup();
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: ' a@b.co ' } });
    const password = screen.getByLabelText('Password');
    fireEvent.change(password, { target: { value: 'secret123' } });
    expect(password).toHaveAttribute('type', 'password');
    fireEvent.click(screen.getByRole('button', { name: 'Show password' }));
    expect(password).toHaveAttribute('type', 'text');
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    await waitFor(() => expect(login).toHaveBeenCalledWith({ email: 'a@b.co', password: 'secret123', rememberMe: false }));
  });
});
