import pool from "../../../index.mjs";
import ApiError from "../../common/util/api-error.js";
import AuthService from "./auth.service.js";

const authenticate = async (req, res, next) => {
 try {
   const bearerToken = req.headers["authorization"];
   console.log(bearerToken,"BEARRR")
   if (!bearerToken) throw ApiError.Unauthorized("Missing token");
   const token = bearerToken.split("Bearer ")[1];
   if (!token) throw ApiError.Unauthorized("Missing token");
   const decoded = new AuthService().verifyAccessToken(token);
   console.log("YUI",decoded)
   if (!decoded) throw ApiError.Unauthorized("Invalid token");
   const connection = await pool.connect();
   const user = await connection.query(
     "SELECT user_id,name,email FROM users WHERE user_id=$1",
     [decoded.id],
   );
   console.log("USER",user.rows)
   if (user.rowCount <= 0) throw ApiError.Notfound("User not found");
   const userObject = user.rows[0];
   req.user = userObject;
   connection.release();
   next();
 } catch (error) {
  next(error)
 }
};

export default authenticate;
