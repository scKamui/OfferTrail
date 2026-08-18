import { SignUp } from "@clerk/nextjs";

// I use Clerk here to handle validation, password safety, and sign-up options.
export default function SignUpPage() {
  return <SignUp />;
}
