class HttpError extends Error {
    constructor(statusCode, message) {
        super(message);

        this.statusCode = statusCode;
        this.name = statusCode + " ERROR";
    }
}

const FORBIDDEN = 403;
const NOT_FOUND = 404;
const BAD_REQUEST = 400;
const UNAUTHORIZED = 401;
const INTERNAL_SERVER_ERROR = 500;

module.exports = {
    HttpError,
    FORBIDDEN,
    NOT_FOUND,
    BAD_REQUEST,
    UNAUTHORIZED,
    INTERNAL_SERVER_ERROR
};