import { base16AteliersulphurpoolLight, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from './theme';

/**
 * Syntax-highlighter style that matches the current light/dark theme.
 * @returns {Object} A react-syntax-highlighter (Prism) style object.
 */
export function useCodeTheme() {
  const { isDark } = useTheme();
  return isDark ? oneDark : base16AteliersulphurpoolLight;
}
