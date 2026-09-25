export function toNetworkUser(user, profile) {
  if (!user) {
    return null;
  }

  return {
    id: user._id?.toString() || user.id,
    username: profile?.username || "",
    firstName: user.firstName,
    lastName: user.lastName,
    headline: profile?.headline || "",
    profileImage: profile?.profileImage || "",
    location: [profile?.city, profile?.state, profile?.country].filter(Boolean).join(", "),
  };
}

export function toInvitationResponse(invitation, sender, receiver) {
  return {
    id: invitation._id.toString(),
    sender,
    receiver,
    status: invitation.status,
    createdAt: invitation.createdAt,
    respondedAt: invitation.respondedAt,
  };
}

export function toConnectionResponse(connection, user) {
  return {
    id: connection._id.toString(),
    user,
    connectedAt: connection.connectedAt,
  };
}
