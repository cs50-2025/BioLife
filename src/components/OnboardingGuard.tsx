import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Welcome from '../pages/Welcome';

export default function OnboardingGuard() {
  const [hasVisited, setHasVisited] = useState(() => localStorage.getItem('hasVisitedWelcome') === 'true');

  if (!hasVisited) {
    return (
      <Welcome 
        onComplete={() => {
          localStorage.setItem('hasVisitedWelcome', 'true');
          setHasVisited(true);
        }} 
      />
    );
  }

  return <Outlet />;
}
