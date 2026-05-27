import { useEffect, useRef, useState } from 'react';

const HOSTED_BUTTON_ID = 'APNT6APDRC7F8';
const CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || '';
const SDK_URL = CLIENT_ID
  ? `https://www.paypal.com/sdk/js?client-id=${CLIENT_ID}&components=hosted-buttons`
  : '';

function loadPayPalScript() {
  return new Promise((resolve, reject) => {
    const existing = document.getElementById('paypal-sdk-script');
    if (existing) {
      if (window.paypal) resolve();
      else existing.addEventListener('load', resolve);
      existing.addEventListener('error', reject);
      return;
    }
    const script = document.createElement('script');
    script.id = 'paypal-sdk-script';
    script.src = SDK_URL;
    script.crossOrigin = 'anonymous';
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function PayPalHostedButton({ className = '' }) {
  const containerRef = useRef(null);
  const [state, setState] = useState('idle'); // idle | loading | ready | error | no-key

  useEffect(() => {
    if (!CLIENT_ID) { setState('no-key'); return; }
    if (!containerRef.current) return;

    let cancelled = false;
    setState('loading');

    loadPayPalScript()
      .then(() => {
        if (cancelled || !containerRef.current) return;
        // Clear any previous render before mounting again
        containerRef.current.innerHTML = '';
        return window.paypal
          .HostedButtons({ hostedButtonId: HOSTED_BUTTON_ID })
          .render(containerRef.current);
      })
      .then(() => { if (!cancelled) setState('ready'); })
      .catch(() => { if (!cancelled) setState('error'); });

    return () => { cancelled = true; };
  }, []);

  if (state === 'no-key') {
    return (
      <div className={`text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 ${className}`}>
        PayPal not configured — add VITE_PAYPAL_CLIENT_ID to Frontend/.env
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className={`text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 ${className}`}>
        PayPal failed to load. Check your internet connection and try refreshing.
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {state === 'loading' && (
        <div className="flex items-center justify-center gap-2 py-3 text-xs text-gray-400">
          <span className="w-3.5 h-3.5 border-2 border-gray-300 border-t-[#003087] rounded-full animate-spin" />
          Loading PayPal…
        </div>
      )}
      <div ref={containerRef} style={{ minHeight: state === 'loading' ? 0 : undefined }} />
    </div>
  );
}
