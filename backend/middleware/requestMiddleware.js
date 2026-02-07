const db = require("../config/db");

const isRequestRejected = async (req, res, next) => {
    let requestId = req.query.requestId;

    try {
        let result = await db.requests.find({ id: requestId });
        if (result.length === 0 && db.type === 'mongo_db') {
            result = await db.requests.find({ _id: requestId });
        }
        
        const request = result[0];

        if (request && request.status === "rejected") {
            res.json({
                isOk: false,
                msg: "This request is already rejected.",
            });
        } else {
            next();
        }
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
};

module.exports = {
    isRequestRejected,
};