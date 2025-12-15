import { HTTP_STATUS } from "./constants.js";

/**
 * Send a success response
 */
export const sendSuccess = (res, data, statusCode = HTTP_STATUS.OK) => {
  return res.status(statusCode).json(data);
};

/**
 * Send a created response
 */
export const sendCreated = (res, data) => {
  return res.status(HTTP_STATUS.CREATED).json(data);
};

/**
 * Send an error response
 */
export const sendError = (res, message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR) => {
  return res.status(statusCode).json({ error: message });
};

/**
 * Send a message response
 */
export const sendMessage = (res, message, statusCode = HTTP_STATUS.OK) => {
  return res.status(statusCode).json({ message });
};

/**
 * Send a not found response
 */
export const sendNotFound = (res, message = "Resource not found") => {
  return res.status(HTTP_STATUS.NOT_FOUND).json({ error: message });
};

/**
 * Send a bad request response
 */
export const sendBadRequest = (res, message) => {
  return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: message });
};

/**
 * Send an unauthorized response
 */
export const sendUnauthorized = (res, message = "Unauthorized") => {
  return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: message });
};

/**
 * Send a conflict response (e.g., duplicate entries)
 */
export const sendConflict = (res, message) => {
  return res.status(HTTP_STATUS.CONFLICT).json({ error: message });
};
