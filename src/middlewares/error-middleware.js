import BadRequestException from "../exception/bad-request-exception.js";
import InternalServerException from "../exception/internal-server-exception.js";
import NotfoundException from "../exception/notfound-exception.js";

const errorMiddleware = (error, request, response, nextFunction) => {
  if (error instanceof NotfoundException) {
    response.status(error.code).json({ message: error.message });
  }else if (error instanceof BadRequestException){
    response.status(error.code).json({ message: error.message });
  }else if (error instanceof InternalServerException){
    response.status(error.code).json({ message: error.message });
  }
};

export default errorMiddleware;