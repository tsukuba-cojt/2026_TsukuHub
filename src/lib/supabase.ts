import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabaseの環境変数が設定されていません。");
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    detectSessionInUrl: (url, params) =>
      !/\/auth\/reset-password\/?$/i.test(url.pathname) &&
      params.type !== "recovery" &&
      Boolean(params.access_token || params.error || params.error_description || params.error_code),
  },
});

let recoveryClientCount = 0;

export function createPasswordRecoveryAuth() {
  // Keep recovery credentials separate from the site's login session, including across tabs.
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storageKey: `tsukuhub-password-recovery-${++recoveryClientCount}`,
    },
  }).auth;
}
