-- One row per (KST day, item, client): how many times /r/<item>.json was fetched.
CREATE TABLE installs (
  day TEXT NOT NULL,
  item TEXT NOT NULL,
  client TEXT NOT NULL,
  n INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, item, client)
);
