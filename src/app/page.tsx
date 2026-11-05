import { Preloader } from "@/components/ui/Preloader";
import { Nav } from "@/components/ui/Nav";
import { Hero } from "@/components/sections/Hero";
import { Mission } from "@/components/sections/Mission";
import { Problem } from "@/components/sections/Problem";
import { Solution } from "@/components/sections/Solution";
import { Prototype } from "@/components/sections/Prototype";
import { Team } from "@/components/sections/Team";
import { Journey } from "@/components/sections/Journey";
import { Outro } from "@/components/sections/Outro";
import { ThemeScroller } from "@/components/providers/ThemeScroller";

export default function Home() {
  return (
    <>
      <Preloader />
      <Nav />
      <main>
        <Hero />
        <Mission />
        <Problem />
        <Solution />
        <Prototype />
        <Team />
        <Journey />
        <Outro />
      </main>
      <ThemeScroller />
    </>
  );
}
