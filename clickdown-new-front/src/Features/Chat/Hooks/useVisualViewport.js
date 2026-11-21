import { useEffect, useState } from 'react';

// A soft keyboard shrinks the visual viewport but not the layout viewport on iOS.
// Returns the visual viewport height while the keyboard is open, otherwise null.
const KEYBOARD_MIN_PX = 120;

export default function useKeyboardHeight() {
  const [height, setHeight] = useState(null);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) {return undefined;}
    const update = () => {
      const open = window.innerHeight - vv.height > KEYBOARD_MIN_PX;
      setHeight(open ? Math.round(vv.height) : null);
      // iOS scrolls the page to keep the field visible; the layout already fits.
      if (open && window.scrollY !== 0) {window.scrollTo(0, 0);}
    };
    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);

  return height;
}
