const express = require("express");
const router = (exports.router = express.Router());
const db = require("./utils/db");
const { hash, compare } = require("./utils/bc");
const {
    requireNoSignature,
    requireSignature,
    requireUserId
} = require("./middleware");
const app = (exports.app = express());

// ******************************************************
// ***********REDIRECT IF COOKIES NOT PRESENT************
// ******************************************************

router.use(function(req, res, next) {
    if (
        !req.session.userId &&
        req.url != "/registration" &&
        req.url != "/login" &&
        req.url != "/profile"
    ) {
        res.redirect("/registration");
    } else {
        next();
    }
});

// ************************************
// ***********HOME REDIRECT************
// ************************************

router.get("/", (req, res) => {
    res.redirect("/registration");
});

// *****************************************
// ***********REGISTRATION ROUTE************
// *****************************************

router.get("/registration", (req, res) => {
    res.render("registration", {
        layout: "main"
    });
});

router.post("/registration", (req, res) => {
    console.log("***REGISTRATION POST: START***");

    let fname = req.body.fname;
    fname = fname.toLowerCase();
    fname = fname.charAt(0).toUpperCase() + fname.substring(1);
    let lname = req.body.lname;
    lname = lname.toLowerCase();
    lname = lname.charAt(0).toUpperCase() + lname.substring(1);
    let email = req.body.email;
    let password = req.body.password;

    if (fname && lname && email && password) {
        hash(password)
            .then(hash => {
                db.addUserData(fname, lname, email, hash)
                    .then(id => {
                        req.session.userId = id.rows[0].id;
                        req.session.fname = fname;
                        res.redirect("/profile");
                        console.log("***REGISTRATION POST: SUCCESS***");
                    })
                    .catch(error => console.log("Error during reg: ", error));
            })
            .catch(error => console.log("Error during reg: ", error));
    } else {
        res.render("registration", {
            error: true,
            layout: "main"
        });
    }
});

// *******************************************
// *************LOG IN ROUTE******************
// *******************************************

router.get("/login", (req, res) => {
    res.render("login", {
        layout: "main"
    });
});

router.post("/login", (req, res) => {
    console.log("***LOG IN POST ROUTE: START***");
    db.getHashAndId(req.body.email).then(hash => {
        compare(req.body.password, hash[0].password)
            .then(match => {
                req.session.userId = hash[0].id;
                console.log("***LOG IN POST ROUTE: SUCCESS***");
                console.log("Did my password match?");
                console.log(match);

                if (match === true) {
                    db.checkSignature(req.session.userId)
                        .then(sig => {
                            if (sig.rows.length == 0) {
                                console.log("Logging match", match);
                                res.redirect("/petition");
                            } else {
                                req.session.sigId = sig.rows[0].id;
                                console.log("Logging match", match);
                                res.redirect("/thankyou");
                            }
                        })
                        .catch(e => console.log(e));
                } else if (match === false) {
                    console
                        .log("Details not found in database")
                        .catch(e => console.log(e));
                }
            })
            .catch(e => console.log(e));
        console.log("***THIS IS THE UNSUCCESSFUL POST LOGIN ROUTE SPEAKING***");
    });
});

// *************************************************
// *************USER PROFILE ROUTE******************
// *************************************************

router.get("/profile", requireUserId, (req, res) => {
    res.render("profile", {
        layout: "main"
    });
});

router.post("/profile", requireUserId, (req, res) => {
    console.log("***PROFILE POST ROUTE: START***");
    let age = req.body.age;
    let city = req.body.city;
    let url = req.body.website;
    let userId = req.session.userId;

    city = city.toLowerCase();
    city = city.charAt(0).toUpperCase() + city.substring(1);

    if (!url.startsWith("http" && !req.body.url === null)) {
        let http = "http://";
        url = http.concat(url);
    }

    db.updateUserProfileData(age, city, url, userId);
    console.log("This is the URL log: ", url);

    res.redirect("/petition");
    console.log("***PROFILE POST ROUTE: SUCCESS**");
});

// *******************************************
// ***********SIGN PETITION ROUTE*************
// *******************************************

router.get("/petition", requireNoSignature, (req, res) => {
    res.render("home", {
        layout: "main"
    });
});

