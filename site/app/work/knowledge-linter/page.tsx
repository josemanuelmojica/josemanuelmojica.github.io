import type { Metadata } from "next";
import { CaseStudyLayout } from "@/components/case-study-layout";
import { LinterDemo } from "@/components/demos/linter-demo";
import { caseStudy } from "@/lib/case-studies";

const study = caseStudy("knowledge-linter");

export const metadata: Metadata = {
  title: study.title.replace(/:$/, ""),
  description: study.oneLine,
  alternates: { canonical: "/work/knowledge-linter/" },
};

export default function Page() {
  return <CaseStudyLayout study={study} demo={<LinterDemo />} />;
}
