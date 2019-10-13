/**
 * A internal server error handler.
 * @param {Request} req HTTP request object.
 * @param {Response} res HTTP response object to be sent.
 * @param {string} error The error message.
 * @param {string} errorDescription The error description.
 * @returns {Response} The response that was sent.
 */
function handleInternalError(req, res, error='Internal Error', errorDescription='No Description') {
    return res.status(500).send(JSON.stringify({
        error,
        errorDescription,
    }));
}

function handleClientError(req, res, error='Bad Request', errorDescription='No Description') {
    return res.status(400).send(JSON.stringify({
        error,
        errorDescription,
    }));
}

module.exports = { handleInternalError, handleClientError };
