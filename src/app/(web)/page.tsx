import CommunitiesPreview from '@/components/web/home/CommunitiesPreview';
import CTASection from '@/components/web/home/CTASection';
import FeaturesSection from '@/components/web/home/FeaturesSection';
import Hero from '@/components/web/home/hero/Hero';
import HowItWorks from '@/components/web/home/HowItWorks';
import PartnersSection from '@/components/web/home/PartnersSection';
import TestimonialsSection from '@/components/web/home/TestimonialsSection';

export default function HomePage() {
  return (
    <>
      <Hero/>
      <HowItWorks/>
      <FeaturesSection/>
      <CommunitiesPreview/>
      <TestimonialsSection/>
      <PartnersSection/>
      <CTASection/>

    </>
  );
}