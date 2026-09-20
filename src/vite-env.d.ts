/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_PAYPAL_CLIENT_ID?: string;
  readonly VITE_PAYPAL_ENV?: "sandbox" | "live";
  readonly VITE_TWITCH_CLIENT_ID?: string;
  readonly VITE_DISCORD_INVITE_URL?: string;
  readonly VITE_BUSINESS_CONTACT_EMAIL?: string;
  readonly VITE_WEB3FORMS_ACCESS_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
