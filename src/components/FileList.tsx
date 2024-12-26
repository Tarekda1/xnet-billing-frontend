// src/components/FileList.tsx
import React from 'react';
import { useFilesQuery } from '../api';
import { useNavigate } from 'react-router-dom';
import { FileObject } from '../types/types';

const FileList: React.FC = () => {
  const { data: files, isLoading, error } = useFilesQuery();
  const navigate = useNavigate();

  const handleViewFile = (file: FileObject) => {
    const filename = file.fileName;
    const strippedFilename = filename.substring('uploads/'.length);
    navigate(`/view/${strippedFilename}`);
  };

  if (isLoading)
    return <p className="text-center text-gray-500">Loading invoices...</p>;
  if (error)
    return <p className="text-center text-red-500">Error loading invoices</p>;

  return (
    <div className="container w-full py-2">
      <h1 className="text-2xl font-semibold text-gray-700 mb-2">
        Customer Invoices
      </h1>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-3 px-6 bg-gray-100 text-gray-600 text-left text-sm uppercase font-semibold">
                Invoice Name
              </th>
              <th className="py-3 px-6 bg-gray-100 text-gray-600 text-left text-sm uppercase font-semibold">
                Last Modified
              </th>
              <th className="py-3 px-6 bg-gray-100 text-gray-600 text-center text-sm uppercase font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {files?.map((file: FileObject) => (
              <tr
                key={file.fileName}
                className="border-b border-gray-200 hover:bg-gray-50"
              >
                <td className="py-4 px-6 text-gray-700 text-sm">
                  {file.fileName}
                </td>
                <td className="py-4 px-6 text-gray-500 text-sm">
                  {file.lastModified}
                </td>
                <td className="py-4 px-6 text-center">
                  <button
                    onClick={() => handleViewFile(file)}
                    className="text-blue-500 hover:underline"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FileList;
