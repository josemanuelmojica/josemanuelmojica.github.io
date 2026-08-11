type RealScoutWidgetSlotProps = {
  children?: React.ReactNode;
};

/**
 * Stable mount point for the verified RealScout HTML widget.
 * The real snippet should be adapted here after its markup and script contract
 * are provided; raw HTML is intentionally not injected before review.
 */
export function RealScoutWidgetSlot({ children }: RealScoutWidgetSlotProps) {
  return (
    <div id="realscout-widget" data-realscout-widget-mount>
      {children}
    </div>
  );
}
