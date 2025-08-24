import { CustomError } from "./custom-error";

export class ForbiddenError extends CustomError {
  constructor(message: string) {
    super(message);
    this.statusCode = 403;
  }
}
