import React, { Suspense, lazy } from 'react';
import ComLocations from './ComLocations';
import Loading2 from '../Components/Loading2';

// Each page is created once, at module load. Creating lazy() components during render would remount pages on every render.
// lazy() does not download anything until the page is first rendered.
const pages = Object.fromEntries(
  Object.entries(ComLocations).map(([name, loader]) => [name, lazy(loader)]),
);

function PageFallback() {
  return (
    <div role="status" aria-live="polite" className="flex items-center justify-center w-full h-screen">
      <Loading2 />
    </div>
  );
}

function Lazy({ name }) {
  const Page = pages[name];
  if (!Page) {
    console.error(`Unknown page "${name}". Add it to src/Features/ComLocations.js.`);
    return null;
  }
  return (
    <Suspense fallback={<PageFallback />}>
      <Page />
    </Suspense>
  );
}
export default Lazy;
