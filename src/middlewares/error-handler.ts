import { NextFunction, Request, Response } from "express";
import {
  isCastError,
  isDuplicateError,
  isSyntaxError,
  isValidationError,
} from "../errors/type-guard";
import { serializeValidationError } from "../errors/serializers/validation-error-serializer";
import { serializeDuplicateError } from "../errors/serializers/duplicate-error-serializer";
import { serializeCastError } from "../errors/serializers/cast-error-serializer";
import { serializeSyntaxError } from "../errors/serializers/syntax-error-serializer";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let customError = {
    message: err.message || "Something went wrong",
    statusCode: err.statusCode || 500,
  };

  if (isValidationError(err)) {
    customError = serializeValidationError(err);
  }

  if (isDuplicateError(err)) {
    customError = serializeDuplicateError(err);
  }

  if (isCastError(err)) {
    customError = serializeCastError(err);
  }

  if (isSyntaxError(err)) {
    customError = serializeSyntaxError();
  }

  res.status(customError.statusCode).json({
    message: customError.message,
  });
};
