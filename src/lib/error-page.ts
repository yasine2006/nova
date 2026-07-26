export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <title>Cette page n'a pas pu se charger</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #050816; color: #fff; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
      p { color: rgba(255,255,255,0.5); margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.5rem 1rem; border-radius: 0.75rem; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: linear-gradient(135deg, #2563EB, #38BDF8); color: #fff; }
      .secondary { background: rgba(255,255,255,0.05); color: #fff; border-color: rgba(255,255,255,0.15); }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Cette page n'a pas pu se charger</h1>
      <p>Une erreur s'est produite. Vous pouvez réessayer ou revenir à l'accueil.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Réessayer</button>
        <a class="secondary" href="/">Accueil</a>
      </div>
    </div>
  </body>
</html>`;
}
