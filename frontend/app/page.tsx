import { LandingShell } from "@/components/landing/landing-shell"
import { Nav } from "@/components/nav"
import { Hero } from "@/components/hero"
import { HowItWorks } from "@/components/how-it-works"
import { AttackersRoster } from "@/components/attackers-roster"
import { WhoBuiltThis } from "@/components/who-built-this"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <LandingShell>
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <AttackersRoster />
        <WhoBuiltThis />
      </main>
      <Footer />
    </LandingShell>
  )
}
