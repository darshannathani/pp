import Image from "next/image";
import { HeroBanner } from "@/components/landing/heroBanner/HeroBanner";
import { Featured } from "@/components/landing/featured/Featured";
import { Testimony } from "@/components/landing/testimony/Testimony";
import { Pricing } from "@/components/landing/pricing/Pricing";
import { Stats } from "@/components/landing/stats/Stats";
import { ContactUs } from "@/components/landing/contactUs/ContactUs";
import { Blogs } from "@/components/landing/blogs/Blogs";
import { FAQ } from "@/components/landing/faq/FAQ";
import { GoToTopButton } from "@/components/shared/goToTop/GoToTop";
import { Clients } from "@/components/landing/clients/Clients";
import { Suspense } from "react";

export default function Home() {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
      <HeroBanner />
      <Featured />
      <Clients />
      <Pricing />
      <Testimony />
      <Stats />
      <Blogs />
      <FAQ />
      <ContactUs />
      <GoToTopButton />
      </Suspense>
    </>
  );
}
