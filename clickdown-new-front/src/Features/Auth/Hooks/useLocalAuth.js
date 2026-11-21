import { useState } from 'react';

/** UI state for the combined login / register screen. */
export default function useLocalAuth() {
  const [newUser, setNewUser] = useState(false);
  return { newUser, setNewUser };
}
