import { Metadata } from "next";
import DonationSuccessPage from "@/components/web/donation/DonationSuccess";

export const metadata: Metadata = {
  title: "Donation Successful | Prabasi Odia",
  description: "Thank you for your donation to Prabasi Odia. Your support empowers the Odia community.",
};

export default function SuccessRoute() {
  return <DonationSuccessPage />;
}