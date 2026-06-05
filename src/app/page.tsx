import Nav from "./components/sections/Nav";
import Hero from "./components/sections/Hero";
import Features from "./components/sections/Features";
import WhatWeDo from "./components/sections/WhatWeDo";
import Stats from "./components/sections/Stats";
import Timeline from "./components/sections/Timeline";
import Portfolio from "./components/sections/Portfolio";
import Team from "./components/sections/Team";
import { AdvisoryBoard, Fellows } from "./components/sections/People";
import Sponsors from "./components/sections/Sponsors";
import Footer from "./components/sections/Footer";

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Features />
        {/* What We Do + Numbers form one rounded light panel over the dark page. */}
        <WhatWeDo />
        <Stats />
        <Timeline />
        <Portfolio />
        <Team />
        <AdvisoryBoard />
        <Fellows />
        <Sponsors />
      </main>
      <Footer />
    </>
  );
}
