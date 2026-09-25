import axios from "axios";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";

const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
});

function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallback;
  }

  return error instanceof Error ? error.message : fallback;
}

export type NetworkSearchResult = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  headline: string;
  profileImage?: string;
  location?: string;
  relationshipStatus: "available" | "pending" | "received" | "connected";
};

export async function searchNetworkUsers(query: string): Promise<NetworkSearchResult[]> {
  try {
    const response = await api.get("/network/search", { params: { q: query } });
    return response.data.data ?? [];
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to search users."));
  }
}

export async function sendConnectionInvitation(receiverId: string) {
  try {
    const response = await api.post("/network/invitations", { receiverId });
    return response.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to send connection request."));
  }
}

export async function getReceivedInvitations() {
  try {
    const response = await api.get("/network/invitations/received");
    return response.data.data ?? [];
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to load connection requests."));
  }
}

export async function respondToInvitation(
  invitationId: string,
  response: "accept" | "reject",
) {
  try {
    const result = await api.patch(`/network/invitations/${invitationId}/${response}`);
    return result.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to respond to connection request."));
  }
}

export async function getConnections() {
  try {
    const response = await api.get("/network/connections");
    return response.data.data ?? [];
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to load connections."));
  }
}

export async function getConversation(userId: string) {
  try {
    const response = await api.get(`/messages/${userId}`);
    return response.data.data ?? [];
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to load messages."));
  }
}

export async function sendMessage(receiverId: string, body: string) {
  try {
    const response = await api.post("/messages", { receiverId, body });
    return response.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to send message."));
  }
}
