// server/middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // Log the full error stack for debugging purposes on the server

    // Default status code and message
    let statusCode = err.statusCode || 500;
    let message = err.message || "An unexpected error occurred.";

    // Handle specific Mongoose errors
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = 400;
        message = 'Invalid ID format.';
    } else if (err.code === 11000) { // Duplicate key error (e.g., duplicate email)
        statusCode = 409;
        message = 'Duplicate field value entered.';
    } else if (err.name === 'ValidationError') { // Mongoose validation error
        statusCode = 400;
        message = Object.values(err.errors).map(val => val.message).join(', ');
    } else if (err.name === "JsonWebTokenError") { // Invalid JWT
        statusCode = 401;
        message = "Unauthorized: Invalid token.";
    } else if (err.name === "TokenExpiredError") { // Expired JWT
        statusCode = 401;
        message = "Unauthorized: Token expired.";
    }

    res.status(statusCode).json({
        success: false,
        message: message
    });
};

export default errorHandler;