CREATE TABLE book(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  author TEXT,
  price INTEGER,
  pages INTEGER
);

INSERT INTO book(title, author, price, pages) VALUES
('The Alchemist','Paulo Coelho',350,208),
('Wings of Fire','A. P. J. Abdul Kalam',299,180),
('Atomic Habits','James Clear',499,320),
('The God of Small Things','Arundhati Roy',420,340),
('Malgudi Days','R. K. Narayan',250,256),
('Train to Pakistan','Khushwant Singh',275,192),
('The White Tiger','Aravind Adiga',380,304),
('Godan','Munshi Premchand',225,334),
('Deep Work','Cal Newport',450,296),
('Ikigai','Hector Garcia',320,208);
