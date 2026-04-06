import { createSupabaseServerClient } from "@/lib/supabase-server";
import NavbarClient from "@/components/NavbarClient";

export default async function Navbar() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role as string | undefined;
  const isOwner = role === "owner";
  const isAdmin = role === "admin";
  const isGeneral = !!user && !isOwner && !isAdmin;

  return (
    <NavbarClient
      user={user ? { email: user.email } : null}
      isOwner={isOwner}
      isAdmin={isAdmin}
      isGeneral={isGeneral}
    />
  );
}
