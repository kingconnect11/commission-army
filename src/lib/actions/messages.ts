"use server";

import { createClient } from "@/lib/supabase/server";
import type { Message, ConversationWithMessages } from "@/types";

/**
 * Get the conversation for a specific referral.
 * Returns conversation with all messages.
 */
export async function getConversation(
  referralId: string
): Promise<ConversationWithMessages | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: conversation } = await supabase
    .from("conversations")
    .select(
      `
      *,
      messages(*, sender:profiles(id, full_name, avatar_url)),
      referral:referrals(id, status, lead_name)
    `
    )
    .eq("referral_id", referralId)
    .single();

  if (!conversation) return null;

  return conversation as unknown as ConversationWithMessages;
}

/**
 * Send a message in a referral conversation.
 */
export async function sendMessage(conversationId: string, content: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  if (!content.trim()) return { error: "Message cannot be empty" };
  if (content.length > 2000) return { error: "Message too long (max 2000 chars)" };

  const { data: message, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: content.trim(),
    })
    .select()
    .single();

  if (error) return { error: error.message };
  return { data: message as unknown as Message };
}

/**
 * Get conversations list for a user (all their referral conversations).
 */
export async function getMyConversations() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  // Get all referrals where user is either the referrer or business owner
  const { data: asReferrer } = await supabase
    .from("referrals")
    .select("id")
    .eq("referrer_id", user.id);

  const { data: myBusinesses } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id);

  const businessIds = (myBusinesses ?? []).map((b) => b.id);

  const { data: asBusiness } = businessIds.length
    ? await supabase
        .from("referrals")
        .select("id")
        .in("business_id", businessIds)
    : { data: [] };

  const allReferralIds = [
    ...(asReferrer ?? []).map((r) => r.id),
    ...(asBusiness ?? []).map((r) => r.id),
  ];

  if (allReferralIds.length === 0) return [];

  const { data: conversations } = await supabase
    .from("conversations")
    .select(
      `
      *,
      referral:referrals(
        id, status, lead_name,
        offer:offers(title),
        referrer:profiles(id, full_name, avatar_url),
        business:businesses(id, name)
      ),
      messages(content, created_at, sender_id)
    `
    )
    .in("referral_id", allReferralIds)
    .order("created_at", { ascending: false });

  return conversations ?? [];
}
