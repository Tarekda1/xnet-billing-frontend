// src/types.ts (optional, for defining types across your project)
export interface FileObject {
  fileName: string;
  url: string;
  size?: number;
  lastModified?: string;
}

// export interface ExcelRow {
//   column1: string;
//   column2: number;
//   // Add more columns as needed based on your data
// }

export type CellValue = string | number | boolean | undefined;

export interface ExcelRow {
  [key: string]: CellValue;
}

export interface Update {
  username: string;
  field: string;
  value: CellValue;
}
