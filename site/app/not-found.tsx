import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="mx-auto max-w-xl px-6 py-40 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 text-5xl tracking-tight">Off the map.</h1>
      <Link href="/" className="mt-8 inline-block text-blue underline underline-offset-4">Back home</Link>
    </main>
  );
}
