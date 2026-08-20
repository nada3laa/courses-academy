import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import Services from "../components/landing/Services";
import Stats from "../components/landing/Stats";
import Marquee from "../components/landing/Marquee";
import FAQ from "../components/landing/FAQ";
import Pricing from "../components/landing/Pricing";
import BlogSection from "../components/landing/BlogSection";
import FeaturedCourses from "../components/landing/FeaturedCourses";

export default function Landing() {
  return (
    <>
      <Hero />
      <Marquee />
       <FeaturedCourses />
      <Pricing />
      <Stats />
      <Features />
      <BlogSection />

      <Services />


      <FAQ />
    </>
  );
}