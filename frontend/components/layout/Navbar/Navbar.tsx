"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Bell, Home, MessageCircle, Network, Search, X } from "lucide-react";

import { logoutUser } from "@/features/auth/services/authApi";
import {
  searchNetworkUsers,
  sendConnectionInvitation,
  type NetworkSearchResult,
} from "@/features/network/services/networkApi";
import { ProfileAvatar } from "@/features/profile/components/ProfileAvatar/ProfileAvatar";

const navigationItems = [
  {
    label: "Home",
    href: "/home",
    icon: Home,
  },
  {
    label: "My Network",
    href: "/network",
    icon: Network,
  },
  {
    label: "Messages",
    href: "/messages",
    icon: MessageCircle,
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: Bell,
  },
];

export function Navbar() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<NetworkSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [connectionError, setConnectionError] = useState("");
  const [connectingUserId, setConnectingUserId] = useState("");

  useEffect(() => {
    const query = searchValue.trim();

    if (query.length < 2) {
      setSearchResults([]);
      setSearchError("");
      setIsSearching(false);
      return;
    }

    let active = true;
    const timeout = window.setTimeout(async () => {
      setIsSearching(true);
      setSearchError("");

      try {
        const results = await searchNetworkUsers(query);
        if (active) setSearchResults(results);
      } catch (error) {
        if (active) {
          setSearchResults([]);
          setSearchError(error instanceof Error ? error.message : "Unable to search users.");
        }
      } finally {
        if (active) setIsSearching(false);
      }
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [searchValue]);

  const handleConnect = async (userId: string) => {
    setConnectingUserId(userId);
    setConnectionError("");

    try {
      await sendConnectionInvitation(userId);
      setSearchResults((results) =>
        results.map((result) =>
          result.id === userId ? { ...result, relationshipStatus: "pending" } : result,
        ),
      );
    } catch (error) {
      setConnectionError(error instanceof Error ? error.message : "Unable to send connection request.");
    } finally {
      setConnectingUserId("");
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutUser();
      router.replace("/login");
    } catch {
      router.replace("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#D9DDE1] bg-white">
      <div className="mx-auto flex h-14 max-w-[1128px] items-center gap-6 px-4">
        {/* Brand */}
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-[#0A66C2]"
        >
          ProfileShare
        </Link>

        {/* Search */}
        <div className="relative hidden w-[280px] md:block">
          <div className="flex h-10 items-center gap-2 rounded-md bg-[#EEF3F8] px-3">
            <Search className="h-4 w-4 text-[#666666]" />

            <input
              type="search"
              placeholder="Search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className="w-full bg-transparent text-sm text-[#1D2226] outline-none placeholder:text-[#666666]"
            />

            {searchValue ? (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchValue("")}
                className="text-[#666666] hover:text-[#1D2226]"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          {searchValue.trim().length >= 2 ? (
            <div className="absolute left-0 right-0 top-11 z-50 overflow-hidden rounded-lg border border-[#D9DDE1] bg-white shadow-lg">
              {isSearching ? <p className="p-4 text-sm text-[#666666]">Searching...</p> : null}

              {!isSearching && searchError ? (
                <p className="p-4 text-sm text-[#CC1016]">{searchError}</p>
              ) : null}

              {!isSearching && !searchError && !searchResults.length ? (
                <p className="p-4 text-sm text-[#666666]">No users found.</p>
              ) : null}

              {searchResults.map((result) => (
                <div key={result.id} className="flex items-center gap-3 border-b border-[#F0F0F0] p-3 last:border-b-0">
                  {result.profileImage ? (
                    <Image
                      src={result.profileImage}
                      alt={`${result.firstName} ${result.lastName}`}
                      width={40}
                      height={40}
                      unoptimized
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E8F3FF] text-sm font-semibold text-[#0A66C2]">
                      {`${result.firstName[0] ?? ""}${result.lastName[0] ?? ""}`.toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <Link
                      href={result.username ? `/public/${result.username}` : "#"}
                      className="block truncate text-sm font-semibold text-[#1D2226] hover:text-[#0A66C2]"
                    >
                      {result.firstName} {result.lastName}
                    </Link>
                    <p className="truncate text-xs text-[#666666]">
                      {result.headline || result.location || "Professional profile"}
                    </p>
                  </div>

                  {result.relationshipStatus === "available" ? (
                    <button
                      type="button"
                      onClick={() => handleConnect(result.id)}
                      disabled={connectingUserId === result.id}
                      className="shrink-0 rounded-full border border-[#0A66C2] px-3 py-1.5 text-xs font-semibold text-[#0A66C2] hover:bg-[#E8F3FF] disabled:opacity-50"
                    >
                      {connectingUserId === result.id ? "Sending..." : "Connect"}
                    </button>
                  ) : (
                    <span className="shrink-0 text-xs font-semibold text-[#666666]">
                      {result.relationshipStatus === "connected"
                        ? "Connected"
                        : result.relationshipStatus === "received"
                          ? "Respond in Network"
                          : "Pending"}
                    </span>
                  )}
                </div>
              ))}

              {connectionError ? <p className="border-t border-[#F0F0F0] p-3 text-xs text-[#CC1016]">{connectionError}</p> : null}
            </div>
          ) : null}
        </div>

        {/* Navigation */}
        <nav className="ml-auto flex items-center gap-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-w-[64px] flex-col items-center gap-0.5 text-[#666666] transition hover:text-[#1D2226]"
              >
                <Icon className="h-5 w-5" />
                <span className="hidden text-[11px] lg:block">
                  {item.label}
                </span>
              </Link>
            );
          })}
          <ProfileAvatar
            className="h-8 w-8 border border-[#D9DDE1] bg-[#D9DDE1]"
            textClassName="text-[10px] font-semibold text-[#666666]"
            allowUpload
          />
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="text-xs font-semibold text-[#666666] hover:text-[#1D2226] disabled:opacity-50"
          >
            {isLoggingOut ? "Signing out..." : "Sign out"}
          </button>
        </nav>
      </div>
    </header>
  );
}