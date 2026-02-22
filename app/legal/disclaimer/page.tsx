import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Disclaimer } from "@/components/disclaimer";

export const metadata = {
  title: "Disclaimer | ScamTrace",
  description:
    "Important limitations and disclaimers for ScamTrace services.",
};

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-24 grid-bg">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-12">
          <h1 className="text-3xl font-extrabold text-foreground mb-8">
            Disclaimer
          </h1>
          <Disclaimer />
          <div className="mt-8 flex flex-col gap-6 text-sm text-muted leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-foreground mb-2">
                Data Sources
              </h2>
              <p>
                ScamTrace retrieves blockchain data from public APIs (Etherscan
                for Ethereum, Blockstream for Bitcoin). Risk scores are
                calculated algorithmically based on observable on-chain patterns
                including transaction velocity, wallet age, and balance
                activity. These are heuristic signals, not definitive fraud
                determinations.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-foreground mb-2">
                Not Financial or Legal Advice
              </h2>
              <p>
                Nothing on ScamTrace constitutes financial advice, legal advice,
                or a recommendation to take any specific action. Always consult
                qualified professionals before making decisions based on
                information from this service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-foreground mb-2">
                Accuracy Limitations
              </h2>
              <p>
                Blockchain data is public and immutable, but our interpretation
                of that data involves algorithmic analysis that may produce false
                positives or false negatives. When insufficient data exists to
                make an assessment, ScamTrace will report that explicitly rather
                than generating a speculative score.
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
