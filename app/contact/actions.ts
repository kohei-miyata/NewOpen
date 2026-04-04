"use server";

import { redirect } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";

export async function submitContact(formData: FormData) {
  const name       = (formData.get("name")       as string).trim();
  const email      = (formData.get("email")      as string).trim();
  const message    = (formData.get("message")    as string).trim();
  const company    = (formData.get("company")    as string).trim() || null;
  const department = (formData.get("department") as string).trim() || null;

  if (!name || !email || !message) {
    redirect("/contact?error=missing");
  }

  if (name.length > 100) redirect("/contact?error=missing");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) redirect("/contact?error=missing");
  if (message.length < 10 || message.length > 5000) redirect("/contact?error=missing");
  if ((company ?? "").length > 200) redirect("/contact?error=missing");
  if ((department ?? "").length > 200) redirect("/contact?error=missing");

  const { error } = await getSupabaseClient()
    .from("contacts")
    .insert({ name, email, message, company, department });

  if (error) redirect(`/contact?error=${encodeURIComponent(error.message)}`);
  redirect("/contact?success=1");
}
