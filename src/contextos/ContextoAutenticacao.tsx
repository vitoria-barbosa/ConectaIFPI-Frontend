import React, { createContext, useContext, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { TipoUsuario, Usuario } from "../tipos";
import { supabase } from "../config/supabaseClient";

interface Resultado {
  sucesso: boolean;
  erro?: string;
}

interface ContextoAutenticacaoTipo {
  usuario: Usuario | null;
  autenticado: boolean;
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<Resultado>;
  cadastrar: (dados: {
    nome: string;
    email: string;
    senha: string;
  }) => Promise<Resultado>;
  sair: () => Promise<void>;
  eventoPendenteFavoritar: string | null;
  definirEventoPendenteFavoritar: (eventoId: string | null) => void;
  modalAutenticacaoAberto: boolean;
  definirModalAutenticacaoAberto: (aberto: boolean) => void;
}

const ContextoAutenticacao = createContext<
  ContextoAutenticacaoTipo | undefined
>(undefined);

async function buscarUsuario(sessao: Session): Promise<Usuario | null> {
  const { data, error } = await supabase
    .from("usuarios")
    .select("id, nome, tipo")
    .eq("id", sessao.user.id)
    .single();

  if (error || !data) return null;

  const tipo = data.tipo as TipoUsuario;
  return {
    id: data.id,
    nome: data.nome,
    email: sessao.user.email ?? "",
    tipo,
  };
}

export const ProvedorAutenticacao: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [sessao, definirSessao] = useState<Session | null>(null);
  const [usuario, definirUsuario] = useState<Usuario | null>(null);
  const [carregando, definirCarregando] = useState<boolean>(true);
  const [eventoPendenteFavoritar, definirEventoPendenteFavoritar] = useState<
    string | null
  >(null);
  const [modalAutenticacaoAberto, definirModalAutenticacaoAberto] =
    useState<boolean>(false);

  // Acompanha a sessão. O Supabase restaura a sessão salva (evento
  // INITIAL_SESSION), renova o token e avisa sobre login/logout.
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      definirSessao(novaSessao);
      if (!novaSessao) {
        definirUsuario(null);
        definirCarregando(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Carrega o registro da tabela "usuario" quando há uma sessão.
  // Depende só do id para não recarregar a cada renovação de token.
  const idUsuarioLogado = sessao?.user.id;
  useEffect(() => {
    if (!sessao) return;

    let cancelado = false;

    buscarUsuario(sessao).then((u) => {
      if (cancelado) return;
      definirUsuario(u);
      definirCarregando(false);
    });

    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idUsuarioLogado]);

  const entrar = async (email: string, senha: string): Promise<Resultado> => {
    if (!email.trim() || !senha) {
      return { sucesso: false, erro: "Informe e-mail e senha." };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: senha,
    });

    if (error) {
      return { sucesso: false, erro: "E-mail ou senha inválidos." };
    }
    return { sucesso: true };
  };

  const cadastrar = async (dados: {
    nome: string;
    email: string;
    senha: string;
  }): Promise<Resultado> => {
    const nome = dados.nome.trim();
    const email = dados.email.trim().toLowerCase();

    if (nome.length < 3) {
      return { sucesso: false, erro: "Informe o nome completo." };
    }
    if (!email.includes("@")) {
      return { sucesso: false, erro: "Informe um e-mail válido." };
    }
    if (dados.senha.length < 6) {
      return {
        sucesso: false,
        erro: "A senha deve ter pelo menos 6 caracteres.",
      };
    }

    const { error } = await supabase.auth.signUp({
      email,
      password: dados.senha,
      options: { data: { nome } },
    });

    if (error) {
      return { sucesso: false, erro: error.message };
    }
    return { sucesso: true };
  };

  const sair = async () => {
    await supabase.auth.signOut();
    // O onAuthStateChange limpa o estado
  };

  return (
    <ContextoAutenticacao.Provider
      value={{
        usuario,
        autenticado: Boolean(usuario),
        carregando,
        entrar,
        cadastrar,
        sair,
        eventoPendenteFavoritar,
        definirEventoPendenteFavoritar,
        modalAutenticacaoAberto,
        definirModalAutenticacaoAberto,
      }}
    >
      {children}
    </ContextoAutenticacao.Provider>
  );
};

export function usarAutenticacao() {
  const contexto = useContext(ContextoAutenticacao);
  if (!contexto) {
    throw new Error(
      "usarAutenticacao deve ser usado dentro de um ProvedorAutenticacao",
    );
  }
  return contexto;
}
