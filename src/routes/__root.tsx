import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: "#050816" }}>
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-white">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-white">Page introuvable</h2>
        <p className="mt-2 text-sm text-white/50">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #2563EB, #38BDF8)" }}
          >
            Accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: "#050816" }}>
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-white">
          Cette page n'a pas pu se charger
        </h1>
        <p className="mt-2 text-sm text-white/50">
          Une erreur s'est produite. Vous pouvez réessayer ou revenir à l'accueil.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #2563EB, #38BDF8)" }}
          >
            Réessayer
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            Accueil
          </a>
        </div>
      </div>
    </div>
  );
}

const siteUrl = "https://novabnisit.com";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "NOVA BNISIT — Solutions Numériques & IA" },
      { name: "description", content: "NOVA BNISIT conçoit des sites web premium, l'automatisation par IA, des chatbots intelligents et des solutions data-driven pour accélérer la croissance de votre entreprise." },
      { name: "author", content: "NOVA BNISIT" },
      { name: "theme-color", content: "#2563EB" },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "NOVA BNISIT — Solutions Numériques & IA" },
      { property: "og:description", content: "Solutions premium en IA, automatisation et web, conçues pour la croissance." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: siteUrl },
      { property: "og:site_name", content: "NOVA BNISIT" },
      { property: "og:image", content: `${siteUrl}/og-image.png` },
      { property: "og:locale", content: "fr_FR" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "NOVA BNISIT — Solutions Numériques & IA" },
      { name: "twitter:description", content: "Solutions premium en IA, automatisation et web." },
      { name: "twitter:image", content: `${siteUrl}/og-image.png` },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" },
      { rel: "canonical", href: siteUrl },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        {import.meta.env.VITE_GA_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GA_ID}`} />
            <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${import.meta.env.VITE_GA_ID}');` }} />
          </>
        )}
        <noscript>
          <div style={{ padding: "2rem", textAlign: "center", background: "#050816", color: "#fff", fontFamily: "system-ui" }}>
            <h2>JavaScript est requis</h2>
            <p>Veuillez activer JavaScript pour utiliser ce site.</p>
          </div>
        </noscript>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
