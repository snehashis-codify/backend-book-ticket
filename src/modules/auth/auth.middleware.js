import pool from "../../../index.mjs";
import ApiError from "../../common/util/api-error";
import AuthService from "./auth.service";

const authenticate = async (req, res, next) => {
  const bearerToken = req.headers["Authorization"];
  if (!bearerToken) throw ApiError.Unauthorized("Missing token");
  const token = bearerToken.split("Bearer ")[1];
  if (!token) throw ApiError.Unauthorized("Missing token");
  const decoded = new AuthService().verifyAccessToken(token);
  if (!decoded) throw ApiError.Unauthorized("Invalid token");
  const connection = await pool.connect();
  const user = await connection.query(
    "SELECT user_id,name,email FROM users WHERE user_id=$1",
    [decoded.id],
  );
  if (user.rowCount <= 0) throw ApiError.Notfound("User not found");
  const userObject = user.rows[0];
  req.user = userObject;
  connection.release();
  next();
};

export default authenticate;
