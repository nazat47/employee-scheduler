import mongoose from "mongoose";
import { ErrorResponse } from "../../types/error-response";

export const serializeCastError = (
  err: mongoose.Error.CastError
): ErrorResponse => {
  const message = `No item found : ${err.value}`;
  const statusCode = 404;

  return {
    statusCode,
    message,
  };
};
