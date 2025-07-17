import React from 'react';

interface AuthPageProps {
  children: React.ReactNode;
}

const AuthPage: React.FC<AuthPageProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-purple-100 px-4 py-8">
      <div className="w-full max-w-md mx-auto">
        <div className="flex flex-col items-center mb-8">
          <div className="h-20 w-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg mb-4">
            <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dental Record Pro</h1>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthPage;
