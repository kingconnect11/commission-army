"use server";

import { createClient } from "@/lib/supabase/server";
import type { BusinessInsert } from "@/types";

export async function createBusiness(data: BusinessInsert) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { data: business, error } = await supabase
    .from("businesses")
    .insert({ ...data, owner_id: user.id })
    .select()
    .single();

  if (error) return { error: error.message };
  return { data: business };
}

export async function getMyBusinesses() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getBusinessById(businessId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("businesses")
    .select(
      `
      *,
      offers(*)
    `
    )
    .eq("id", businessId)
    .eq("is_active", true)
    .single();

  return data;
}

export async function updateBusiness(
  businessId: string,
  data: Partial<BusinessInsert>
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("businesses")
    .update(data)
    .eq("id", businessId)
    .eq("owner_id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}
