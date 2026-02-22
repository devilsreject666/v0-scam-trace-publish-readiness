import { Navbar } from "@/components/navbar";
import { Pricing } from "@/components/pricing";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "Pricing | ScamTrace",
  description:
    "Choose a plan that fits your investigation needs. From free monitoring to full forensic investigation tools.",
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <Pricing />
      </div>
      <Footer />
    </main>
  );
}
