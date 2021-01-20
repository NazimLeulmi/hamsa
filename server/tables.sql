create table users(
  id INT AUTO_INCREMENT,
  name VARCHAR(25) NOT NULL,
  email VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  public_key TEXT NOT NULL,
  activated TINYINT(1) NOT NULL DEFAULT 0,
  activision_token VARCHAR(96) UNIQUE,
  created DATETIME, 
  PRIMARY KEY(user_id)
); 
create table rooms( 
  id INT AUTO_INCREMENT,
  name VARCHAR(25) NOT NULL,
  admin INT NOT NULL,
  created DATETIME,
  PRIMARY KEY(id),
  FOREIGN KEY(admin) REFERENCES users(id) ON DELETE CASCADE
);
create table user_rooms( 
  id INT AUTO_INCREMENT, 
  user INT NOT NULL,
  room INT NOT NULL,
  created DATETIME,
  PRIMARY KEY(id),
  FOREIGN KEY(user) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(room) REFERENCES rooms(id) ON DELETE CASCADE
);
create table messages( 
  id INT AUTO_INCREMENT, 
  room INT NOT NULL, 
  author INT NOT NULL,
  image TINYINT(1) DEFAULT 0, 
  created DATETIME, 
  PRIMARY KEY(id), 
  FOREIGN KEY(room) REFERENCES rooms(id) ON DELETE CASCADE, 
  FOREIGN KEY(author) REFERENCES users(id) ON DELETE CASCADE
);
