// Page loaders used by Lazy. Keys are the names passed to <Lazy name="..." />.
export default {
  SignIn: () => import('../Pages/SignIn'),
  SignUp: () => import('../Pages/SignUp'),
  Dashboard: () => import('../Layout/Dashboard/Dashboard'),
  Authentication: () => import('../Pages/Authentication'),
  CallPage: () => import('../Pages/CallPage'),
  ChatPage: () => import('../Pages/ChatPage'),
  ForgetPage: () => import('../Pages/ForgetPage'),
  Notifications: () => import('../Pages/Notifications'),
  Project: () => import('../Pages/Project'),
  InviteRedirect: () => import('./InviteRedirect/InviteRedirect'),
  PBody: () => import('./Projects/components/PBody/PBody'),
  NotFound: () => import('../Pages/NotFound'),
};
