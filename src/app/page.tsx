import Link from "next/link";
import {
  ArrowRight,
  DollarSign,
  Users,
  Shield,
  Zap,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border-subtle">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-crimson-600 rounded-lg flex items-center justify-center shadow-lg shadow-crimson-900/40">
              <span className="text-white font-bold text-sm font-[family-name:var(--font-display)]">
                CA
              </span>
            </div>
            <span className="text-text-primary font-semibold text-sm font-[family-name:var(--font-display)] tracking-wide">
              COMMISSION ARMY
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="btn-ghost text-sm hidden sm:inline-flex"
            >
              Log In
            </Link>
            <Link href="/signup" className="btn-primary text-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 sm:pt-32 pb-14 sm:pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-crimson-900/20 border border-crimson-800/30 text-crimson-400 text-xs font-semibold mb-8 animate-fade-in">
            <Zap size={12} />
            The Referral Marketplace
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-text-primary font-[family-name:var(--font-display)] leading-[1.1] mb-6 animate-fade-in stagger-1 opacity-0">
            Know Someone Who
            <br />
            Needs{" "}
            <span className="relative">
              <span className="text-crimson-400">Something?</span>
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 200 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 8C40 2 80 2 100 6C120 10 160 4 198 6"
                  stroke="var(--crimson-600)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.4"
                />
              </svg>
            </span>
            <br />
            <span className="text-forest-400">Get Paid For It.</span>
          </h1>

          <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10 animate-fade-in stagger-2 opacity-0">
            Commission Army connects businesses looking for customers with
            people who know people. Submit a referral, earn a commission.
            It&apos;s that simple.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in stagger-3 opacity-0">
            <Link
              href="/signup"
              className="btn-primary text-base px-8 py-3.5 flex items-center justify-center gap-2 rounded-xl shadow-lg shadow-crimson-900/30"
            >
              Start Earning <ArrowRight size={18} />
            </Link>
            <Link
              href="/signup"
              className="btn-secondary text-base px-8 py-3.5 flex items-center justify-center gap-2 rounded-xl"
            >
              I&apos;m a Business
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 bg-surface/50 border-y border-border-subtle">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-text-primary text-center font-[family-name:var(--font-display)] mb-4">
            How It Works
          </h2>
          <p className="text-text-muted text-center mb-14 max-w-xl mx-auto">
            Three steps to earning commissions from your network
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Browse Offers",
                description:
                  "Find businesses paying for referrals in your area. Filter by category, location, and commission amount.",
                color: "text-navy-400",
                bg: "bg-navy-800/40",
                border: "border-navy-700/30",
              },
              {
                step: "02",
                title: "Submit a Referral",
                description:
                  "Know someone who needs their services? Submit their info. That's it — you've done the hard part.",
                color: "text-crimson-400",
                bg: "bg-crimson-900/20",
                border: "border-crimson-800/20",
              },
              {
                step: "03",
                title: "Get Paid",
                description:
                  "When the business accepts your referral, you earn your commission. Payments go straight to your bank.",
                color: "text-forest-400",
                bg: "bg-forest-900/20",
                border: "border-forest-800/20",
              },
            ].map((item, i) => (
              <div
                key={item.step}
                className={`${item.bg} border ${item.border} rounded-xl p-6 relative overflow-hidden`}
              >
                <span
                  className={`text-5xl font-extrabold ${item.color} opacity-20 absolute top-3 right-4 font-[family-name:var(--font-display)]`}
                >
                  {item.step}
                </span>
                <div className="relative z-10">
                  <h3 className="text-lg font-bold text-text-primary font-[family-name:var(--font-display)] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Businesses */}
      <section className="py-14 sm:py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-crimson-400 mb-4 block">
                For Businesses
              </span>
              <h2 className="text-3xl font-bold text-text-primary font-[family-name:var(--font-display)] mb-4">
                Your Next Customer Is
                <br />
                One Referral Away
              </h2>
              <p className="text-text-secondary mb-8">
                Stop spending thousands on ads that don&apos;t convert. Post a
                referral offer, set your commission, and let an army of
                connected people bring qualified leads straight to your door.
              </p>

              <div className="space-y-4">
                {[
                  "Only pay when you get a qualified lead",
                  "Set your own commission rates",
                  "Review and accept referrals before paying",
                  "Built-in fraud protection",
                ].map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <CheckCircle2
                      size={16}
                      className="text-forest-400 mt-0.5 shrink-0"
                    />
                    <span className="text-sm text-text-secondary">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface rounded-2xl border border-border p-8">
              <div className="space-y-6">
                {[
                  {
                    icon: DollarSign,
                    label: "Average Cost Per Lead",
                    value: "60% lower than ads",
                    color: "text-forest-400",
                  },
                  {
                    icon: Users,
                    label: "Referral Conversion Rate",
                    value: "3-5x higher than cold leads",
                    color: "text-crimson-400",
                  },
                  {
                    icon: TrendingUp,
                    label: "Customer Lifetime Value",
                    value: "16% higher from referrals",
                    color: "text-navy-300",
                  },
                  {
                    icon: Shield,
                    label: "Platform Protection",
                    value: "Built-in fraud detection",
                    color: "text-forest-400",
                  },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-navy-800 flex items-center justify-center shrink-0">
                      <stat.icon size={18} className={stat.color} />
                    </div>
                    <div>
                      <p className="text-xs text-text-muted">{stat.label}</p>
                      <p className="text-sm font-semibold text-text-primary">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 bg-surface/50 border-y border-border-subtle">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-text-primary font-[family-name:var(--font-display)] mb-4">
            Every Industry. Every Network.
          </h2>
          <p className="text-text-muted mb-12 max-w-xl mx-auto">
            From home services to professional firms, Commission Army works
            wherever word-of-mouth drives business.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              "Trades & Home Services",
              "Professional Services",
              "Creative Services",
              "Wedding & Events",
              "Automotive",
              "Recruiting & Staffing",
              "IT & Technology",
              "And More...",
            ].map((cat) => (
              <div
                key={cat}
                className="bg-navy-800/40 border border-border-subtle rounded-lg py-3 px-4 text-sm text-text-secondary hover:bg-navy-800 hover:text-text-primary hover:border-navy-600 transition-all cursor-default"
              >
                {cat}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary font-[family-name:var(--font-display)] mb-4">
            Ready to Put Your Network
            <br />
            to Work?
          </h2>
          <p className="text-text-secondary mb-10 max-w-lg mx-auto">
            Join Commission Army today. It&apos;s free to sign up, free to
            browse, and you only earn when your referral lands.
          </p>
          <Link
            href="/signup"
            className="btn-primary text-base px-10 py-4 inline-flex items-center gap-2 rounded-xl shadow-lg shadow-crimson-900/30"
          >
            Join the Army <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-subtle py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-crimson-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-[10px] font-[family-name:var(--font-display)]">
                CA
              </span>
            </div>
            <span className="text-xs text-text-muted">
              Commission Army &copy; {new Date().getFullYear()}
            </span>
          </div>
          <div className="flex items-center gap-6 text-xs text-text-muted">
            <Link href="/login" className="hover:text-text-secondary transition-colors">
              Log In
            </Link>
            <Link href="/signup" className="hover:text-text-secondary transition-colors">
              Sign Up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
