import { SignIn } from "@clerk/nextjs";

// I use this optional route so Clerk can handle every step of signing in.
export default function SignInPage() {
  return <SignIn />;
}
