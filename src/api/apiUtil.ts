import { supabase } from "../config/supabaseClient";

interface ResponseAPI<T> {
  sucesso: boolean;
  dados?: T;
  erro?: string;
  mensagem?: string;
}

const urlBaseApi = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export class ApiException extends Error {
  constructor(mensagem: string) {
    super(mensagem);
  }
}

async function obterCabecalhosUsuario(): Promise<Record<string, string>> {
  if (typeof window === "undefined") return {};
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw new ApiException("Não foi possível validar a sessão do usuário.");
  }
  if (data.session?.access_token) {
    return { Authorization: `Bearer ${data.session.access_token}` };
  } else {
    throw new ApiException("Não foi possível obter o token do usuário.");
  }
}

async function executarRequisicao<T>(
  caminho: string,
  opcoes: RequestInit,
  cabecalhosIniciais: Headers,
): Promise<T> {
  let resposta: Response;
  try {
    resposta = await fetch(`${urlBaseApi}/api${caminho}`, {
      ...opcoes,
      headers: cabecalhosIniciais,
    });
  } catch {
    throw new ApiException(
      "Não foi possível conectar à API. Verifique se o servidor está ativo.",
    );
  }

  let corpo: any;
  try {
    corpo = await resposta.json();
  } catch {
    if (resposta.ok) {
      return undefined as T;
    }
    throw new ApiException(
      "A API retornou uma resposta inválida. Status: " + resposta.status,
    );
  }

  if (!resposta.ok || (corpo && corpo.sucesso === false)) {
    throw new ApiException(
      corpo?.erro ||
        corpo?.mensagem ||
        `Não foi possível concluir a operação. Status: ${resposta.status}`,
    );
  }

  return corpo && "dados" in corpo ? corpo.dados : (corpo as T);
}

export async function requisitarApiSemCabecalho<T>(
  caminho: string,
  opcoes: RequestInit = {},
): Promise<T> {
  const cabecalhos = new Headers(opcoes.headers);
  if (!cabecalhos.has("Accept")) {
    cabecalhos.set("Accept", "application/json");
  }
  // Se houver um corpo e não foi definido o Content-Type, define como JSON
  if (
    opcoes.body &&
    !(typeof FormData !== "undefined" && opcoes.body instanceof FormData) &&
    !cabecalhos.has("Content-Type")
  ) {
    cabecalhos.set("Content-Type", "application/json");
  }

  return executarRequisicao<T>(caminho, opcoes, cabecalhos);
}

export async function requisitarApiComCabecalho<T>(
  caminho: string,
  opcoes: RequestInit = {},
): Promise<T> {
  const cabecalhos = new Headers(opcoes.headers);
  if (!cabecalhos.has("Accept")) {
    cabecalhos.set("Accept", "application/json");
  }
  // Se houver um corpo e não foi definido o Content-Type, define como JSON
  if (
    opcoes.body &&
    !(typeof FormData !== "undefined" && opcoes.body instanceof FormData) &&
    !cabecalhos.has("Content-Type")
  ) {
    cabecalhos.set("Content-Type", "application/json");
  }

  const cabecalhosUsuario = await obterCabecalhosUsuario();
  for (const [nome, valor] of Object.entries(cabecalhosUsuario)) {
    cabecalhos.set(nome, valor);
  }

  return executarRequisicao<T>(caminho, opcoes, cabecalhos);
}
