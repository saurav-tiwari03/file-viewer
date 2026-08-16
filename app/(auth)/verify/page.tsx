import { redirect } from "next/navigation";
import { VerifyForm } from "@/components/auth/verify-form";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  if (!email) redirect("/login");

  return (
    <div className="flex min-h-dvh items-center justify-center bg-linear-to-br from-primary/10 via-background to-primary/5 p-6">
      <VerifyForm email={email} />
    </div>
  );
}
