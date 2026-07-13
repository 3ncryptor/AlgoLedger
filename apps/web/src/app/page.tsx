import { CtaSection } from '../components/sections/CtaSection'
import { FeatureGrid } from '../components/sections/FeatureGrid'
import { Footer } from '../components/sections/Footer'
import { Hero } from '../components/sections/Hero'
import { HowItWorks } from '../components/sections/HowItWorks'
import { MechanismStrip } from '../components/sections/MechanismStrip'
import { Navbar } from '../components/nav/Navbar'
import { OpenSource } from '../components/sections/OpenSource'
import { Positioning } from '../components/sections/Positioning'
import { ProductShowcase } from '../components/sections/ProductShowcase'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <MechanismStrip />
        <HowItWorks />
        <FeatureGrid />
        <OpenSource />
        <ProductShowcase />
        <Positioning />
        <CtaSection />
      </main>
      <Footer />
    </>
  )
}
