export function getCommunityAccessRoute({
  isAuthenticated,
  hasJoinedCommunity,
  isVerified,
  residencyStatus,
}: {
  isAuthenticated: boolean;
  hasJoinedCommunity: boolean;
  isVerified: boolean;
  residencyStatus?: string;
}) {
  if (!isAuthenticated) return "/signup";
  if (residencyStatus === 'RO' || residencyStatus === 'GUEST') return null;
  if (!hasJoinedCommunity) return "/join-community";
  if (!isVerified) return "/profile";
  return null;
}
