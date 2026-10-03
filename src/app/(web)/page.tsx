import CommunitiesPreview from '@/components/web/home/CommunitiesPreview';
import CTASection from '@/components/web/home/CTASection';
import DonationBanner from '@/components/web/home/DonationSection';
import CommunityFeatures from '@/components/web/home/Featuredcards';
import FeaturesSection from '@/components/web/home/FeaturesSection';
import Hero from '@/components/web/home/hero/Hero';
import HowItWorks from '@/components/web/home/HowItWorks';
import AppDownloadBanner from '@/components/web/home/AppDownloadBanner';
import PartnersSection from '@/components/web/home/AssociatesSection';
import TestimonialsSection from '@/components/web/home/TestimonialsSection';
import WelcomePopup from '@/components/web/home/WelcomePopup';
import PartnersMarquee from '@/components/web/home/PartnersSection';
import ChooseYourVibe from '@/components/web/home/ChooseYourVibe';

export default function HomePage() {
  return (
    <>
      <WelcomePopup />
      <Hero/>
      <ChooseYourVibe />
      <HowItWorks/>
      <AppDownloadBanner/>
      <FeaturesSection/>
      <CommunitiesPreview/>
      <CommunityFeatures/>
      <TestimonialsSection/>
      <PartnersSection/>
      <DonationBanner/>
      <PartnersMarquee/>
      <CTASection/>

    </>
  );
}
