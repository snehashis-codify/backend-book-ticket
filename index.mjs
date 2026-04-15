//  CREATE TABLE seats (
//      id SERIAL PRIMARY KEY,
//      name VARCHAR(255),
//      isbooked INT DEFAULT 0
//  );
// INSERT INTO seats (isbooked)
// SELECT 0 FROM generate_series(1, 20);
import "dotenv/config";
import express from "express";
import pg from "pg";
import { dirname } from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import authRouter from "./src/modules/auth/auth.routes.js";
import cookieParser from "cookie-parser";
import globalErrorMiddleware from "./src/common/middlewares/error.middleware.js";
import authenticate from "./src/modules/auth/auth.middleware.js";
import ApiError from "./src/common/util/api-error.js";
import ApiResponse from "./src/common/util/api-response.js";
const __dirname = dirname(fileURLToPath(import.meta.url));

const port = process.env.PORT || 8080;

// Equivalent to mongoose connection
// Pool is nothing but group of connections
// If you pick one connection out of the pool and release it
// the pooler will keep that connection open for sometime to other clients to reuse
const pool = new pg.Pool({
  host: "127.0.0.1",
  port: 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 20,
  connectionTimeoutMillis: 0,
  idleTimeoutMillis: 0,
});

const app = new express();
app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
app.use("/api/auth", authRouter);
//get all seats
app.get("/seats", async (req, res) => {
  const result = await pool.query("select * from seats"); // equivalent to Seats.find() in mongoose
  res.send(result.rows);
});

//book a seat give the seatId and your name

app.put("/:id/:name", authenticate, async (req, res,next) => {
  try {
    const id = req.params.id;
    const name = req.params.name;
    const { email } = req.user;
    // payment integration should be here
    // verify payment
    const conn = await pool.connect(); // pick a connection from the pool
    const isUserExist = await conn.query(
      "SELECT * FROM users WHERE name=$1 AND email=$2",
      [name, email],
    );
    if (isUserExist.rowCount <=0 ) throw ApiError.Notfound("User not found");
    //begin transaction
    // KEEP THE TRANSACTION AS SMALL AS POSSIBLE
    await conn.query("BEGIN");
    //getting the row to make sure it is not booked
    /// $1 is a variable which we are passing in the array as the second parameter of query function,
    // Why do we use $1? -> this is to avoid SQL INJECTION
    // (If you do ${id} directly in the query string,
    // then it can be manipulated by the user to execute malicious SQL code)
    const sql = "SELECT * FROM seats where id = $1 and isbooked = 0 FOR UPDATE";
    const result = await conn.query(sql, [id]);

    //if no rows found then the operation should fail can't book
    // This shows we Do not have the current seat available for booking
    if (result.rowCount === 0) {
      conn.query("ROLLBACK")
      throw ApiError.Conflict("Seat already booked");
    }
    //if we get the row, we are safe to update
    const sqlU = "update seats set isbooked = 1, name = $2 where id = $1 RETURNING name,id";
    const updateResult = await conn.query(sqlU, [id, name]); // Again to avoid SQL INJECTION we are using $1 and $2 as placeholders

    //end transaction by committing
    await conn.query("COMMIT");
    conn.release(); // release the connection back to the pool (so we do not keep the connection open unnecessarily)
    ApiResponse.ok(res, "Seat booked successfully", updateResult.rows);
    // res.send(updateResult);
  } catch (ex) {
    // console.log(ex);
    // res.send(500);
    
    next(ex)
  }
});
try {
  const client = await pool.connect();
  console.log("✅ Connected to DB");

  client.release(); // VERY IMPORTANT
} catch (err) {
  console.error("❌ Connection failed:", err);
}
app.use(globalErrorMiddleware);
app.listen(port, () => console.log("Server starting on port: " + port));
export default pool;
