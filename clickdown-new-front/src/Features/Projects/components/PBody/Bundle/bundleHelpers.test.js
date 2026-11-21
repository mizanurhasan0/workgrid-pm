import { describe, expect, it } from 'vitest';
import { canonicalPriority, findPriority, priorityChipClass } from './bundleHelpers';

describe('priority spelling', () => {
  it('maps legacy and corrected spellings to the same option', () => {
    expect(findPriority('Immidate').name).toBe('Immediate');
    expect(findPriority('Immediate').name).toBe('Immediate');
    expect(findPriority('Tomorow').name).toBe('Tomorrow');
    expect(findPriority('Tomorrow').label).toBe('Tomorrow');
  });
  it('falls back to Normal for unknown values', () => {
    expect(findPriority('???').name).toBe('Normal');
    expect(findPriority(undefined).name).toBe('Normal');
  });
  it('canonicalises for sorting and filtering', () => {
    expect(canonicalPriority('Tomorow')).toBe(canonicalPriority('Tomorrow'));
    expect(canonicalPriority('Urgent')).toBe('Urgent');
  });
  it('has chip colours for both spellings', () => {
    expect(priorityChipClass.Immidate).toBe(priorityChipClass.Immediate);
  });
});
