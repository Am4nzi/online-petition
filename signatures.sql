DROP TABLE IF EXISTS signatures CASCADE;

CREATE TABLE signatures (
    id SERIAL primary key,
    sig VARCHAR NOT NULL,
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);
