import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-6 pt-40 pb-24 text-center">
      <p className="eyebrow">Off the map</p>
      <h1 className="mt-3 text-5xl tracking-tight">This page <span className="display-em">isn&apos;t drawn yet.</span></h1>
      <Link href="/" className="mt-8 inline-block text-blue underline underline-offset-4">Back to the story</Link>
    </div>
  );
}
