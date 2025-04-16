import AuthorizationSdkException from "@adameds/authorization-sdk/sdkException";
import BadRequestException from "../exception/bad-request-exception.js";
import ConflictException from "../exception/conflict-exception.js";
import InternalServerException from "../exception/internal-server-exception.js";
import NotfoundException from "../exception/notfound-exception.js";
import errorResponse from "../response/error-response.js";

const errorMiddleware = (error, request, response, nextFunction) => {
  if (error instanceof NotfoundException) {
    return response.status(error.code).json(errorResponse(error.message));
  } else if (error instanceof BadRequestException) {
    return response.status(error.code).json(errorResponse(error.message));
  
  }else if (error instanceof AuthorizationSdkException) {
    return response.status(error.code).json(errorResponse(error.message));

  } else if (error instanceof ConflictException) {
    return response.status(error.code).json(errorResponse(error.message));
  } else if (error instanceof InternalServerException) {
    return response
      .status(error.code)
      .json(errorResponse("Internal Server Error"));
  } else {
    console.log(error);
    return response.status(500).json(errorResponse("Internal Server Error"));
  }
};

export default errorMiddleware;
