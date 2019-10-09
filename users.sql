DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id SERIAL primary key,
    fname VARCHAR(40) NOT NULL CHECK (fname != ''),
    lname VARCHAR(40) NOT NULL CHECK (lname != ''),
    email VARCHAR(80) NOT NULL UNIQUE CHECK (email != ''),
    password VARCHAR(100) NOT NULL CHECK (password != ''),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);
