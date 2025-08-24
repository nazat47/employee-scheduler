import { ErrorResponse } from "../../types/error-response";

export const serializeSyntaxError = (): ErrorResponse => {
  const message = "Invalid JSON syntax";
  const statusCode = 400;

  return {
    statusCode,
    message,
  };
};
