import FAQs from "@/components/landing/FAQs";
import Features from "@/components/landing/Feature";
import Hero from "@/components/landing/Hero";
import Pricing from "@/components/landing/Pricing";
import Footer from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/navbar";
import { auth } from "@clerk/nextjs/server";
export default async function Home() {
  return (
    <div className="bg-background">
      <Navbar />
      <Hero />
      <Features />
      <Pricing />
      <FAQs />
      <Footer />
    </div>
  );
}
