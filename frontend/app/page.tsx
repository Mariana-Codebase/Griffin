import { Nav } from "@/components/nav"
import { Hero } from "@/components/hero"
import { HowItWorks } from "@/components/how-it-works"
import { WhoBuiltThis } from "@/components/who-built-this"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0A0A0A]">
      <Nav />
      <Hero />
      <HowItWorks />
      <WhoBuiltThis />
      <Footer />
    </main>
  )
}
