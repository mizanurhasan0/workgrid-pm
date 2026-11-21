import { useState } from 'react';
import { useAuth } from '../../../Context/AuthProvider';
import req from '../../../Utils/req';

/**
 * Local copy of the signed-in user used by the profile settings, plus the role update call.
 * @returns {{userData: Object, setUserData: function, onUpdateRole: function}}
 */
export default function useUserData() {
  const { user } = useAuth();
  // Local edits; until the user makes one, the signed-in user is shown.
  const [edits, setUserData] = useState(null);
  const userData = edits ?? user ?? {};

  /**
   * Changes another member's role. Changing your own role is refused here.
   * Errors are returned as rejected promises; the caller shows the message.
   * @param {{body: {id: string, role: string}}} args
   * @returns {Promise}
   */
  const onUpdateRole = ({ body }) => {
    if (body?.id === user?.id) {
      return Promise.reject(new Error('You cannot change your own role.'));
    }
    return req({ method: 'PATCH', uri: `user/${body.id}`, data: { role: body.role } });
  };

  return {
    userData,
    setUserData,
    onUpdateRole,
  };
}
