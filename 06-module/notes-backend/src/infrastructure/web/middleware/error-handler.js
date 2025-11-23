import { ValidationError, NotFoundError, ServiceUnavailableError } from '../../../domain/errors.js';

export const errorHandler = (err, req, res, next) => {
  // 1. Log the error (For debugging/observability)
  // In a real app, use a logger like Winston or Pino here
  console.error(`[Error] ${req.method} ${req.path}:`, err);

  // 2. Handle Domain Errors (Known Logic Errors)
  if (err instanceof ValidationError) {
    return res.status(400).json({
      status: 'error',
      type: 'ValidationError',
      message: err.message,
    });
  }

  if (err instanceof NotFoundError) {
    return res.status(404).json({
      status: 'fail',
      type: 'NotFoundError',
      message: err.message,
    });
  }

  if (err instanceof ServiceUnavailableError) {
    return res.status(503).json({
      status: 'error',
      type: 'ServiceUnavailableError',
      message: err.message,
    });
  }

  // 3. Handle Syntax Errors (e.g., Malformed JSON in body)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      status: 'error',
      type: 'InvalidJSON',
      message: 'The request body contains invalid JSON.'
    });
  }

  // 4. Handle Unknown/System Errors (Fail Safe)
  // Never leak stack traces to the client in production
  return res.status(500).json({
    status: 'error',
    type: 'InternalServerError',
    message: 'An unexpected error occurred.',
  });
};