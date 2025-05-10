import express from "express";
import bodyParser from "body-parser";
import pg from 'pg';

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let flag=true;


const db = new pg.Client({
  host: 'localhost',         
  port: 5432,               
  user: 'postgres',
  password: 'Password',
  database: 'World',
});
let a=[];

db.connect();


app.get("/", async (req, res) => {
  a = await db.query('SELECT country_code FROM visited_countries');
  let result=[];
  a.rows.forEach(code => {
    result.push(code.country_code);
});
console.log(a.rows);
res.render("index.ejs", { countries: result , total: result.length});
});
app.post('/add', async (req, res) => {
  const cod = req.body["countryName"];
  console.log('DEBUG: Received code =', cod);

  const result = await db.query(
    'SELECT country_code FROM countries WHERE country_name = $1',
    [cod]
  );

  if (result.rows.length !== 0) {
    const countryCode = result.rows[0].country_code;

    const resultB = await db.query(
      "SELECT * FROM visited_countries WHERE country_code = $1",
      [countryCode]
    );

    if (resultB.rows.length === 0) {
      await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)", [countryCode]);
      res.redirect("/");
    } else {
      const a = await db.query('SELECT country_code FROM visited_countries');
      const result = a.rows.map(row => row.country_code);
      res.render("index.ejs", {
        countries: result,
        total: result.length,
        placeholderMessage: "❌ Country already exists"
      });
    }
  } else {
    const a = await db.query('SELECT country_code FROM visited_countries');
    const result = a.rows.map(row => row.country_code);
    res.render("index.ejs", {
      countries: result,
      total: result.length,
      placeholderMessage: "❌ Country not found"
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
