/**
 * Logo variants:
 *  full  — horizontal "bWinALOTT.com" wordmark (navbar, auth pages, footer)
 *  icon  — square ticket icon (favicon, loading screens, small contexts)
 */
export default function Logo({ variant = 'full', className = '', height }) {
  const src   = variant === 'icon' ? '/logo-icon.png' : '/logo-full.png';
  const alt   = 'bWinALOTT';
  const style = height ? { height, width: 'auto' } : {};

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      draggable={false}
    />
  );
}
