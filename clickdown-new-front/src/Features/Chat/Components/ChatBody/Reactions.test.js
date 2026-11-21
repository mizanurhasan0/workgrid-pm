import { describe, expect, it } from 'vitest';
import { summarizeReactions } from './Reactions';

describe('summarizeReactions', () => {
  const reactions = [
    { id: '1', emoji: '👍', user: 'a' },
    { id: '2', emoji: '👍', user: 'me' },
    { id: '3', emoji: '🎉', user: 'b' },
    { id: '4', emoji: '🎉' },
    'unpopulated-id',
  ];

  it('counts per emoji in first-seen order and flags the signed-in user', () => {
    expect(summarizeReactions(reactions, 'me')).toEqual([
      { emoji: '👍', count: 2, mine: true },
      { emoji: '🎉', count: 2, mine: false },
    ]);
  });

  it('never marks anonymous legacy reactions as mine and tolerates no input', () => {
    expect(summarizeReactions(reactions)[1].mine).toBe(false);
    expect(summarizeReactions(undefined, 'me')).toEqual([]);
  });
});
