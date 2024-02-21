import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <section className="flex justify-center items-center min-h-screen">
      <SignUp />
    </section>
  );
}
