import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Btn from './Btn';

describe('Btn', () => {
  it('renders a button of type button by default and calls onClick', () => {
    const onClick = vi.fn();
    render(<Btn onClick={onClick}>Save</Btn>);
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toHaveAttribute('type', 'button');
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled is set', () => {
    render(<Btn disabled>Send</Btn>);
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
  });
});
