import type { Metadata } from "next";
import BiographyReader from "@/components/web/biography/BiographyReader";

export const metadata: Metadata = {
  title: "FCA(Dr) Manoranjan Mohanty | Prabasi Odia",
  description: "Read the profile of FCA(Dr) Manoranjan Mohanty as a seven-page magazine.",
};

export default function ManoranjanMohantyPage() {
  return <BiographyReader />;
}
