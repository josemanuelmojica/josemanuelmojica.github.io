import type { Metadata } from "next";
import { RealScoutWidget } from "@/components/widgets/realscout-widget";
import { CameraStop } from "@/components/widgets/camera-stop";
import { Reveal } from "@/components/story/reveal";

export const metadata: Metadata = {
  title: "Home value",
  description: "Request a home value report through RealScout.",
};

export default function HomeValuePage() {
  return (
    <div className="mx-auto max-w-3xl px-5 pt-32 pb-16 md:px-10">
      <CameraStop place="washington-park" />
      <Reveal className="rounded-[2rem] border bg-paper p-6 shadow-[0_30px_80px_-40px_rgb(6_58_100_/_0.5)] md:p-10">
        <p className="eyebrow">Home value · via RealScout</p>
        <h1 className="mt-3 text-[clamp(2.4rem,5vw,4rem)] leading-[0.98] tracking-[-0.04em]">
          What is your place <span className="display-em text-deep">worth today?</span>
        </h1>
        <p className="mt-4 text-graphite">Enter an address to request a home value report. The form is RealScout&apos;s; what you submit goes to RealScout.</p>
        <div className="mt-8">
          <RealScoutWidget kind="home-value" label="RealScout home value report" />
        </div>
      </Reveal>
    </div>
  );
}
