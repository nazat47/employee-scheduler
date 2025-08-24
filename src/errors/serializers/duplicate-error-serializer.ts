import { AppError } from "../../types/app-error";

export const serializeDuplicateError = (err: AppError) => {
  const message = `Duplicate value entered for ${Object.keys(
    err.keyValue!
  )} fields, please choose another value`;

  const statusCode = 400;

  return {
    statusCode,
    message,
  };
};
