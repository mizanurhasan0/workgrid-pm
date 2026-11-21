/**
 * Demo accounts shown on the sign-in page. They exist only in the local development
 * database (created by `npm run seed` in the backend). Keep in sync with the backend seed script.
 *
 * The panel is shown in `vite` dev mode only (import.meta.env.DEV), so it is never rendered in a production build.
 */
export const SHOW_DEMO_ACCOUNTS = import.meta.env.DEV;

export const DEMO_ACCOUNTS = [
  { role: 'Owner', description: 'Full access, manages roles', email: 'owner@workgrid.test', password: 'Owner@12345' },
  { role: 'Admin', description: 'Manages projects and members', email: 'admin@workgrid.test', password: 'Admin@12345' },
  { role: 'Member', description: 'Works on assigned tasks', email: 'member@workgrid.test', password: 'Member@12345' },
];
