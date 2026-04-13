import ApiError from "../util/api-error.js";

const globalErrorMiddleware = (error, req, res, next) => {
  if (error instanceof ApiError)
    return res
      .status(error.statusCode)
      .json({ error: { message: error.message } });
  return res.status(500).json({ error: { message: error.message } });
};
export default globalErrorMiddleware;
