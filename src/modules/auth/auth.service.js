import pool from "../../../index.mjs";
import ApiError from "../../common/util/api-error.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
class AuthService {
  async registerService({ name, email, password }) {
    const connection = await pool.connect();
    const isEmailExist = await connection.query(
      "SELECT * FROM users WHERE email=$1",
      [email],
    );
    if (isEmailExist.rowCount > 0) {
      throw ApiError.Conflict("Email Id already exists");
    }
    const hashedPassword = await this.#hashPassword(password);
    const user = await connection.query(
      "INSERT INTO users(name,email,password) VALUES($1,$2,$3)  RETURNING user_id,name, email",
      [name, email, hashedPassword],
    );
    connection.release();
    return user.rows[0];
  }

  async loginService({ email, password }) {
    const connection = await pool.connect();
    const isEmailValid = await connection.query(
      "SELECT * FROM users WHERE email=$1",
      [email],
    );
    if (isEmailValid.rowCount <= 0) {
      throw ApiError.Conflict("Email Id not found");
    }
    const { user_id, name, password: hashedPassword } = isEmailValid.rows[0];
    const isCorrectPassword = await this.#comparePassword(
      password,
      hashedPassword,
    );
    if (!isCorrectPassword) {
      throw ApiError.Conflict("Email Id or password is incorrect");
    }
    const accessToken = this.#generateAccessToken({ id: user_id, name, email });
    const refreshToken = this.#generateRefreshToken({ id: user_id });
    const hashedToken = this.hashToken(refreshToken);
    await connection.query(
      "UPDATE users SET refresh_token=$1 WHERE email=$2 AND user_id=$3",
      [hashedToken, email, user_id],
    );
    const userData = isEmailValid.rows[0];
    delete userData.password;
    delete userData.refresh_token;
    connection.release();
    return { ...userData, refreshToken, accessToken };
  }
  async #hashPassword(cleanPassword) {
    return await bcrypt.hash(cleanPassword, 10);
  }
  async #comparePassword(cleanPassword, hashedPassword) {
    return await bcrypt.compare(cleanPassword, hashedPassword);
  }
  #generateAccessToken(payload) {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY ?? "15m",
    });
  }
  #generateRefreshToken(payload) {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY ?? "7d",
    });
  }
  async #generateNewAccessToken(token) {}
  hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
  }
}

export default AuthService;
