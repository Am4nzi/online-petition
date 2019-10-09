DROP TABLE IF EXISTS userprofiles CASCADE;
CREATE TABLE userprofiles(
    id SERIAL PRIMARY KEY,
    age INT,
    city VARCHAR(100),
    url VARCHAR(300),
    user_id INT REFERENCES users(id) NOT NULL UNIQUE
);
