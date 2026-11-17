import React, { useState, useEffect } from 'react';
import FeedbackForm from './components/feedback/FeedbackForm';
import AdminDashboard from './components/admin/AdminDashboard';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  // Check if current URL is a feedback link: /feedback/:token
  const feedbackMatch = currentPath.match(/^\/feedback\/([a-zA-Z0-9_-]+)/);

  if (feedbackMatch) {
    const token = feedbackMatch[1];
    return (
      <FeedbackForm
        token={token}
        onNavigateToAdmin={() => navigateTo('/')}
      />
    );
  }

  // Default: Admin Quality Dashboard
  return (
    <AdminDashboard
      onSelectTokenToTest={(token) => navigateTo(`/feedback/${token}`)}
    />
  );
}
