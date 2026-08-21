export function getCommunityAccessRoute({
  isAuthenticated,
  hasJoinedCommunity,
  isVerified,
}: {
  isAuthenticated: boolean;
  hasJoinedCommunity: boolean;
  isVerified: boolean;
}) {
  if (!isAuthenticated) return "/signup";
  if (!hasJoinedCommunity) return "/join-community";
  if (!isVerified) return "/profile";
  return null;
}
