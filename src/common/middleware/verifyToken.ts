import type { RequestHandler } from "express";
const CryptoJS = require('crypto-js');

import { env } from "@/common/utils/envConfig";
import { ServiceResponse } from "../models/serviceResponse";
import { StatusCodes } from "http-status-codes";
import { handleServiceResponse } from "../utils/httpHandlers";

const secretKey = env.API_SECRET_KEY;

const verifyToken: RequestHandler = (_req, res, next) => {
  const authHeader = _req.headers['authorization'];

  if (!authHeader) {
    return handleServiceResponse(ServiceResponse.failure("UNAUTHORIZED, Please use the extension ONLY, Don't use Postman or So 😅.", null, StatusCodes.UNAUTHORIZED), res)
  }

  const token = authHeader.split(' ')[1]; // Extract the token from the "Bearer" scheme
  const [timestamp, hash] = token.split(':');

  // Calculate the current timestamp and check if the token has expired (e.g., 5 seconds)
  const currentTime = Date.now();
  const tokenValidityDuration = 10000; // 5 seconds

  if (currentTime - parseInt(timestamp, 10) > tokenValidityDuration) {
    return handleServiceResponse(ServiceResponse.failure("Token has expired, Please use the extension ONLY, Don't use Postman or So 😅.", null, StatusCodes.UNAUTHORIZED), res)
  }

  // Recalculate the hash using the received timestamp and compare it with the provided hash
  const message = `${timestamp}:your custom data`;
  const calculatedHash = CryptoJS.HmacSHA256(message, secretKey).toString();

  if (calculatedHash === hash) {
    next(); // Token is valid, proceed to the next middleware or route handler
  } else {
    return handleServiceResponse(ServiceResponse.failure("UNAUTHORIZED, Please use the extension ONLY, Don't use Postman or So 😅.", null, StatusCodes.UNAUTHORIZED), res)
  }
};

export default verifyToken;
