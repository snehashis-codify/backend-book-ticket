import pool from "../../../index.mjs";

const checkDB = async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Connected to DB");

    client.release(); // VERY IMPORTANT
  } catch (err) {
    console.error("❌ Connection failed:", err);
  }
};
export default checkDB;
