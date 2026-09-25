"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getConnections, getConversation, sendMessage } from "@/features/network/services/networkApi";
import type { Connection, DirectMessage } from "@/features/network/types/network.types";

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const selectedUserId = searchParams.get("userId") || "";
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");
  const [sendError, setSendError] = useState("");

  const connectionsQuery = useQuery({
    queryKey: ["connections"],
    queryFn: getConnections,
  });
  const connections = (connectionsQuery.data ?? []) as Connection[];
  const selectedConnection = connections.find(({ user }) => user.id === selectedUserId) ?? connections[0];
  const conversationUserId = selectedConnection?.user.id || "";

  const messagesQuery = useQuery({
    queryKey: ["conversation", conversationUserId],
    queryFn: () => getConversation(conversationUserId),
    enabled: Boolean(conversationUserId),
  });
  const messages = (messagesQuery.data ?? []) as DirectMessage[];

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!conversationUserId || !draft.trim()) return;

    setSendError("");
    try {
      await sendMessage(conversationUserId, draft);
      setDraft("");
      await queryClient.invalidateQueries({ queryKey: ["conversation", conversationUserId] });
    } catch (error) {
      setSendError(error instanceof Error ? error.message : "Unable to send message.");
    }
  };

  return (
    <div className="space-y-5">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold text-[#1D2226]">Messages</h1>
        <p className="mt-1 text-sm text-[#666666]">Message your professional connections.</p>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <Card className="p-4">
          <h2 className="px-2 text-sm font-semibold text-[#1D2226]">Connections</h2>
          <div className="mt-3 space-y-1">
            {connections.map(({ user }) => (
              <Link
                key={user.id}
                href={`/messages?userId=${encodeURIComponent(user.id)}`}
                className={`block rounded-md p-3 ${
                  user.id === conversationUserId ? "bg-[#E8F3FF]" : "hover:bg-[#F8F9FA]"
                }`}
              >
                <p className="text-sm font-semibold text-[#1D2226]">
                  {user.firstName} {user.lastName}
                </p>
                <p className="mt-1 truncate text-xs text-[#666666]">
                  {user.headline || "Professional profile"}
                </p>
              </Link>
            ))}
            {!connections.length ? (
              <p className="p-3 text-sm text-[#666666]">Connect with someone before messaging.</p>
            ) : null}
          </div>
        </Card>

        <Card className="flex min-h-[480px] flex-col p-6">
          {selectedConnection ? (
            <>
              <div className="border-b border-[#D9DDE1] pb-4">
                <h2 className="text-lg font-semibold text-[#1D2226]">
                  {selectedConnection.user.firstName} {selectedConnection.user.lastName}
                </h2>
                <p className="mt-1 text-sm text-[#666666]">
                  {selectedConnection.user.headline || selectedConnection.user.location || "Professional connection"}
                </p>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto py-5">
                {messagesQuery.isLoading ? <p className="text-sm text-[#666666]">Loading messages...</p> : null}
                {messagesQuery.isError ? (
                  <p className="text-sm text-[#CC1016]">
                    {messagesQuery.error instanceof Error ? messagesQuery.error.message : "Unable to load messages."}
                  </p>
                ) : null}
                {!messagesQuery.isLoading && !messagesQuery.isError && !messages.length ? (
                  <p className="rounded-md bg-[#F8F9FA] p-4 text-sm text-[#666666]">
                    Start the conversation with a professional introduction.
                  </p>
                ) : null}
                {messages.map((message) => (
                  <div key={message.id} className="rounded-lg bg-[#F8F9FA] p-3 text-sm text-[#333333]">
                    <p className="whitespace-pre-wrap">{message.body}</p>
                    <p className="mt-1 text-xs text-[#888888]">
                      {new Date(message.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              {sendError ? <p className="mb-3 text-sm text-[#CC1016]">{sendError}</p> : null}
              <form onSubmit={handleSubmit} className="flex gap-2 border-t border-[#D9DDE1] pt-4">
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Write a message..."
                  className="min-w-0 flex-1 rounded-md border border-[#D9DDE1] px-3 py-2 text-sm outline-none focus:border-[#0A66C2]"
                />
                <Button type="submit">Send</Button>
              </form>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-center text-sm text-[#666666]">
              Select a connection to start messaging.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
