class ApiError extends Error {
  constructor(code, success, message, details = null) {
    super(message);
    this.success = success;
    this.code = code;
    this.details = details;
  }
}

export default ApiError;
