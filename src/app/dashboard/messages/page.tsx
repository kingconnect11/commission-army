"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  MessageSquare,
  Send,
  ArrowLeft,
  User,
  Briefcase,
} from "lucide-react";
import {
  getMyConversations,
  getConversation,
  sendMessage,
} from "@/lib/actions/messages";
import { getProfile } from "@/lib/actions/auth";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { formatRelativeTime, getInitials, cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { ReferralStatus, Message } from "@/types";

interface ConversationItem {
  id: string;
  referral_id: string;
  created_at: string;
  referral: {
    id: string;
    status: string;
    lead_name: string;
    offer: { title: string };
    referrer: { id: string; full_name: string; avatar_url: string | null };
    business: { id: string; name: string };
  };
  messages: { content: string; created_at: string; sender_id: string }[];
}

interface MessageWithSender extends Message {
  sender?: { id: string; full_name: string; avatar_url: string | null };
}

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const initialReferral = searchParams.get("referral");

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConvo, setSelectedConvo] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      const [convos, profile] = await Promise.all([
        getMyConversations(),
        getProfile(),
      ]);
      setConversations(convos as unknown as ConversationItem[]);
      setUserId(profile?.id || null);
      setLoading(false);

      // Auto-select conversation if referral param
      if (initialReferral && convos.length > 0) {
        const match = (convos as unknown as ConversationItem[]).find(
          (c) => c.referral_id === initialReferral
        );
        if (match) {
          setSelectedConvo(match.id);
          setMobileShowChat(true);
        }
      }
    }
    load();
  }, [initialReferral]);

  const loadMessages = useCallback(async (convoId: string) => {
    setMessagesLoading(true);
    // Find the referral_id for this conversation
    const convo = conversations.find((c) => c.id === convoId);
    if (!convo) return;

    const data = await getConversation(convo.referral_id);
    if (data) {
      setMessages((data.messages || []) as MessageWithSender[]);
    }
    setMessagesLoading(false);
  }, [conversations]);

  useEffect(() => {
    if (selectedConvo) {
      loadMessages(selectedConvo);
    }
  }, [selectedConvo, loadMessages]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Realtime subscription
  useEffect(() => {
    if (!selectedConvo) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`messages-${selectedConvo}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${selectedConvo}`,
        },
        (payload) => {
          const newMsg = payload.new as Record<string, unknown>;
          if (!newMsg?.id || typeof newMsg.content !== "string") return;
          setMessages((prev) => {
            const m = newMsg as unknown as MessageWithSender;
            if (prev.some((msg) => msg.id === m.id)) return prev;
            return [...prev, m];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConvo]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedConvo || !newMessage.trim()) return;
    setSending(true);

    const result = await sendMessage(selectedConvo, newMessage.trim());
    if (!result.error && result.data) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === result.data!.id)) return prev;
        return [...prev, result.data as MessageWithSender];
      });
      setNewMessage("");
      inputRef.current?.focus();
    }
    setSending(false);
  }

  const selectedConversation = conversations.find(
    (c) => c.id === selectedConvo
  );

  if (loading) {
    return (
      <div className="h-[calc(100vh-8rem)] flex animate-pulse">
        <div className="w-80 bg-surface border-r border-border p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-navy-800 rounded-lg" />
          ))}
        </div>
        <div className="flex-1 bg-navy-950" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No messages yet"
        description="When you submit or receive referrals, you can message the other party here"
        actionLabel="Browse Offers"
        actionHref="/dashboard/offers"
      />
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex rounded-xl overflow-hidden border border-border bg-surface">
      {/* Conversation List */}
      <div
        className={cn(
          "w-full sm:w-80 shrink-0 border-r border-border-subtle overflow-y-auto",
          mobileShowChat ? "hidden sm:block" : "block"
        )}
      >
        <div className="p-4 border-b border-border-subtle">
          <h2 className="text-sm font-semibold text-text-primary font-[family-name:var(--font-display)]">
            Messages
          </h2>
        </div>
        {conversations.map((convo) => {
          const lastMsg = convo.messages?.[convo.messages.length - 1];
          const isSelected = selectedConvo === convo.id;
          return (
            <button
              key={convo.id}
              onClick={() => {
                setSelectedConvo(convo.id);
                setMobileShowChat(true);
              }}
              className={cn(
                "w-full text-left px-4 py-3 border-b border-border-subtle transition-colors",
                isSelected
                  ? "bg-navy-800/60"
                  : "hover:bg-navy-800/30"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-navy-700 flex items-center justify-center shrink-0">
                  <span className="text-xs font-semibold text-navy-200">
                    {getInitials(convo.referral.referrer.full_name)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {convo.referral.lead_name}
                    </p>
                    <StatusBadge
                      status={convo.referral.status as ReferralStatus}
                      className="text-[8px] px-1.5 py-0"
                    />
                  </div>
                  <p className="text-xs text-text-muted truncate">
                    {convo.referral.offer.title}
                  </p>
                  {lastMsg && (
                    <p className="text-xs text-text-muted truncate mt-1">
                      {lastMsg.content}
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Chat Area */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0",
          !mobileShowChat ? "hidden sm:flex" : "flex"
        )}
      >
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="px-4 py-3 border-b border-border-subtle flex items-center gap-3">
              <button
                onClick={() => setMobileShowChat(false)}
                className="sm:hidden btn-ghost p-1"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">
                  {selectedConversation.referral.lead_name}
                </p>
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <User size={10} />
                    {selectedConversation.referral.referrer.full_name}
                  </span>
                  <span>&middot;</span>
                  <span className="flex items-center gap-1">
                    <Briefcase size={10} />
                    {selectedConversation.referral.business.name}
                  </span>
                </div>
              </div>
              <StatusBadge
                status={
                  selectedConversation.referral.status as ReferralStatus
                }
              />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messagesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-5 h-5 border-2 border-navy-600 border-t-crimson-500 rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-sm text-text-muted">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwn = msg.sender_id === userId;
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex",
                        isOwn ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[70%] px-3.5 py-2.5 rounded-xl text-sm",
                          isOwn
                            ? "bg-crimson-700/30 text-text-primary rounded-br-sm"
                            : "bg-navy-800 text-text-secondary rounded-bl-sm"
                        )}
                      >
                        <p className="whitespace-pre-wrap break-words">
                          {msg.content}
                        </p>
                        <p
                          className={cn(
                            "text-[10px] mt-1",
                            isOwn ? "text-crimson-300/60" : "text-text-muted"
                          )}
                        >
                          {formatRelativeTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form
              onSubmit={handleSend}
              className="px-4 py-3 border-t border-border-subtle"
            >
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  maxLength={2000}
                  className="input-field flex-1"
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="btn-primary p-2.5 rounded-lg disabled:opacity-30"
                >
                  {sending ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare
                size={32}
                className="text-navy-600 mx-auto mb-2"
              />
              <p className="text-sm text-text-muted">
                Select a conversation to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
