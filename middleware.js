exports.requireUserId = function(req, res, next) {
    if (!req.session.userId) {
        res.redirect("/");
    } else {
        next();
    }
};

exports.requireNoSignature = function(req, res, next) {
    if (req.session.sigId) {
        res.redirect("/thankyou");
    } else {
        next();
    }
};

exports.requireSignature = function(req, res, next) {
    if (!req.session.sigId) {
        res.redirect("/");
    } else {
        next();
    }
};
