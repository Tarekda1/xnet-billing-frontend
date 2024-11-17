import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
  return (
    <div className="flex justify-center items-center h-40">
      <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
      {message && <p className="ml-4 text-gray-600">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
