import type { Metadata } from "next";
import { IntakeModule } from "@/components/widgets/intake-module";
import { CameraStop } from "@/components/widgets/camera-stop";
import { Reveal } from "@/components/story/reveal";

export const metadata: Metadata = {
  title: "Live listings",
  description: "Search live REColorado listings through RealScout, over an editorial map of Denver.",
};

export default function SearchPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-5 pt-32 pb-16 md:px-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <CameraStop place="denver" />
      <Reveal className="self-start rounded-2xl bg-paper/90 p-6 backdrop-blur lg:sticky lg:top-28">
        <p className="eyebrow">Denver &amp; the Front Range</p>
        <h1 className="mt-3 text-[clamp(2.6rem,5.5vw,4.6rem)] leading-[0.95] tracking-[-0.04em]">
          Live listings, <span className="display-em block text-deep">drawn in place.</span>
        </h1>
        <p className="mt-5 text-graphite">
          The map behind this page stays with you. Search on the right, then use <strong className="font-medium text-ink">Explore map</strong> to read the streets around anything that catches your eye.
        </p>
      </Reveal>
      <IntakeModule />
    </div>
  );
}
