import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "";

const supabaseEstaConfigurado = Boolean(supabaseUrl && supabaseAnonKey);

let clienteSupabaseServidor: SupabaseClient;

if (supabaseEstaConfigurado) {
  try {
    clienteSupabaseServidor = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    throw new Error("[Supabase Servidor]: Erro ao inicializar cliente");
  }
} else {
  throw new Error(
    "[Supabase Servidor]: Variáveis de ambiente SUPABASE_URL e SUPABASE_ANON_KEY não configuradas",
  );
}

export const supabase = clienteSupabaseServidor;
