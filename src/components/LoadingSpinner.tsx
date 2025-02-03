import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  small?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message, small }) => {
  return (
    <div
      className={`flex justify-center items-center ${small ? 'h-4' : 'h-20'}`}
    >
      <div
        className={`animate-spin rounded-full border-2 border-t-2 ${
          small ? 'h-4 w-4' : 'h-6 w-6'
        } border-gray-300 border-t-blue-500`}
      ></div>
      {message && <p className="ml-4 text-gray-600">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
