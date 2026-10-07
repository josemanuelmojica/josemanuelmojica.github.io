import { Hero } from "@/components/story/hero";
import { ReadAPlace } from "@/components/story/read-a-place";
import { Chapters } from "@/components/story/chapters";
import { HighlightList } from "@/components/story/highlight-list";
import { FieldNotes } from "@/components/story/field-notes";
import { Questions } from "@/components/story/questions";
import { Closing } from "@/components/story/closing";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ReadAPlace />
      <Chapters />
      <HighlightList />
      <FieldNotes />
      <Questions />
      <Closing />
    </>
  );
}
