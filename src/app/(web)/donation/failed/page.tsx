import { Metadata } from "next";
import DonationFailedPage from "@/components/web/donation/DonationFailed";

export const metadata: Metadata = {
  title: "Donation Failed | Prabasi Odia",
  description: "Your donation to Prabasi Odia failed. Please try again.",
};

export default function FailedRoute() {
  return <DonationFailedPage />;
}