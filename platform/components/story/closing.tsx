import Link from "next/link";
import { ArrowUpRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "./reveal";

export function Closing() {
  return (
    <section aria-labelledby="closing-title" className="relative px-5 py-24 md:px-10">
      <Reveal className="mx-auto max-w-3xl rounded-[2rem] bg-paper/95 p-10 text-center shadow-[0_30px_80px_-40px_rgb(6_58_100_/_0.5)]">
        <h2 id="closing-title" className="text-[clamp(2.4rem,6vw,4.8rem)] leading-[0.98] tracking-[-0.04em]">
          Find the home <span className="display-em block text-deep">inside the place.</span>
        </h2>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="h-12 rounded-xl px-6">
            <Link href="/search/">Search live listings <ArrowUpRight aria-hidden="true" /></Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 rounded-xl px-6">
            <Link href="/home-value/"><Home aria-hidden="true" /> What is my home worth?</Link>
          </Button>
        </div>
      </Reveal>
    </section>
  );
}
