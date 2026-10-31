const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const dbPath = path.join(__dirname, process.env.DB_PATH || "books.db");

let db = null;

// Open the database first, start the server only after the connection succeeds.
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// Validate a book body; returns an error message or null.
const validateBook = (body) => {
  const { title, author, price, pages } = body || {};
  if (typeof title !== "string" || title.trim() === "") {
    return "title is required and must be a non-empty string";
  }
  if (typeof author !== "string" || author.trim() === "") {
    return "author is required and must be a non-empty string";
  }
  if (!Number.isInteger(price) || price < 0) {
    return "price is required and must be a non-negative integer";
  }
  if (!Number.isInteger(pages) || pages <= 0) {
    return "pages is required and must be a positive integer";
  }
  return null;
};

// Validate :bookId as a positive integer.
const isValidId = (id) => /^\d+$/.test(id) && Number(id) > 0;

// 1. GET all books
app.get("/books/", async (request, response) => {
  try {
    const books = await db.all(`SELECT * FROM book ORDER BY id;`);
    response.status(200).send(books);
  } catch (error) {
    response.status(500).send({ error: "Internal server error" });
  }
});

// 2. GET one book
app.get("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  if (!isValidId(bookId)) {
    return response.status(400).send({ error: "Invalid book id" });
  }
  try {
    const book = await db.get(`SELECT * FROM book WHERE id = ?;`, [bookId]);
    if (book === undefined) {
      return response.status(404).send({ error: "Book not found" });
    }
    response.status(200).send(book);
  } catch (error) {
    response.status(500).send({ error: "Internal server error" });
  }
});

// 3. POST add a book
app.post("/books/", async (request, response) => {
  const errorMessage = validateBook(request.body);
  if (errorMessage) {
    return response.status(400).send({ error: errorMessage });
  }
  const { title, author, price, pages } = request.body;
  try {
    const result = await db.run(
      `INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?);`,
      [title.trim(), author.trim(), price, pages]
    );
    response.status(201).send({ bookId: result.lastID, message: "Book added successfully" });
  } catch (error) {
    response.status(500).send({ error: "Internal server error" });
  }
});

// 4. PUT update a book
app.put("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  if (!isValidId(bookId)) {
    return response.status(400).send({ error: "Invalid book id" });
  }
  const errorMessage = validateBook(request.body);
  if (errorMessage) {
    return response.status(400).send({ error: errorMessage });
  }
  const { title, author, price, pages } = request.body;
  try {
    const result = await db.run(
      `UPDATE book SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?;`,
      [title.trim(), author.trim(), price, pages, bookId]
    );
    if (result.changes === 0) {
      return response.status(404).send({ error: "Book not found" });
    }
    response.status(200).send({ message: "Book updated successfully" });
  } catch (error) {
    response.status(500).send({ error: "Internal server error" });
  }
});

// 5. DELETE a book
app.delete("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  if (!isValidId(bookId)) {
    return response.status(400).send({ error: "Invalid book id" });
  }
  try {
    const result = await db.run(`DELETE FROM book WHERE id = ?;`, [bookId]);
    if (result.changes === 0) {
      return response.status(404).send({ error: "Book not found" });
    }
    response.status(200).send({ message: "Book deleted successfully" });
  } catch (error) {
    response.status(500).send({ error: "Internal server error" });
  }
});

module.exports = app;
