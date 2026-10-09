import type { Metadata } from "next";
import { CaseStudyLayout } from "@/components/case-study-layout";
import { PreflightDemo } from "@/components/demos/preflight-demo";
import { caseStudy } from "@/lib/case-studies";

const study = caseStudy("import-preflight");

export const metadata: Metadata = {
  title: study.title.replace(/:$/, ""),
  description: study.oneLine,
  alternates: { canonical: "/work/import-preflight/" },
};

export default function Page() {
  return <CaseStudyLayout study={study} demo={<PreflightDemo />} />;
}
