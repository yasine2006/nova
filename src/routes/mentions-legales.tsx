import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/mentions-legales")({
  head: () => ({
    meta: [
      {
        name: "description",
        content:
          "Mentions légales du site NOVA BNISIT — Informations juridiques, conditions d'utilisation et politique de confidentialité.",
      },
      { title: "Mentions Légales — NOVA BNISIT" },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Mentions Légales — NOVA BNISIT" },
      {
        property: "og:description",
        content:
          "Informations juridiques et conditions d'utilisation du site NOVA BNISIT.",
      },
      { name: "twitter:title", content: "Mentions Légales — NOVA BNISIT" },
      {
        name: "twitter:description",
        content: "Informations juridiques et conditions d'utilisation.",
      },
    ],
  }),
  component: MentionsLegales,
});

function MentionsLegales() {
  return (
    <div className="min-h-screen px-6 py-24" style={{ background: "#050816" }}>
      <div className="mx-auto max-w-3xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors mb-10"
        >
          <ArrowLeft size={16} /> Retour à l'accueil
        </Link>
        <h1 className="text-3xl font-extrabold text-white mb-8">
          Mentions Légales
        </h1>

        <div className="space-y-8 text-white/60 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-white mb-3">
              1. Éditeur du site
            </h2>
            <p>
              NOVA BNISIT — Solutions numériques et intelligence artificielle.
            </p>
            <p>Siège social : Khenifra, Maroc.</p>
            <p>Email : novabnisit@gmail.com</p>
            <p>Téléphone : +212 6 13 61 26 18</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">2. Hébergeur</h2>
            <p>Ce site est hébergé par Lovable (lovable.dev).</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">
              3. Propriété intellectuelle
            </h2>
            <p>
              L'ensemble du contenu de ce site (textes, images, graphismes,
              logos, icônes, logiciels) est la propriété exclusive de NOVA
              BNISIT ou de ses partenaires et est protégé par les lois
              algériennes et internationales relatives à la propriété
              intellectuelle.
            </p>
            <p>
              Toute reproduction, représentation, modification, publication,
              transmission ou dénaturation du site ou de son contenu, par
              quelque procédé que ce soit, est interdite sans autorisation
              préalable écrite.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">
              4. Données personnelles
            </h2>
            <p>
              Les informations recueillies via le formulaire de contact sont
              destinées exclusivement à NOVA BNISIT pour le traitement de votre
              demande. Conformément à la loi 18-07 relative à la protection des
              personnes physiques dans le traitement des données à caractère
              personnel, vous disposez d'un droit d'accès, de rectification et
              de suppression de vos données.
            </p>
            <p>
              Pour exercer ce droit, contactez-nous à : novabnisit@gmail.com
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">5. Cookies</h2>
            <p>
              Ce site peut utiliser des cookies techniques nécessaires à son
              fonctionnement. Aucun cookie publicitaire ou de tracking n'est
              utilisé sans votre consentement explicite.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">
              6. Limitation de responsabilité
            </h2>
            <p>
              NOVA BNISIT s'efforce de fournir des informations aussi précises
              que possible sur ce site. Toutefois, elle ne saurait être tenue
              pour responsable des omissions, des inexactitudes et des carences
              dans la mise à jour.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">
              7. Droit applicable
            </h2>
            <p>
              Les présentes mentions légales sont régies par le droit marocain.
              En cas de litige, les tribunaux compétents de Khenifra seront
              seuls compétents.
            </p>
          </section>
        </div>

        <p className="mt-12 text-xs text-white/25">
          Dernière mise à jour : juillet 2026
        </p>
      </div>
    </div>
  );
}
