const _db = require("../config/db");

const isRequestRejected = async (req, res, next) => {
    let requestId = req.query.requestId;
    let db = _db.getDb();

    try {
        let result = await db.get(
            "SELECT status FROM requests WHERE id = ?",
            [requestId]
        );

        if (result && result.status === "rejected") {
            res.json({
                isOk: false,
                msg: "This request is already rejected.",
            });
        } else {
            next();
        }
    } catch (err) {
        res.send(err);
    }
};

module.exports = {
    isRequestRejected,
};