import type { Metadata } from "next";
import { CaseStudyLayout } from "@/components/case-study-layout";
import { PrivacyDemo } from "@/components/demos/privacy-demo";
import { caseStudy } from "@/lib/case-studies";

const study = caseStudy("privacy-gate");

export const metadata: Metadata = {
  title: study.title.replace(/:$/, ""),
  description: study.oneLine,
  alternates: { canonical: "/work/privacy-gate/" },
};

export default function Page() {
  return <CaseStudyLayout study={study} demo={<PrivacyDemo />} />;
}
