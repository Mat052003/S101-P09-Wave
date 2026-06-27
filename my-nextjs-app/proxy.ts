import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const proxy = createMiddleware(routing);
export default proxy;

export const config = {
  matcher: ['/', '/(es|en)/:path*', '/((?!api|_next|.*\\..*).*)'],
};
