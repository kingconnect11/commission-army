"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { ProfileUpdate } from "@/types";

export async function signUpWithEmail(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    return {
      error:
        error.message.toLowerCase().includes("invalid api key") ||
        error.message.toLowerCase().includes("invalid key")
          ? "Server configuration error: Supabase credentials are missing or invalid. Check .env.local and use the anon (public) or Publishable key from Supabase Dashboard > Project Settings > API."
          : error.message,
    };
  }

  return { success: true, message: "Check your email for a confirmation link." };
}

export async function signInWithEmail(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = formData.get("redirect") as string | null;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const msg = error.message.toLowerCase();
    return {
      error:
        msg.includes("invalid api key") || msg.includes("invalid key")
          ? "Server configuration error: Supabase credentials are missing or invalid. Check .env.local and use the anon (public) or Publishable key from Supabase Dashboard > Project Settings > API."
          : error.message,
    };
  }

  // Validate redirect is a same-origin path (no protocol or host)
  const path =
    redirectTo &&
    typeof redirectTo === "string" &&
    redirectTo.startsWith("/") &&
    !redirectTo.startsWith("//")
      ? redirectTo
      : "/dashboard";
  redirect(path);
}

export async function signInWithOAuth(
  provider: "google" | "linkedin_oidc",
  redirectPath?: string | null
) {
  const supabase = await createClient();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const callbackUrl =
    redirectPath &&
    redirectPath.startsWith("/") &&
    !redirectPath.startsWith("//")
      ? `${baseUrl}/auth/callback?next=${encodeURIComponent(redirectPath)}`
      : `${baseUrl}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: callbackUrl,
    },
  });

  if (error) {
    const msg = error.message.toLowerCase();
    return {
      error:
        msg.includes("invalid api key") || msg.includes("invalid key")
          ? "Server configuration error: Supabase credentials are missing or invalid. Check .env.local and use the anon (public) or Publishable key from Supabase Dashboard > Project Settings > API."
          : error.message,
    };
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function updateProfile(data: ProfileUpdate) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("profiles")
    .update(data)
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function getProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return data;
}
