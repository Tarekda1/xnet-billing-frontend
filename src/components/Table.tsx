import React from 'react';
import { ExcelRow } from '../types';

interface TableProps {
  headers: string[];
  data: ExcelRow[];
  onCellChange: (
    rowIndex: number,
    columnKey: string,
    newValue: string | number | boolean,
  ) => void;
  onDeleteRow: (rowIndex: number) => void;
  editedRows: Set<number>;
}

const Table: React.FC<TableProps> = ({
  headers,
  data,
  onCellChange,
  onDeleteRow,
  editedRows,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="py-2 px-4 bg-gray-100 border-b text-left text-xs uppercase font-semibold text-gray-600"
              >
                {header}
              </th>
            ))}
            <th className="py-2 px-4 bg-gray-100 border-b text-left text-xs uppercase font-semibold text-gray-600">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={`border-b ${
                editedRows.has(rowIndex) ? 'bg-yellow-100' : ''
              }`}
            >
              {headers.map((key) => (
                <td key={key} className="py-2 px-4 border-b text-sm">
                  {typeof row[key] === 'boolean' ? (
                    <input
                      type="checkbox"
                      checked={!!row[key]}
                      onChange={(e) =>
                        onCellChange(rowIndex, key, e.target.checked)
                      }
                      className="cursor-pointer"
                    />
                  ) : (
                    <input
                      type="text"
                      value={row[key] !== undefined ? String(row[key]) : ''}
                      onChange={(e) =>
                        onCellChange(
                          rowIndex,
                          key,
                          isNaN(Number(e.target.value))
                            ? e.target.value
                            : Number(e.target.value),
                        )
                      }
                      className="border rounded p-1 w-full"
                    />
                  )}
                </td>
              ))}
              <td className="py-2 px-4 border-b text-sm text-gray-700">
                <button
                  onClick={() => onDeleteRow(rowIndex)}
                  className="text-red-500 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
