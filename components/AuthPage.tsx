import React from 'react';

interface AuthPageProps {
  children: React.ReactNode;
}

const AuthPage: React.FC<AuthPageProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-purple-100 px-4 py-8">
      <div className="w-full max-w-md mx-auto">
        {children}
      </div>
    </div>
  );
};

export default AuthPage;
