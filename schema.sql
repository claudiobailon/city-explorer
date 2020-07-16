DROP TABLE IF EXISTS locationtable;

CREATE TABLE locationtable (
  id SERIAL PRIMARY KEY,
  search_query VARCHAR(255),
  formatted_query VARCHAR(255),
  latitude INTEGER NOT NULL,
  longitude INTEGER NOT NULL
);