router.post("/petition", requireNoSignature, (req, res) => {
    console.log("***SIGNATURE POST ROUTE: START***");
    let sig = req.body.sig;
    let userId = req.session.userId;
    db.addSignature(sig, userId)
        .then(id => {
            req.session.sigId = id.rows[0].id;
            res.redirect("/thankyou");
            console.log("***SIGNATURE POST: SUCCESS***");
        })
        .catch(error => {
            console.log("error: ", error);
            res.render("home", {
                error: "error"
            });
        });
});

// **********************************************
// *************THANK YOU ROUTE******************
// **********************************************

router.get("/thankyou", requireSignature, (req, res) => {
    if (req.session.sigId) {
        console.log("*** THANK YOU POST: GENERAL***");
        db.getSignature(req.session.sigId)
            .then(sig => {
                console.log("THIS IS MY LOG", sig);
                console.log(req.session.fname);
                res.render("thankyou", {
                    layout: "thankyou",
                    sig: sig.rows[0],
                    user: req.session.fname
                });
                console.log("***THANK YOU POST: SUCCESS***");
            })
            .catch(error => {
                console.log("error thanks route: ", error);
            });
    } else {
        res.redirect("/registration");
        console.log("***THANK YOU POST: UNSUCESSFULL***");
    }
});

router.post("/thankyou", (req, res) => {
    db.deleteSignature(req.session.id)
        .then(() => {
            console.log(req.session.id);
            req.session.sigId = null;
            res.redirect("/petition");
        })
        .catch(err => {
            console.log(err);
        });
});

// *******************************************
// *************SIGNERS ROUTE*****************
// *******************************************

router.get("/signers", requireSignature, (req, res) => {
    console.log("***SIGNERS POST: START***");

    db.getSigners()
        .then(signers => {
            console.log("MY LOG ", signers.rows[signers.rows.length - 1]);
            // console.log(req.session.count);
            res.render("signers", {
                layout: "main",
                signers: signers.rows,
                count: signers.rows.length - 1
            });
        })
        .catch(error => {
            console.log("error: ", error);
        });
});

// *******************************************
// *************CITIES ROUTE******************
// // *******************************************
//
// router.get("/signers/:city", (req, res) => {
//     if (req.session.sigId) {
//         db.getCities(req.params.city)
//             .then(signers => {
//                 res.render("cities", {
//                     layout: "main",
//                     signers: signers.rows,
//                     city: req.params.city
//                 });
//             })
//             .catch(error => {
//                 console.log("error: ", error);
//             });
//     } else {
//         res.redirect("/petition");
//         console.log("City error");
//     }
// });

router.get("/signers/:city", (req, res) => {
    if (req.session.sigId) {
        db.getCities(req.params.city)
            .then(cities => {
                res.render("cities", {
                    signers: cities,
                    city: req.params.city,
                    layout: "main"
                });
            })
            .catch(error => {
                console.log("error: ", error);
            });
    } else {
        res.redirect("/signature");
        console.log("redirected from signers/city");
    }
});

// *************************************************
// *************EDIT PROFILE ROUTE******************
// *************************************************

router.get("/edit", (req, res) => {
    console.log("***EDIT POST: START***");
    db.getEdit(req.session.userId)
        .then(result => {
            res.render("edit", {
                fname: result[0].fname,
                lname: result[0].lname,
                email: result[0].email,
                age: result[0].age,
                city: result[0].city,
                url: result[0].url,
                error: "error",
                layout: "main"
            });
        })
        .catch(error => {
            console.log("error thanks route: ", error);
        });
});

router.post("/edit", (req, res) => {
    console.log("***EDIT POST: START***");

    let fname = req.body.fname;
    let lname = req.body.lname;
    let email = req.body.email;
    let age = req.body.age;
    let city = req.body.city;
    let url = req.body.website;
    let userId = req.session.userId;
    let password = req.body.password;

    console.log(
        "LOGGING REQ.BODY INFO",
        fname,
        lname,
        email,
        userId,
        age,
        city,
        url
    );

    hash(password).then(hash => {
        db.updateUserData(fname, lname, email, hash, userId)
            .then(() => {
                db.updateUserProfileData(age, city, url, userId);
            })
            .then(() => {
                res.redirect("/edit");
                console.log("***EDIT POST: SUCCESS***");
            })
            .catch(error => {
                console.log("ERROR IN EDIT POST:", error);
                res.render("/edit", {
                    error: error
                });
            });
    });
});

// *******************************************
// *************LOGOUT ROUTE******************
// *******************************************
router.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/");
});
