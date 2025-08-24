export interface AppError extends Error {
  statusCode?: number;
  status?: number;
  code?: number;
  keyValue?: Record<string, any>;
  value?: string;
  errors?: Record<string, { message: string }>;
}
