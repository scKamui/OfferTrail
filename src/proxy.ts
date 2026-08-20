import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// I leave the landing and sign-in pages public and protect the job application pages.
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/applications(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) {
    await auth.protect();
  }
});

// I skip the Clerk check for images and other public files.
export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    // I include Clerk's internal path so its authentication requests always reach the middleware.
    "/__clerk/(.*)",
  ],
};
