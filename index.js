const express = require("express");
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");
const app = express();
const csurf = require("csurf");
const profileRouter = require("./profile-routes");

app.use(
    cookieSession({
        secret: `I'm always hungry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14
    })
);

// ************************************
// ***********DO NOT TOUCH*************
// ************************************

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(express.static("public"));
app.use(express.static("./views"));

app.use("/favicon.ico", (req, res) => res.sendStatus(404));

// *******************************
// ***********SECURITY************
// ********************************

app.use(
    express.urlencoded({
        extended: false
    })
);

app.use(csurf());

app.use(function(req, res, next) {
    res.setHeader("x-frame-options", "deny");
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use(profileRouter.router);

// ***********************************
// *************SERVER****************
// ***********************************

//The if statement is to prevent jest throwing errors because the asynchronous server event hasn't ended.
// if (require.main === module) {
//     app.listen(process.env.PORT || 8080, () =>
//         console.log("Server is listening...")
//     );
// }

// if (require.main === module) {
app.listen(process.env.PORT || 8080, () =>
    console.log("Server is listening...")
);
// }

// app.listen(process.env.PORT || 8080, () => {
//     ca.rainbow("ʕ•ᴥ•ʔ The Petition Express is running...");
// });
