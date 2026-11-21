import { useState } from 'react';
import req from '../../../Utils/req';

/**
 * Holds the password reset state shared by the three steps (email, otp, recovery).
 * The reset token and email come back from each step and are kept here.
 */
export default function useLocalForget() {
  const [frgData, setFrgData] = useState(null);

  // Rejects with the raw axios error so callers can show errorMessage(e).
  const onForget = (url, fd) => req({ method: 'POST', uri: url, data: fd })
    .then(({ data }) => {
      setFrgData((prev) => ({
        email: data?.email ?? prev?.email,
        token: data?.token ?? prev?.token,
      }));
      return data;
    });

  return {
    frgData,
    setFrgData,
    onForget,
  };
}
