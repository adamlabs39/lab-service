import JwtHelper from "../helpers/jwt-helper.js";
import AuthenticationService from "../services/authentication-service.js";

const authorizationMiddleware = async (request, response, nextFunction) => {
  try {
    const ignoreUrl = ["/v1/login", "/v1/register"]; // url yang
    if (ignoreUrl.includes(request.originalUrl)) nextFunction();
    const BEARER_TOKEN = request.get("Authorization");
    if (!BEARER_TOKEN) {
      response.status(401).json({ message: `silakan login terlebih dahulu!` });
    } else {
      const token = BEARER_TOKEN.substring(7);
      const isTokenValid = await JwtHelper.verify(token);
      if (!isTokenValid)
        response
          .status(401)
          .json({ message: "token tidak valid, silakan login kembali!" });
      request.author = isTokenValid;
      const user = await AuthenticationService.isTokenExist(
        isTokenValid.username
      );

      if (!user)
        response
          .status(401)
          .json({ message: `tokenn tidak valid, silakan login kembali` });

      response.locals.jwtData = isTokenValid;
      nextFunction();
    }
  } catch (error) {
    // throw error;
    response.status(500).json({ message: error.message });
  }
};
export default authorizationMiddleware;
