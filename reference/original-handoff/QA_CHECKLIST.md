# Acceptance checklist

## Structure

- [ ] One route and one uninterrupted vertical document.
- [ ] Exactly eight location chapters in the collection order.
- [ ] No tabs, carousel, pagination, cards, or mandatory scroll snapping.
- [ ] Opening, chapters, and attribution remain useful without JavaScript animation.

## Visual

- [ ] Every map uses the same Japanese Ink palette.
- [ ] No city names, coordinates, country labels, or attribution are burned into map images.
- [ ] Visible copy matches `COPY_DECK.md`.
- [ ] Vermilion appears only as the seal/arterial accent.
- [ ] No generic gradients, glass panels, rounded dashboard cards, or replacement map imagery.

## Motion

- [ ] Scroll down and scroll up both produce deterministic reversible movement.
- [ ] Outgoing streets gather toward the same seal point from which incoming streets emerge.
- [ ] Roads return to exact home transforms.
- [ ] The visual never flashes blank between chapters.
- [ ] Final chapter settles and holds instead of transitioning to an empty ninth layer.

## Performance

- [ ] Live page loads only `baseUrl`, `activeOverlayUrl`, and `activeMetadataUrl`.
- [ ] `.motion.svg`, `.overlay.svg`, and `.pieces.json` never appear in network requests.
- [ ] No more than two studies are mounted simultaneously.
- [ ] One scroll listener and one animation-frame loop.
- [ ] Mobile uses no more than 100 moving wrappers.
- [ ] Study 01 is eager; later studies are progressively prefetched.

## Responsive and input

- [ ] No horizontal overflow at 390, 768, 1024, and 1440 px widths.
- [ ] Trackpad, mouse wheel, touch, Page Up/Down, Home/End, and scrollbar all work normally.
- [ ] Mobile uses `100dvh` and readable bottom copy.
- [ ] Rotation and resize recalculate chapter spans without jumping to another location.

## Accessibility

- [ ] One `h1` and eight ordered `h2` location headings.
- [ ] Overlay SVGs are `aria-hidden`; map bases have meaningful accessible descriptions.
- [ ] OpenStreetMap attribution is visible.
- [ ] Reduced motion removes road translation and retains a short base crossfade.
- [ ] Copy contrast and keyboard focus meet WCAG AA.

## Failure behavior

- [ ] Blocking an overlay request leaves the base map visible.
- [ ] Blocking metadata leaves the overlay at home and the story scrollable.
- [ ] Failed assets do not trigger repeated requests on every scroll frame.
