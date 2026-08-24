import type { NextConfig } from "next";

/**
 * Polityka bezpieczeństwa treści.
 *
 * Wdrażamy ją najpierw w trybie „tylko raportuj": strona ładuje Google
 * Analytics, widżet paczkomatów InPost, Firebase i statystyki Vercela, więc
 * natychmiastowe egzekwowanie mogłoby zablokować działające elementy sklepu.
 * W trybie raportowania przeglądarka zgłasza naruszenia w konsoli, nic nie
 * blokując — po sprawdzeniu logów wystarczy zamienić nazwę nagłówka na
 * `Content-Security-Policy`.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  // `unsafe-inline` i `unsafe-eval` są wymagane przez skrypty Next.js
  // i osadzony fragment Google Analytics.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://apis.google.com https://geowidget.inpost.pl https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://geowidget.inpost.pl",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: data:",
  // Usuwanie tła działa w Web Workerze na plikach blob.
  "worker-src 'self' blob:",
  "connect-src 'self' blob: data: https://*.googleapis.com https://*.google-analytics.com https://*.firebaseio.com https://firebasestorage.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://geowidget.inpost.pl https://api.inpost.pl https://vitals.vercel-insights.com https://*.vercel-insights.com",
  // Okno logowania Google i widżet paczkomatów.
  "frame-src 'self' https://apis.google.com https://*.firebaseapp.com https://accounts.google.com https://geowidget.inpost.pl",
  "form-action 'self' https://secure.przelewy24.pl https://sandbox.przelewy24.pl",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "Content-Security-Policy-Report-Only", value: contentSecurityPolicy },
];

/** Strony konta i panelu nie mają prawa trafić do wyników wyszukiwania ani do cache. */
const privateHeaders = [
  { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
  { key: "Cache-Control", value: "no-store, private" },
];

/**
 * Natywna biblioteka `sharp` (kompresja arkuszy dołączanych do maili) ładuje
 * plik `libvips-cpp.so` z osobnej paczki `@img/sharp-libvips-*`. Śledzenie
 * plików Next.js nie widzi tej zależności, bo binarka wciąga ją dopiero
 * w trakcie `dlopen` — w efekcie na Vercelu `sharp` wywalał się z
 * `ERR_DLOPEN_FAILED: libvips-cpp.so...: cannot open shared object file`,
 * a maile do sklepu szły z nieskompresowanymi arkuszami (22 MB zamiast 4 MB)
 * i Brevo odrzucało je jako za duże. Dlatego wskazujemy te pliki ręcznie.
 *
 * Katalogi dla innych systemów po prostu nie istnieją w danej instalacji —
 * wzorzec, który nic nie dopasuje, jest pomijany bez błędu.
 */
const SHARP_NATIVE_FILES = [
  "./node_modules/@img/**/*",
  "./node_modules/sharp/**/*",
];

const nextConfig: NextConfig = {
  // Trasy, które kompresują obrazy: webhooki i cron (załączniki do maili),
  // checkout (akcja `createOrder`), panel (ponowna wysyłka powiadomień)
  // oraz `/api/compress-png` wołane z kreatora.
  outputFileTracingIncludes: {
    "/api": SHARP_NATIVE_FILES,
    "/checkout": SHARP_NATIVE_FILES,
    "/admin": SHARP_NATIVE_FILES,
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        source: "/konto/:path*",
        headers: privateHeaders,
      },
      {
        source: "/admin/:path*",
        headers: privateHeaders,
      },
      {
        source: "/logowanie",
        headers: privateHeaders,
      },
      {
        source: "/rejestracja",
        headers: privateHeaders,
      },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "15mb",
    },
  },
  allowedDevOrigins: ["192.168.1.96", "localhost:3000"],
};

export default nextConfig;
