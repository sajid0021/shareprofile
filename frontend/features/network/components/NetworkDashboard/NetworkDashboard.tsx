"use client";

import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowRight, Check, Share2, Users, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  getConnections,
  getReceivedInvitations,
  respondToInvitation,
} from "@/features/network/services/networkApi";
import type { Connection, Invitation } from "@/features/network/types/network.types";

export function NetworkDashboard() {
  const queryClient = useQueryClient();
  const [requestError, setRequestError] = useState("");
  const [respondingId, setRespondingId] = useState("");
  const invitationsQuery = useQuery({
    queryKey: ["received-invitations"],
    queryFn: getReceivedInvitations,
  });
  const invitations = (invitationsQuery.data ?? []) as Invitation[];
  const connectionsQuery = useQuery({
    queryKey: ["connections"],
    queryFn: getConnections,
  });
  const connections = (connectionsQuery.data ?? []) as Connection[];

  const handleResponse = async (invitationId: string, response: "accept" | "reject") => {
    setRespondingId(invitationId);
    setRequestError("");

    try {
      await respondToInvitation(invitationId, response);
      await queryClient.invalidateQueries({ queryKey: ["received-invitations"] });
      await queryClient.invalidateQueries({ queryKey: ["connections"] });
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Unable to respond to request.");
    } finally {
      setRespondingId("");
    }
  };

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-[#D9DDE1] p-6">
          <div>
            <h1 className="text-2xl font-semibold text-[#1D2226]">My Network</h1>
            <p className="mt-1 text-sm text-[#666666]">
              Build meaningful professional relationships.
            </p>
          </div>

          <Link href="/profile/share">
            <Button variant="secondary" type="button">
              Share profile
            </Button>
          </Link>
        </div>

        <div className="p-6">
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#D9DDE1] bg-[#F8F9FA] px-6 py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F3FF] text-[#0A66C2]">
              <Users className="h-8 w-8" />
            </div>

            <h2 className="text-xl font-semibold text-[#1D2226]">Your network is waiting</h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-[#666666]">
              Start connecting with professionals, share your profile, and grow your circle with
              relevant opportunities.
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link href="/profile/edit">
                <Button type="button">Complete profile</Button>
              </Link>

              <Link href="/profile/share">
                <Button variant="secondary" type="button">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share profile
                </Button>
              </Link>
            </div>

            <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#0A66C2]">
              Discover people
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[#1D2226]">Connection requests</h2>
            <p className="mt-1 text-sm text-[#666666]">
              Review requests from people who want to connect with you.
            </p>
          </div>
          <span className="rounded-full bg-[#E8F3FF] px-3 py-1 text-sm font-semibold text-[#0A66C2]">
            {invitations.length}
          </span>
        </div>

        {invitationsQuery.isLoading ? (
          <p className="mt-5 text-sm text-[#666666]">Loading connection requests...</p>
        ) : null}

        {invitationsQuery.isError ? (
          <p className="mt-5 text-sm text-[#CC1016]">
            {invitationsQuery.error instanceof Error
              ? invitationsQuery.error.message
              : "Unable to load connection requests."}
          </p>
        ) : null}

        {requestError ? <p className="mt-5 text-sm text-[#CC1016]">{requestError}</p> : null}

        {!invitationsQuery.isLoading && !invitationsQuery.isError && !invitations.length ? (
          <p className="mt-5 rounded-md bg-[#F8F9FA] p-4 text-sm text-[#666666]">
            You have no pending connection requests.
          </p>
        ) : null}

        {invitations.length ? (
          <div className="mt-5 space-y-3">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex flex-wrap items-center gap-3 rounded-lg border border-[#E8E6E1] p-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8F3FF] text-sm font-semibold text-[#0A66C2]">
                  {`${invitation.sender.firstName[0] ?? ""}${invitation.sender.lastName[0] ?? ""}`.toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    href={invitation.sender.username ? `/public/${invitation.sender.username}` : "#"}
                    className="text-sm font-semibold text-[#1D2226] hover:text-[#0A66C2]"
                  >
                    {invitation.sender.firstName} {invitation.sender.lastName}
                  </Link>
                  <p className="truncate text-xs text-[#666666]">
                    {invitation.sender.headline || "Professional profile"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    className="px-3 py-1.5 text-xs"
                    disabled={respondingId === invitation.id}
                    onClick={() => handleResponse(invitation.id, "accept")}
                  >
                    <Check className="mr-1 h-3.5 w-3.5" />
                    Accept
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="px-3 py-1.5 text-xs"
                    disabled={respondingId === invitation.id}
                    onClick={() => handleResponse(invitation.id, "reject")}
                  >
                    <X className="mr-1 h-3.5 w-3.5" />
                    Ignore
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </Card>

      <Card className="p-6">
        <div>
          <h2 className="text-lg font-semibold text-[#1D2226]">Your connections</h2>
          <p className="mt-1 text-sm text-[#666666]">
            View your connections’ professional profiles and message them.
          </p>
        </div>

        {connectionsQuery.isLoading ? (
          <p className="mt-5 text-sm text-[#666666]">Loading connections...</p>
        ) : null}

        {connectionsQuery.isError ? (
          <p className="mt-5 text-sm text-[#CC1016]">
            {connectionsQuery.error instanceof Error
              ? connectionsQuery.error.message
              : "Unable to load connections."}
          </p>
        ) : null}

        {!connectionsQuery.isLoading && !connectionsQuery.isError && !connections.length ? (
          <p className="mt-5 rounded-md bg-[#F8F9FA] p-4 text-sm text-[#666666]">
            Accepted connections will appear here.
          </p>
        ) : null}

        {connections.length ? (
          <div className="mt-5 space-y-5">
            {connections.map(({ id, user }) => (
              <article key={id} className="rounded-lg border border-[#E8E6E1] p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="h-14 w-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#E8F3FF] text-lg font-semibold text-[#0A66C2]">
                        {`${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-[#1D2226]">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-sm text-[#0A66C2]">{user.headline || "Professional profile"}</p>
                      {user.location ? <p className="mt-1 text-sm text-[#666666]">{user.location}</p> : null}
                    </div>
                  </div>

                  <Link href={`/messages?userId=${encodeURIComponent(user.id)}`}>
                    <Button type="button">Message</Button>
                  </Link>
                </div>

                {user.about ? (
                  <div className="mt-5 border-t border-[#F0F0F0] pt-4">
                    <h4 className="text-sm font-semibold text-[#1D2226]">About</h4>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#555555]">{user.about}</p>
                  </div>
                ) : null}

                {user.skills?.length ? (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-[#1D2226]">Skills</h4>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {user.skills.map((skill) => (
                        <span key={skill} className="rounded-full bg-[#E8F3FF] px-3 py-1 text-xs font-medium text-[#0A66C2]">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-4 text-xs text-[#666666]">
                  {user.email ? <span>{user.email}</span> : null}
                  {user.phone ? <span>{user.phone}</span> : null}
                  {user.website ? (
                    <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-[#0A66C2] hover:underline">
                      Website
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </Card>
    </div>
  );
}
