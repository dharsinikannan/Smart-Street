CREATE DATABASE smartstreet;

\c smartstreet;

CREATE TABLE vendors (
  id SERIAL PRIMARY KEY,
  name TEXT,
  phone TEXT,
  business_type TEXT
);

CREATE TABLE slots (
  id SERIAL PRIMARY KEY,
  zone TEXT,
  time TEXT,
  is_booked BOOLEAN DEFAULT false
);

INSERT INTO slots (zone, time)
VALUES
('Market Street', '9 AM - 1 PM'),
('Bus Stand', '4 PM - 9 PM'),
('Railway Station', '6 AM - 12 PM');
