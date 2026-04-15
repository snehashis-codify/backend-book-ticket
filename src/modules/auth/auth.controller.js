import ApiResponse from "../../common/util/api-response.js";
import AuthService from "./auth.service.js";
const authService = new AuthService();
class AuthController {
  async registerController(req, res, next) {
    try {
      const result = await authService.registerService(req.body);
      ApiResponse.created(res, "User registered successfully", result);
    } catch (error) {
      next(error);
    }
  }
  async loginController(req, res, next) {
    try {
      const result = await authService.loginService(req.body);
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      ApiResponse.ok(res, "User login successfully", result);
    } catch (error) {
      next(error);
    }
  }
  async refreshAccessTokenController(req, res, next) {
    try {
      const token = req.cookies.refreshToken;
      const result = await authService.refreshAccessTokenService(token);
      ApiResponse.ok(res, "Token generated successfully", result);
    } catch (error) {
      next(error);
    }
  }
}
export default AuthController;
