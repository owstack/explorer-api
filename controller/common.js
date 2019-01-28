module.exports = {
    notReady: (req, h, p) => {
        return h.response(`Server not yet ready. Sync Percentage: ${p}`).code(503);
    },
    handleErrors: (req, h, err) => {
        if (err) {
            if (err.code) {
                return h.response(`${err.message}. Code:${err.code}`).code(400);
            } else {
                console.error(err);
                return h.response(err.message).code(503);
            }
        } else {
            return h.response('Not found').code(404);
        }
    }
};
