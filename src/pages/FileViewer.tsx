import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { usePresignedUrlMutation } from '../api/presignedUrlQueries';
import { useSaveFileQuery } from '../api/saveFileQueries';
import { ExcelRow, Update } from '../types/types';
import Table from '../components/Table'; // Extracted Table component
import Pagination from '../components/Pagination'; // Extracted Pagination component
import LoadingSpinner from '../components/LoadingSpinner'; // Extracted Loading component

const FileViewer: React.FC = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<ExcelRow[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]); // Track updates
  const [editedRows, setEditedRows] = useState<Set<number>>(new Set()); // Highlight edited rows
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const rowsPerPage = 50; // Number of rows per page
  const presignedUrlMutation = usePresignedUrlMutation();
  const saveFileMutation = useSaveFileQuery();

  // Calculate total pages based on data
  const totalPages = useMemo(
    () => Math.ceil(data.length / rowsPerPage),
    [data],
  );
  const paginatedData = useMemo(
    () =>
      data.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage),
    [data, currentPage, rowsPerPage],
  );

  useEffect(() => {
    if (fileId) {
      setLoading(true);
      presignedUrlMutation.mutate(`uploads/${fileId}`, {
        onSuccess: async (data: any) => {
          try {
            const response = await fetch(data.url);
            const arrayBuffer = await response.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const sheetData: ExcelRow[] =
              XLSX.utils.sheet_to_json<ExcelRow>(worksheet);
            setData(sheetData);
          } catch (error) {
            console.error('Error loading file:', error);
          } finally {
            setLoading(false);
          }
        },
        onError: (error: any) => {
          console.error('Error fetching presigned URL:', error);
          setLoading(false);
        },
      });
    }
  }, [fileId]);

  // Compute all unique headers from the dataset
  const allHeaders = useMemo(
    () =>
      Array.from(
        data.reduce((headers, row) => {
          Object.keys(row).forEach((key) => headers.add(key));
          return headers;
        }, new Set<string>()),
      ),
    [data],
  );

  // Handle Cell Change
  const handleCellChange = useCallback(
    (
      rowIndex: number,
      columnKey: string,
      newValue: string | number | boolean,
    ) => {
      const updatedData = [...data];
      const row = updatedData[rowIndex];

      // Update the data locally
      row[columnKey] = newValue;
      setData(updatedData);

      // Ensure username is a string
      const username = String(row['username']); // Convert to string if it's not

      setUpdates((prev) => {
        const existingIndex = prev.findIndex(
          (update) =>
            update.username === username && update.field === columnKey,
        );
        if (existingIndex >= 0) {
          // Update the existing entry
          const newUpdates = [...prev];
          newUpdates[existingIndex] = {
            username,
            field: columnKey,
            value: newValue,
          };
          return newUpdates;
        } else {
          // Add a new entry
          return [...prev, { username, field: columnKey, value: newValue }];
        }
      });

      // Highlight edited row
      setEditedRows((prev) => {
        const newSet = new Set(prev);
        newSet.add(rowIndex);
        return newSet;
      });
    },
    [data],
  );

  // Delete a Row
  const handleDeleteRow = useCallback(
    (rowIndex: number) => {
      const updatedData = [...data];
      const globalIndex = (currentPage - 1) * rowsPerPage + rowIndex;

      // Remove the row
      updatedData.splice(globalIndex, 1);
      setData(updatedData);

      // Remove any updates associated with the deleted row
      const username = String(data[globalIndex]?.username);
      setUpdates((prev) =>
        prev.filter((update) => update.username !== username),
      );

      // Clear the row from edited rows
      setEditedRows((prev) => {
        const newSet = new Set(prev);
        newSet.delete(globalIndex);
        return newSet;
      });
    },
    [data, currentPage, rowsPerPage],
  );

  // Save Changes
  const handleSaveChanges = useCallback(() => {
    if (!updates.length) return;

    saveFileMutation.mutate(
      { fileId: `uploads/${fileId}`, updatedData: updates },
      {
        onSuccess: () => {
          alert('Changes saved successfully!');
          setUpdates([]);
          setEditedRows(new Set());
        },
        onError: (error: unknown) => {
          alert(
            `Failed to save changes: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`,
          );
        },
      },
    );
  }, [fileId, saveFileMutation, updates]);

  // Handle page change
  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages],
  );

  return (
    <div className="container mx-auto p-4">
      <button onClick={() => navigate(-1)} className="text-blue-500 mb-4">
        Back
      </button>
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">
        Viewing File
      </h2>
      <p className="text-gray-600 mb-4">
        Hint: Double-click a cell to edit text, or toggle checkboxes for boolean
        fields.
      </p>

      {loading ? (
        <LoadingSpinner message="Loading file..." />
      ) : (
        <>
          <div className="flex justify-between mb-4">
            <button
              onClick={handleSaveChanges}
              disabled={saveFileMutation.isPending}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
            >
              {saveFileMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          <Table
            headers={allHeaders}
            data={paginatedData}
            onCellChange={handleCellChange}
            onDeleteRow={handleDeleteRow}
            editedRows={editedRows}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default FileViewer;
