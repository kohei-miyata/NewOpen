import { createSupabaseServerClient } from "@/lib/supabase-server";
import NavbarClient from "@/components/NavbarClient";

export default async function Navbar() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isOwner = (user?.user_metadata?.role as string) === "owner";

  return (
    <NavbarClient
      user={user ? { email: user.email } : null}
      isOwner={isOwner}
    />
  );
}
