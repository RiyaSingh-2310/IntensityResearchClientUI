import { motion } from "motion/react";
import {
  ArrowRight,
  BadgeCheck,
  ClipboardCheck,
  Gift,
  Lock,
  MessageSquareText,
  ShieldCheck,
  SlidersHorizontal,
  UserPlus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { HeroStage } from "@/components/home/HeroStage";
import { RewardMethodMark } from "@/components/rewards/RewardMethodMark";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Button } from "@/components/ui/button";
import {
  brand,
  joinIncentive,
  joinMemberTrust,
  joinResearchOpportunities,
  joinWhyJoin,
} from "@/config/brand";
import { paths } from "@/config/paths";
import { useAuth } from "@/hooks/useAuth";
import { useAsync } from "@/hooks/useAsync";
import { easePremium, stagger, useMotionConfig } from "@/lib/motion";
import { formatNumber } from "@/lib/utils";
import { rewardService } from "@/services/reward.service";

const whyJoinIcons = [Gift, SlidersHorizontal, ShieldCheck];

const steps = [
  {
    n: "01",
    title: "Create your account",
    copy: "Sign up for free and verify your email address.",
    icon: UserPlus,
  },
  {
    n: "02",
    title: "Complete your profile",
    copy: "Answer a few questions so we can match you with relevant studies.",
    icon: MessageSquareText,
  },
  {
    n: "03",
    title: "Take assigned surveys",
    copy: "Every study assigned to you is listed in your member dashboard.",
    icon: ClipboardCheck,
  },
  {
    n: "04",
    title: "Redeem your points",
    copy: "Request a payout once your balance reaches the minimum.",
    icon: Gift,
  },
];

