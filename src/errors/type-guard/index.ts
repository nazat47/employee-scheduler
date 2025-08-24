import mongoose from "mongoose";
import { AppError } from "../../types/app-error";

export const isValidationError = (err: mongoose.Error.ValidationError) => {
  return (
    err.name === "ValidationError" &&
    err instanceof mongoose.Error.ValidationError
  );
};

export const isCastError = (err: mongoose.Error.CastError) => {
  return err.name === "CastError" && err instanceof mongoose.Error.CastError;
};

export const isDuplicateError = (err: AppError) => {
  return err.code && err.code === 11000;
};

export const isSyntaxError = (
  err: SyntaxError & { status: number; body: any }
) => {
  return err instanceof SyntaxError && err.status === 400 && "body" in err;
};
