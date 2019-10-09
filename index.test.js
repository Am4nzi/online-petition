//JUST CHECK SLACKCED NOTES FROM IVANA!! THE BELOW IS WRONG.

const supertest = require("supertest");
const { app } = require("./index");

//WE'RE REQUIRING THE cookie-session MOCK, not the NPM package cookie-session!!
const cookieSession = require("cookie-session");

test("GET /welcome, when fakeCookieForDemo cookie is sent, receive p tag as response", () => {
    //So here we're sending a cookie called 'fakeCookieForDemo' as part of the request and in index.js 'fakeCookieForDemo' will be attached to req.session. Meaning in index.js req.session.fakeCookieForDemo will be true
    cookieSession.mockSessionOnce({
        fakeCookieForDemo: true
    });

    return supertest(app)
        .get("welcome")
        .then(res => {
            expect(res.statusCode).toBe(200);
            expect(res.text).toBe("<p>wow you have a cookie!</p>");
        });
});

test("GET /home returns 200 status code", () => {
    return supertest(app)
        .get("/home")
        .then(res => {
            console.log("Logging res: ", res);
            expect(res.statusCode).toBe(200);
        });
});

//THIS WILL BE WRITTEN IN PROFILE-ROUTES
app.get("/welcome", (req, res) => {
    if (req.session.fakeCookieForDemo) {
        res.send("<p>you have a cookie!</p>");
    } else {
        res.redirect("home");
    }
});

//THIS IS TO TEST THE ABOVE GET REQUEST Router
test("GET /welcome causes redirect", () => {
    return supertest(app)
        .get("/welcome")
        .then(res => {
            // console.log("res: ", res);
            expect(res.statusCode).toBe(302);
            //Current browser location is stored in res.headers.location.
            expect(res.headers.location).toBe("/home");
        });
});

//TO RUN A TEST YOU ENTER npm test IN THE CONSOLE

//If you get "Jest did not exit one second after the test run has completed" it means that jest triggered an asynchronous function that has not yet completed. In our case if we get this it's probably because the server hasn't been turned off. We have wrapped our app.listen in a if statement to prevent this from happening.
