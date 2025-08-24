import mongoose from "mongoose";

export const serializeValidationError = (
  err: mongoose.Error.ValidationError
) => {
  const message = Object.values(err.errors!)
    .map((item) => item.message)
    .join(",");

  const statusCode = 400;

  return {
    statusCode,
    message,
  };
};
