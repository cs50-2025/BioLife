import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Welcome from '../pages/Welcome';

let hasVisitedSession = false;

export default function OnboardingGuard() {
  const [hasVisited, setHasVisited] = useState(hasVisitedSession);

  if (!hasVisited) {
    return (
      <Welcome 
        onComplete={() => {
          hasVisitedSession = true;
          setHasVisited(true);
        }} 
      />
    );
  }

  return <Outlet />;
}
