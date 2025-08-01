import { Cta } from "components/Cta";
import { FAQ } from "components/FAQ";
import { Feature } from "components/Feature";
import { Footer } from "components/Footer";
import { Hero } from "components/Hero";
import { HowItWorks } from "components/HowItWorks";
import { LandingNavbar } from "components/LandingNavbar";
import { Pricing } from "components/Pricing";
import { Stats } from "components/Stats";
import { Testimonials } from "components/Testimonials";
import { SubscriptionPopup } from "components/SubscriptionPopup";
import { Metadata } from "next";
import JsonLd from "components/SEO/JsonLd";

export const metadata: Metadata = {
  title: "Clami | AI Flashcards For Focused, Fast Learning",
  description: "Create flashcards from notes, study with smart quizzes, and track mastery. Built for students who want to stop wasting time.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  const softwareAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Clami",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Create flashcards from notes, study with smart quizzes, and track mastery. Built for students who want to stop wasting time.",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "120"
    },
    "screenshot": "https://res.cloudinary.com/dyu7ogoqc/image/upload/v1754105180/Screenshot_2025-08-01_232455_n6m6gj.png",
    "featureList": "AI-powered flashcard creation, Smart quizzes, Mastery tracking, Study analytics",
    "applicationSubCategory": "Learning Tools",
    "author": {
      "@type": "Person",
      "name": "Shi Jun(Kyson) W."
    },
    "publisher": {
      "@type": "Person",
      "name": "Shi Jun(Kyson) W."
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": "https://clami.app/",
    "name": "Clami",
    "description": "AI Flashcards For Focused, Fast Learning",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://clami.app/workspace/explore?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Clami",
    "url": "https://clami.app",
    "logo": "https://clami.app/clami.png",
    "sameAs": [],
    "founder": {
      "@type": "Person",
      "name": "Shi Jun(Kyson) W."
    }
  };

  return (
    <div className="overflow-x-hidden">
      <JsonLd data={softwareAppSchema} />
      <JsonLd data={websiteSchema} />
      <JsonLd data={organizationSchema} />
      <SubscriptionPopup />
      <div className="px-4 max-w-[1200px] mx-auto">
        <LandingNavbar />
        <Hero />
      </div>
      <Stats />
      <div className="px-4 max-w-[1200px] mx-auto">
        <Feature />
      </div>
      <HowItWorks />
      <div className="px-4 max-w-[1200px] mx-auto">
        <Testimonials />
      </div>
      <div className="px-4 max-w-[1200px] mx-auto">
        <Pricing />
      </div>
      <FAQ />
      <div className="px-4 max-w-[1200px] mx-auto">
        <Cta />
        <Footer />
      </div>
    </div>
  );
}
