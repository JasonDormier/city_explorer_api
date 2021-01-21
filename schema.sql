DROP TABLE place;
CREATE TABLE place(
  id SERIAL PRIMARY KEY,
  search_query VARCHAR(255),
  formatted_query VARCHAR(255),
  longitude DECIMAL,
  latitude DECIMAL
)