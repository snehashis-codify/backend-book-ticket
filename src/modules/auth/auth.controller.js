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
      ApiResponse.ok(res, "User login successfully", result);
    } catch (error) {
      next(error);
    }
  }
  async refreshAccessTokenController(req, res, next) {
    try {
      const result = await authService.refreshAccessTokenService(
        req.params.token,
      );
      ApiResponse.ok(res, "Token generated successfully", result);
    } catch (error) {
      next(error);
    }
  }
  getMeController(req,res,next) {
    
  }
}
export default AuthController;
