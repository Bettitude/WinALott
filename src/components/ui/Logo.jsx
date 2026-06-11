/**
 * Logo variants:
 *  full  — horizontal "bWinALOTT.com" wordmark (navbar, auth pages, footer)
 *  icon  — square ticket icon (loading screens, small contexts)
 *
 * Both source PNGs are 1080×1080 squares with ~33% transparent padding on
 * every side. The "full" variant compensates by rendering the image at ~3×
 * the requested height inside a clipped container so the actual text fills
 * the requested height. The "icon" variant is roughly full-bleed so no crop.
 */
export default function Logo({ variant = 'full', className = '', height }) {
  const isIcon = variant === 'icon';
  const src = isIcon
    ? '/bwinalott-icon.png'
    : '/bwinalott-logo.png';

  if (!height) {
    return <img src={src} alt="bWinALOTT" className={className} draggable={false} />;
  }

  if (isIcon) {
    return (
      <img
        src={src}
        alt="bWinALOTT"
        className={className}
        style={{ height, width: 'auto' }}
        draggable={false}
      />
    );
  }

  // The inscription wordmark PNG has ~33% transparent whitespace on all sides.
  // Render it at 3.1× the target height inside a clipped flex container so the
  // text art fills exactly `height` pixels.
  const scaledH = Math.round(height * 3.1);

  return (
    <div
      className={className}
      style={{
        height,
        overflow: 'hidden',
        display: 'inline-flex',
        alignItems: 'center',
        flexShrink: 0,
      }}
    >
      <img
        src={src}
        alt="bWinALOTT"
        style={{ height: scaledH, width: 'auto', flexShrink: 0 }}
        draggable={false}
      />
    </div>
  );
}