export function HomePage() {
  const { user } = useAuth();
  const { reduce, duration } = useMotionConfig();
  const settings = useAsync(
    () => rewardService.getCatalog(),
    "public-settings",
  );
  const methods = settings.data?.items ?? [];
  const minimum = settings.data?.minimumPayout ?? 0;
  const welcomePoints = settings.data?.registrationRewardPoints ?? 0;
  const portalTo = user ? paths.dashboard : paths.login;
  const portalLabel = user ? "Go to dashboard" : "Log in";

  const facts = settings.data
    ? [
        minimum > 0
          ? { value: `${formatNumber(minimum)} pts`, label: "Minimum payout" }
          : null,
        methods.length
          ? {
              value: formatNumber(methods.length),
              label: methods.length === 1 ? "Payout method" : "Payout methods",
            }
          : null,
        welcomePoints > 0
          ? {
              value: `${formatNumber(welcomePoints)} pts`,
              label: "Welcome points",
            }
          : null,
        { value: "Free", label: "To join" },
      ].filter((fact) => fact != null)
    : [];

  return (
    <div>
      <section className="hero-grid relative overflow-hidden">
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:px-8 lg:py-24">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0 : 0.6, ease: easePremium }}
          >
            <p className="text-xs font-semibold tracking-[0.22em] text-signal uppercase">
              Market research panel
            </p>
            <h1 className="font-display mt-5 max-w-xl text-[2.6rem] leading-[1.04] font-semibold text-balance text-strong sm:text-6xl lg:text-[4.25rem]">
              Your opinions
              <span className="mt-1 block text-accent">shape what’s next.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-ink-soft">
              {brand.name} invites panelists to take part in research studies on
              products, services, and everyday experiences. Complete assigned
              surveys, earn points, and redeem them for rewards.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to={user ? paths.dashboard : paths.join}>
                  {user ? "Go to dashboard" : "Join the panel"}
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to={paths.howItWorks}>See how it works</Link>
              </Button>
            </div>
            <ul className="mt-8 flex flex-wrap gap-2 text-sm text-ink-soft">
              <li className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-3 py-1.5">
                <Lock className="size-3.5 text-accent" aria-hidden="true" />{" "}
                Privacy protected
              </li>
              <li className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-3 py-1.5">
                <ShieldCheck
                  className="size-3.5 text-accent"
                  aria-hidden="true"
                />{" "}
                Verified accounts
              </li>
              <li className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-3 py-1.5">
                <BadgeCheck
                  className="size-3.5 text-accent"
                  aria-hidden="true"
                />{" "}
                Free to join
              </li>
            </ul>
          </motion.div>
          <HeroStage methods={methods} />
        </div>
      </section>

      {facts.length ? (
        <section
          className="relative z-10 mx-auto -mt-8 max-w-7xl px-4 sm:px-6 lg:px-8"
          aria-label="Panel facts"
        >
          <dl className="grid grid-cols-2 overflow-hidden rounded-[1.75rem] border border-line bg-surface shadow-lift md:grid-flow-col md:auto-cols-fr md:grid-cols-none">
            {facts.map((fact) => (
              <div
                key={fact.label}
                className="border-line px-5 py-7 sm:px-7 md:border-l md:first:border-l-0"
              >
                <dt className="text-sm text-muted">{fact.label}</dt>
                <dd className="font-display mt-1 text-3xl font-semibold text-strong sm:text-4xl">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <AnimatedSection>
          <SectionHeading
            eyebrow="Why join"
            title="Research participation, made simple"
            description={`${brand.name} keeps every assigned study, point, and payout request in one secure member area.`}
          />
        </AnimatedSection>
        <motion.div
          className="mt-14 grid gap-4 md:grid-cols-3"
          variants={stagger}
          initial={reduce ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {joinWhyJoin.map((item, index) => {
            const Icon = whyJoinIcons[index] ?? Gift;
            return (
              <motion.article
                key={item.title}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration, ease: easePremium },
                  },
                }}
                className="group rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-brand-mid/50"
              >
                <div className="mb-5 grid size-11 place-items-center rounded-xl border border-brand-mid/30 bg-brand-soft text-accent">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <h3 className="font-display text-xl font-semibold text-strong">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-ink-soft">
                  {item.copy}
                </p>
              </motion.article>
            );
          })}
        </motion.div>
      </section>

      <section className="border-y border-line bg-cream/60">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <AnimatedSection>
            <SectionHeading
              eyebrow="How it works"
              title="Four steps from sign-up to payout"
              description="No hunting through email. Assigned surveys are waiting in your member dashboard."
            />
          </AnimatedSection>
          <AnimatedSection>
            <ol className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {steps.map((step) => (
                <li
                  key={step.n}
                  className="flex h-full flex-col rounded-2xl border border-line bg-surface p-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display grid size-11 place-items-center rounded-full border border-signal/40 bg-signal-soft text-sm font-semibold text-signal">
                      {step.n}
                    </span>
                    <step.icon
                      className="size-5 text-accent"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="font-display mt-6 text-xl font-semibold text-strong">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-ink-soft">
                    {step.copy}
                  </p>
                </li>
              ))}
            </ol>
          </AnimatedSection>
          <div className="mt-12 flex justify-center">
            <Button asChild variant="outline" size="lg">
              <Link to={paths.howItWorks}>Read the full process</Link>
            </Button>
          </div>
        </div>
      </section>

      {methods.length ? (
        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <AnimatedSection>
            <SectionHeading
              eyebrow="Rewards"
              title="Redeem points your way"
              description={joinIncentive.disclaimer}
            />
          </AnimatedSection>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {methods.map((method) => (
              <li
                key={method.id}
                className="flex items-center gap-4 rounded-2xl border border-line bg-surface px-5 py-5"
              >
                <RewardMethodMark method={method} size="lg" decorative />
                <div className="min-w-0">
                  <p className="font-display text-lg font-semibold text-strong">
                    {method.name}
                  </p>
                  <p className="text-xs text-muted">
                    {minimum > 0
                      ? `From ${formatNumber(minimum)} points`
                      : "Available payout method"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-10 text-center">
            <Button asChild variant="outline">
              <Link to={paths.rewards}>
                Explore rewards
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </section>
      ) : null}

      <section
        className={methods.length ? "border-y border-line bg-cream/60" : ""}
      >
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <AnimatedSection>
            <SectionHeading
              eyebrow="Studies"
              title="The kinds of research you could join"
              description="Invitations depend on your profile and the studies currently open."
            />
          </AnimatedSection>
          <ul className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {joinResearchOpportunities.map((topic) => (
              <li
                key={topic}
                className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-5 py-4 text-sm font-medium text-ink"
              >
                <span
                  className="size-1.5 shrink-0 rounded-full bg-signal"
                  aria-hidden="true"
                />
                {topic}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <SectionHeading
            align="left"
            eyebrow="Trust"
            title="Research should feel safe"
            description="We collect profile details only to match you with studies. You can review your profile and preferences at any time."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {joinMemberTrust.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-line bg-surface px-5 py-4"
              >
                <h3 className="font-semibold text-strong">{item.title}</h3>
                <p className="mt-1 text-sm leading-6 text-ink-soft">
                  {item.copy}
                </p>
              </div>
            ))}
            <p className="pt-1 text-sm text-muted sm:col-span-2">
              <Link
                to={paths.privacyPolicy}
                className="font-medium text-accent underline-offset-4 hover:underline"
              >
                Privacy Policy
              </Link>
              <span className="px-2 text-line" aria-hidden="true">
                ·
              </span>
              <Link
                to={paths.termsConditions}
                className="font-medium text-accent underline-offset-4 hover:underline"
              >
                Terms & Conditions
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <motion.div
          className="surface-gradient relative overflow-hidden rounded-[2rem] border border-brand-mid/30 px-6 py-16 text-center shadow-glow sm:px-12"
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration, ease: easePremium }}
        >
          <p className="text-xs font-semibold tracking-[0.22em] text-signal uppercase">
            Join the panel
          </p>
          <h2 className="font-display mt-4 text-4xl font-semibold text-balance text-strong sm:text-5xl">
            Your perspective counts.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-ink-soft">
            Join {brand.name}, complete your profile, and start receiving
            assigned surveys in your member dashboard.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {user ? null : (
              <Button asChild size="lg">
                <Link to={paths.join}>Join {brand.name}</Link>
              </Button>
            )}
            <Button asChild size="lg" variant="outline">
              <Link to={portalTo}>{portalLabel}</Link>
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
