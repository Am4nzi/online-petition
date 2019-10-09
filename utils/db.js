var spicedPg = require("spiced-pg");
var db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/petition"
);

// ****************************************************
// *************ADD USER DATA******************
// ****************************************************
exports.addUserData = (fname, lname, email, password) => {
    return db.query(
        `INSERT INTO users (fname, lname, email, password) VALUES
         ($1, $2, $3, $4)
         RETURNING id`,
        [fname, lname, email, password]
    );
};

// ***********************************************
// *************ADD PROFILE DATA******************
// ***********************************************
exports.addProfileData = (age, city, url, userId) => {
    return db.query(
        `INSERT INTO userprofiles (age, city, url, user_id) VALUES
         ($1, $2, $3, $4)
         RETURNING id`,
        [age, city, url, userId]
    );
};

// ***********************************************
// ****************ADD SIGNATURE******************
// ***********************************************
exports.addSignature = (sig, userId) => {
    return db.query(
        `INSERT INTO signatures (sig, user_id) VALUES
         ($1, $2)
         RETURNING id`,
        [sig, userId]
    );
};

// ***********************************************
// ****************GET SIGNERS********************
// ***********************************************
// exports.getSigners = function() {
//     return db.query(`SELECT * FROM users`);
// };

exports.getSigners = function() {
    return db.query(`SELECT fname, lname, email, age, city, url
	        FROM users
	        FULL OUTER JOIN userprofiles
	        ON users.id = userprofiles.user_id;
            SELECT COUNT(*) FROM signatures`);
};

exports.getCount = () => {
    return db.query(`SELECT COUNT(*) FROM signatures`).then(count => {
        return count.rows[0].count;
    });
};

// **********************************************
// **********GET SIGNATURES ON LOGIN*************
// **********************************************
exports.checkSignature = function(sig) {
    return db.query(`SELECT sig, id FROM signatures WHERE user_id = $1`, [sig]);
};

// **********************************************
// **********GET SIGNATURES *********************
// **********************************************
exports.getSignature = function(sig) {
    return db.query(`SELECT sig FROM signatures WHERE id = $1`, [sig]);
};

// **********************************************
// **********GET HASH AND ID ********************
// **********************************************
exports.getHashAndId = function(email) {
    return db
        .query(`SELECT password, id FROM users WHERE email=$1`, [email])
        .then(({ rows }) => {
            return rows;
        });
};

// **********************************************
// **********GET CITIES *************************
// **********************************************

// exports.getCities = function(city) {
//     return db.query(
//         `SELECT users.fname, users.lname, userprofiles.age, userprofiles.url, userprofiles.city
//         FROM signatures
//         JOIN users
//         ON signatures.user_id = users.id
//         JOIN userprofiles
//         ON users.id = userprofiles.user_id
//         WHERE LOWER(userprofiles.city) = LOWER($1)`,
//         [city || null]
//     );
// };
//
// exports.getCities = function(city) {
//     return db
//         .query(
//             `SELECT fname, lname, age, url
//             FROM users
//             JOIN userprofiles
//             ON users.id = userprofiles.user_id
//             JOIN signatures
//             ON users.id = signatures.user_id
//             WHERE LOWER(userprofiles.city)=LOWER($1)`,
//             [city]
//         )
//         .then(({ rows }) => {
//             return rows;
//         });
// };

exports.getCities = function(city) {
    return db
        .query(
            `SELECT users.fname, users.lname, userprofiles.age, userprofiles.url
        FROM signatures
        JOIN users
        ON signatures.user_id = users.id
        JOIN userprofiles
        ON users.id = userprofiles.user_id
        WHERE LOWER(userprofiles.city) = LOWER($1)`,
            [city || null]
        )
        .then(({ rows }) => {
            return rows;
        });
};

exports.getEdit = function(user_id) {
    return db
        .query(
            `SELECT users.fname, users.lname, users.email, userprofiles.age, userprofiles.city, userprofiles.url FROM users LEFT OUTER JOIN userprofiles ON users.id = userprofiles.user_id WHERE users.id = $1`,
            [user_id]
        )
        .then(({ rows }) => {
            return rows;
        });
};

// ***********************************************
// **********UPDATE USER DATA*********************
// ***********************************************
exports.updateUserData = (fname, lname, email, password, user_id) => {
    return db.query(
        `UPDATE users
        SET fname = $1, lname = $2, email = $3, password = $4
        WHERE users.id = $5
         RETURNING id`,
        [fname, lname, email, password, user_id]
    );
};

// ***********************************************
// **********UPDATE USER PROFILE DATA*************
// ***********************************************

exports.updateUserProfileData = (age, city, url, user_id) => {
    return db.query(
        `INSERT INTO userprofiles (age, city, url, user_id)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id)
        DO UPDATE SET age = $1, city = $2, url = $3`,
        [age, city, url, user_id]
    );
};

// ***************************************
// **********DELETE SIGNATURE*************
// ***************************************

exports.deleteSignature = user_id => {
    return db.query(
        `DELETE FROM signatures
        WHERE user_id = $1`,
        [user_id]
    );
};

// ***************************************
// **********GET COUNT*************
// ***************************************

exports.getCount = () => {
    return db.query(`SELECT COUNT(*) FROM signatures`).then(count => {
        return count.rows[0].count;
    });
};
