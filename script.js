import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import pkg from "pg";
import dotenv from "dotenv";
import { Client } from "pg";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = 3000;

// read env files
// In ES modules __dirname is not defined. Create it from import.meta.url.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV !== "production") {
  dotenv.config({
    override: true, // overrides any other env files
    path: path.join(__dirname, "dev.env"),
  });
}
console.log("DATABASE_URL:", process.env.DATABASE_URL);

// dotenv.config();

// CORS allows your front-end app (running on a different port) to make API calls to your back-end
// app.use(cors({ origin: 'http://localhost:5173' }))

// connect to postgres
const { Pool } = pkg;

// const pool = new Pool({
//   user: process.env.DBUSER,
//   host: process.env.HOST,
//   database: process.env.DATABASE,
//   password: process.env.PASSWORD,
//   port: process.env.PORT,
// });
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

app.use((req, res, next) => {
  console.log("Time:", Date.now());
  next();
});

app.use(cookieParser());

// By default, Express does not automatically read JSON bodies. You need to add a middleware to handle this.
// This allows you to access data sent in the body of a POST or PUT request via req.body.
app.use(express.json());
app.use(express.static("public"));

app.get("/set-cookie", (req, res) => {
  // cookie-parser library used to set cookies. Used to store things such as session information
  res.cookie("theme", "dark");
  res.send("Cookie set");
});

app.get("/read-cookie", (req, res) => {
  res.send(`Theme: ${req.cookies.theme}`);
});

app.get("/moons", async (req, res) => {
  // gets list of moon names from database
  try {
    const moonTable = await pool.query("SELECT * FROM moons");
    const moons = moonTable.rows;
    res.send(moons);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/moons/:name", async (req, res) => {
  const name = req.params.name;

  // validation to avoid overly long or empty values.
  if (
    typeof name !== "string" ||
    name.trim().length === 0 ||
    name.length > 100
  ) {
    return res.status(400).json({ error: "Invalid moon name" });
  }

  try {
    // Use parameterized query to prevent SQL injection.
    const moonTable = await pool.query(
      "SELECT * FROM moons WHERE name ILIKE $1",
      [name],
    );
    if (moonTable.rows.length === 0) {
      return res.status(404).json({ error: "Moon not found" });
    }

    return res.json(moonTable.rows[0]);
  } catch (err) {
    console.error("Database error in /moons/:name", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/missions", async (req, res) => {
  // gets list of moon names from database
  try {
    const moonTable = await pool.query("SELECT * FROM missions");
    const moons = moonTable.rows;
    res.send(moons);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/planets", async (req, res) => {
  try {
    const planets = await pool.query("SELECT * FROM planets");
    const planetsData = planets.rows;
    res.send(planetsData);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/planets/:id", async (req, res) => {
  try {
    const planetId = parseInt(req.params.id);
    if (Number.isNaN(planetId)) {
      return res.status(400).json({ error: "Invalid planet id" });
    }
    const planets = await pool.query("SELECT * FROM planets WHERE id = $1", [planetId]);
    const planetsData = planets.rows;
    res.json(planetsData);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/planets/:id/moons", async (req, res) => {
  try {
    const planetId = parseInt(req.params.id);
    if (Number.isNaN(planetId)) {
      return res.status(400).json({ error: "Invalid planet id" });
    }

    const q = `
      SELECT
        m.name AS moon,
        p.name AS planet
      FROM
        moons AS m
      JOIN
        planets AS p
      ON
        m.planet_id = p.id
      WHERE
        p.id = $1
    `;
    const result = await pool.query(q, [planetId]);
    res.send(result.rows);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/planets", async (req, res) => {
  try {
    const planet = req.body;
    const addPlanet = await pool.query(
      'INSERT INTO planets (name, discovered_at) VALUES ($1, $2) RETURNING *',
      [planet.name, planet.discovered_at]
    );
    res.status(201).json({ message: "Planet created", planet: addPlanet.rows[0] });
  } catch (error) {
    console.error("Error creating planet:", error);
    res.status(500).json({ error: "Internal server error" });
  }
  
});

// always use try catch. In industry, you should log errors using a loggin service such as Sentry
app.get("/data", async (req, res) => {
  try {
    const data = await fetchDataFromDatabase();
    res.json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// http://localhost:3000/greet?name=amro
app.get("/greet", (req, res) => {
  const name = req.query.name || "visitor";
  res.send(`Hello, ${name}`);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
