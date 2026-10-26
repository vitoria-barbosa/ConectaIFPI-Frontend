import React, { useState } from "react";
import { usarAutenticacao } from "../contextos/ContextoAutenticacao";
import { X, AlertCircle, MailCheck } from "lucide-react";

interface ModalAutenticacaoProps {
  aberto: boolean;
  aoFechar: () => void;
  aoConcluirLoginComSucesso?: () => void;
}

type Modo = "entrar" | "cadastrar";

export const ModalAutenticacao: React.FC<ModalAutenticacaoProps> = ({
  aberto,
  aoFechar,
  aoConcluirLoginComSucesso,
}) => {
  const { entrar, cadastrar } = usarAutenticacao();
  const [modo, definirModo] = useState<Modo>("entrar");

  const [nome, definirNome] = useState("");
  const [email, definirEmail] = useState("");
  const [senha, definirSenha] = useState("");

  const [erro, definirErro] = useState<string | null>(null);
  const [aviso, definirAviso] = useState<string | null>(null);
  const [carregando, definirCarregando] = useState(false);

  if (!aberto) return null;

  const limparFormulario = () => {
    definirNome("");
    definirEmail("");
    definirSenha("");
    definirErro(null);
    definirAviso(null);
  };

  const fechar = () => {
    limparFormulario();
    definirModo("entrar");
    aoFechar();
  };

  const alternarModo = (novoModo: Modo) => {
    definirModo(novoModo);
    definirErro(null);
    definirAviso(null);
  };

  const concluirComSucesso = () => {
    fechar();
    aoConcluirLoginComSucesso?.();
  };

  const lidarComSubmissao = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    definirErro(null);
    definirAviso(null);
    definirCarregando(true);

    try {
      if (modo === "entrar") {
        const res = await entrar(email, senha);
        if (res.sucesso) {
          concluirComSucesso();
        } else {
          definirErro(res.erro || "Falha ao entrar.");
        }
        return;
      }

      const res = await cadastrar({ nome, email, senha });

      if (!res.sucesso) {
        definirErro(res.erro || "Falha ao realizar cadastro.");
        return;
      }

      limparFormulario();
      definirModo("entrar");
      concluirComSucesso();
    } catch {
      definirErro("Não foi possível concluir a operação. Tente novamente.");
    } finally {
      definirCarregando(false);
    }
  };

  const classeAba = (ativa: boolean) =>
    `flex-1 py-2 text-center transition-colors cursor-pointer ${
      ativa
        ? "bg-white text-[#27A344] border-b-2 border-[#27A344]"
        : "text-gray-500 hover:text-gray-800"
    }`;

  const classeInput =
    "w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-[#27A344]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-3 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-sm w-full shadow-lg overflow-hidden my-4 animate-in fade-in duration-150">
        {/* Cabeçalho */}
        <div className="bg-[#27A344] text-white p-3.5 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm">
              {modo === "entrar"
                ? "Fazer login no ConectaIFPI"
                : "Fazer cadastro"}
            </h3>
          </div>
          <button
            type="button"
            onClick={fechar}
            aria-label="Fechar"
            className="p-1 rounded text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Abas */}
        <div className="flex border-b border-gray-200 bg-gray-50 text-xs font-bold">
          <button
            type="button"
            onClick={() => alternarModo("entrar")}
            className={classeAba(modo === "entrar")}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => alternarModo("cadastrar")}
            className={classeAba(modo === "cadastrar")}
          >
            Cadastrar
          </button>
        </div>

        <div className="p-4 text-xs">
          {erro && (
            <div
              role="alert"
              className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-[11px] text-[#CD191E] flex items-start gap-1.5"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{erro}</span>
            </div>
          )}

          {aviso && (
            <div
              role="status"
              className="mb-3 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-[#208337] flex items-start gap-1.5"
            >
              <MailCheck className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{aviso}</span>
            </div>
          )}

          <form onSubmit={lidarComSubmissao} className="space-y-2.5">
            {modo === "cadastrar" && (
              <div>
                <label
                  htmlFor="auth-nome"
                  className="block text-[11px] font-bold text-gray-700 mb-0.5"
                >
                  Nome Completo *
                </label>
                <input
                  id="auth-nome"
                  type="text"
                  required
                  minLength={3}
                  autoComplete="name"
                  value={nome}
                  onChange={(e) => definirNome(e.target.value)}
                  placeholder="Ex: Carlos Eduardo"
                  className={classeInput}
                />
              </div>
            )}

            <div>
              <label
                htmlFor="auth-email"
                className="block text-[11px] font-bold text-gray-700 mb-0.5"
              >
                E-mail *
              </label>
              <input
                id="auth-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => definirEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className={classeInput}
              />
              {modo === "cadastrar" && (
                <p className="mt-1 text-[10px] text-gray-500 leading-snug">
                  Estudantes: <strong>@aluno.ifpi.edu.br</strong> · Servidores:{" "}
                  <strong>@ifpi.edu.br</strong>. Outros e-mails serão
                  cadastrados como comunidade externa.
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="auth-senha"
                className="block text-[11px] font-bold text-gray-700 mb-0.5"
              >
                Senha *
              </label>
              <input
                id="auth-senha"
                type="password"
                required
                minLength={modo === "cadastrar" ? 6 : undefined}
                autoComplete={
                  modo === "entrar" ? "current-password" : "new-password"
                }
                value={senha}
                onChange={(e) => definirSenha(e.target.value)}
                placeholder="••••••••"
                className={classeInput}
              />
              {modo === "cadastrar" && (
                <p className="mt-1 text-[10px] text-gray-500">
                  Mínimo de 6 caracteres.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={carregando}
              className="w-full py-2 bg-[#27A344] hover:bg-[#208337] text-white rounded-lg text-xs font-bold transition-colors shadow-2xs cursor-pointer disabled:opacity-50 mt-1"
            >
              {carregando
                ? "Processando..."
                : modo === "entrar"
                  ? "Entrar"
                  : "Cadastrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
