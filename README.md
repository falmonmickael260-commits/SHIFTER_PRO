# SHIFTER_PRO

Site du streamer/joueur Call of Duty SHIFTER_PRO — loader tactique, Hero, Live, Clips, Tournaments (SHIFTER_PRO26), Community, About, Business.

- **Stack** : React 19 + TypeScript + Vite, aucun framework CSS (design tokens maison dans `src/design/tokens.css`)
- **Live** : https://falmonmickael260-commits.github.io/SHIFTER_PRO/
- **Déploiement** : automatique via GitHub Actions (`.github/workflows/deploy.yml`) à chaque push sur `main`

## Lancer en local

```bash
npm install
npm run dev
```

## Build de production

```bash
npm run build   # tsc -b && vite build -> dist/
```

## Variables d'environnement

Copier `.env.example` en `.env.local` et remplir ce qui est disponible. Rien n'est obligatoire pour que le site fonctionne : chaque fonctionnalité (statut Twitch, inscriptions tournois, paiement) se dégrade proprement (affiche "à venir" / un message honnête) tant qu'elle n'est pas configurée — rien n'est jamais simulé.

## Inscriptions payantes aux tournois (PayPal + Supabase)

Aucun tournoi n'a de frais d'inscription pour l'instant (tous gratuits, cash prize reversé aux gagnants). L'infrastructure est prête pour le jour où un tournoi payant existera :

1. **Créer un projet Supabase** sur [supabase.com](https://supabase.com), récupérer son URL et sa clé anonyme (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
2. **Appliquer la migration** `supabase/migrations/0001_tournament_registrations.sql` (via `supabase db push` ou en collant le SQL dans l'éditeur SQL du dashboard).
3. **Déployer les Edge Functions** (`supabase functions deploy create-paypal-order capture-paypal-order paypal-webhook`).
4. **Créer une app PayPal** sur [developer.paypal.com](https://developer.paypal.com/dashboard/applications) (commencer en mode **Sandbox**, jamais directement en Live) pour obtenir un Client ID + Client Secret.
5. **Configurer un webhook PayPal** pointant vers `https://<ton-projet>.supabase.co/functions/v1/paypal-webhook`, événements `PAYMENT.CAPTURE.COMPLETED` et `PAYMENT.CAPTURE.DENIED` au minimum — récupérer le Webhook ID généré.
6. **Définir les secrets Supabase** (jamais dans ce dépôt) :
   ```bash
   supabase secrets set \
     PAYPAL_CLIENT_ID=... \
     PAYPAL_CLIENT_SECRET=... \
     PAYPAL_WEBHOOK_ID=... \
     PAYPAL_ENV=sandbox \
     SUPABASE_URL=... \
     SUPABASE_SERVICE_ROLE_KEY=...
   ```
7. **Tester intégralement en Sandbox** (comptes de test PayPal) avant de repasser `PAYPAL_ENV` à `live` et de créer une vraie app PayPal Live.
8. Une fois prêt, passer `entryFeeCents` (et `currency`) sur l'objet `next` donné à `<Tournaments />` (voir `src/sections/Tournaments.tsx`) — le bouton PayPal apparaît automatiquement dans le formulaire d'inscription.

Voir `.env.example` pour le détail de chaque variable et `supabase/functions/` pour le code serveur (création de commande, capture, vérification de signature webhook).
