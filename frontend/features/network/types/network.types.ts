export interface NetworkUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  headline: string;
  profileImage?: string;
  location?: string;
}

export interface Connection {
  id: string;
  user: NetworkUser;
  connectedAt: string;
}

export interface Invitation {
  id: string;
  sender: NetworkUser;
  receiver: NetworkUser;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  respondedAt?: string;
}

export interface NetworkSummary {
  connectionCount: number;
  pendingInvitationCount: number;
  sentInvitationCount: number;
}
