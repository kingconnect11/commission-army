"use server";

import { createClient } from "@/lib/supabase/server";
import type { OfferInsert, OfferWithBusiness } from "@/types";

export async function createOffer(data: OfferInsert) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Verify user owns this business
  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("id", data.business_id)
    .eq("owner_id", user.id)
    .single();

  if (!business) return { error: "Business not found or not owned by you" };

  // Validate fee structure
  if (data.fee_type === "flat" && (!data.flat_fee || data.flat_fee < 10)) {
    return { error: "Flat fee must be at least $10" };
  }
  if (
    (data.fee_type === "percentage" || data.fee_type === "flat_plus_percentage") &&
    (!data.percentage_fee || data.percentage_fee <= 0)
  ) {
    return { error: "Percentage fee must be greater than 0" };
  }

  const { data: offer, error } = await supabase
    .from("offers")
    .insert(data)
    .select()
    .single();

  if (error) return { error: error.message };
  return { data: offer };
}

export type OfferSortOption = "newest" | "highest_fee" | "most_views";

export async function getActiveOffers(params?: {
  category?: string;
  city?: string;
  state?: string;
  search?: string;
  sort?: OfferSortOption;
  limit?: number;
  offset?: number;
}): Promise<{ data: OfferWithBusiness[]; count: number }> {
  const supabase = await createClient();

  // Determine order column
  const sort = params?.sort ?? "newest";
  const orderColumn =
    sort === "most_views"
      ? "views_count"
      : sort === "highest_fee"
      ? "flat_fee"
      : "created_at";

  let query = supabase
    .from("offers")
    .select(
      `
      *,
      business:businesses!inner(id, name, category, city, state, logo_url)
    `,
      { count: "exact" }
    )
    .eq("is_active", true)
    .eq("businesses.is_active", true)
    .order(orderColumn, { ascending: false, nullsFirst: false });

  if (params?.category) {
    query = query.eq("businesses.category", params.category);
  }
  if (params?.city) {
    query = query.eq("businesses.city", params.city);
  }
  if (params?.state) {
    query = query.eq("businesses.state", params.state);
  }
  if (params?.search) {
    query = query.textSearch("fts", params.search);
  }

  const limit = params?.limit ?? 20;
  const offset = params?.offset ?? 0;
  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error("Error fetching offers:", error);
    return { data: [], count: 0 };
  }

  return {
    data: (data as unknown as OfferWithBusiness[]) ?? [],
    count: count ?? 0,
  };
}

export async function getOfferById(offerId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("offers")
    .select(
      `
      *,
      business:businesses(*)
    `
    )
    .eq("id", offerId)
    .single();

  if (error) return null;

  // Increment view count (fire and forget)
  supabase
    .from("offers")
    .update({ views_count: (data.views_count ?? 0) + 1 })
    .eq("id", offerId)
    .then(() => {});

  return data;
}

export async function getMyOffers() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("offers")
    .select(
      `
      *,
      business:businesses!inner(id, name, category, city, state)
    `
    )
    .eq("businesses.owner_id", user.id)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function toggleOfferActive(offerId: string) {
  const supabase = await createClient();

  // Get current state
  const { data: offer } = await supabase
    .from("offers")
    .select("is_active")
    .eq("id", offerId)
    .single();

  if (!offer) return { error: "Offer not found" };

  const { error } = await supabase
    .from("offers")
    .update({ is_active: !offer.is_active })
    .eq("id", offerId);

  if (error) return { error: error.message };
  return { success: true };
}
