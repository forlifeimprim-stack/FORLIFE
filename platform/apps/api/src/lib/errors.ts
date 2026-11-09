export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

export const notFound = (what = "Ressource") => new AppError(404, "NOT_FOUND", `${what} introuvable`);
export const forbidden = (message = "Action non autorisée") => new AppError(403, "FORBIDDEN", message);
export const unauthorized = (message = "Authentification requise") => new AppError(401, "UNAUTHORIZED", message);
export const conflict = (message: string) => new AppError(409, "CONFLICT", message);
export const badRequest = (message: string, details?: unknown) => new AppError(400, "BAD_REQUEST", message, details);
export const paymentRequired = (message: string, details?: unknown) =>
  new AppError(402, "INSUFFICIENT_CREDITS", message, details);
