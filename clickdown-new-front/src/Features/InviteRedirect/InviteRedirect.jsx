import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Invite references are base64 ids with a salt (or usernames): anything else is ignored instead of being stored.
const REFERENCE_RE = /^[a-zA-Z0-9_.@=+-]{1,128}$/;

/**
 * Invite links carry the inviter's reference in the URL. A valid reference is stored so the
 * sign up form can send it to the API; the visitor then continues to the sign up page
 * (also when the reference is missing or malformed).
 */
export default function InviteRedirect() {
  const { username } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    let reference = '';
    try {
      reference = decodeURIComponent(username || '');
    } catch {
      // Malformed percent-encoding: treated as an invalid reference.
    }
    try {
      if (REFERENCE_RE.test(reference)) {localStorage.setItem('refferer', reference);}
      else {localStorage.removeItem('refferer');}
    } catch {
      // Storage is blocked (private mode, disabled cookies): sign up still works without the reference.
    }
    navigate('/signup', { replace: true });
  }, [username, navigate]);

  return (
    <div role="status" className="flex min-h-dvh items-center justify-center bg-surface px-4 text-center text-base text-text-muted">
      Redirecting to sign up...
    </div>
  );
}
