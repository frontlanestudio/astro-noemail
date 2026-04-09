import type { MiddlewareHandler } from "astro";
import { obfuscateHtmlResponse } from "./index.js";

export const onRequest: MiddlewareHandler = async (_context, next) => {
  const response = await next();
  return obfuscateHtmlResponse(response);
};
