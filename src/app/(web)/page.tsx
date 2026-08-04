import CommunitiesPreview from '@/components/web/home/CommunitiesPreview';
import CTASection from '@/components/web/home/CTASection';
import DonationBanner from '@/components/web/home/DonationSection';
import CommunityFeatures from '@/components/web/home/Featuredcards';
import FeaturesSection from '@/components/web/home/FeaturesSection';
import Hero from '@/components/web/home/hero/Hero';
import HowItWorks from '@/components/web/home/HowItWorks';
import PartnersSection from '@/components/web/home/PartnersSection';
import TestimonialsSection from '@/components/web/home/TestimonialsSection';
import WelcomePopup from '@/components/web/home/WelcomePopup';

export default function HomePage() {
  return (
    <>
      <WelcomePopup />
      <Hero/>
      <HowItWorks/>
      <FeaturesSection/>
      <CommunitiesPreview/>
      <CommunityFeatures/>
      <TestimonialsSection/>
      <PartnersSection/>
      <DonationBanner/>
      <CTASection/>

    </>
  );
}