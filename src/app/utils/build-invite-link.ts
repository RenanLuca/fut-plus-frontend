export function buildInviteLink(inviteId: string) {
  return `${window.location.origin}/invite/${inviteId}`;
}
