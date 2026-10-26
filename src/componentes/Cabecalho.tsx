import React from "react";
import { usarAutenticacao } from "../contextos/ContextoAutenticacao";
import { LogIn, LogOut, ShieldCheck } from "lucide-react";

interface CabecalhoProps {
  irParaInicio: () => void;
  modoGestaoAtivo?: boolean;
  podeAcessarGestao?: boolean;
  aoAlternarModoGestao?: () => void;
}

export const Cabecalho: React.FC<CabecalhoProps> = ({
  irParaInicio: irParaInicio,
  modoGestaoAtivo,
  podeAcessarGestao,
  aoAlternarModoGestao,
}) => {
  const { usuario, autenticado, sair, definirModalAutenticacaoAberto } =
    usarAutenticacao();
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E5E7EB] shadow-2xs">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={irParaInicio}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
          title="ConectaIFPI - Página Inicial"
        >
          <div className="w-8 h-8 rounded-lg bg-[#2F9E41] flex items-center justify-center p-1.5 shadow-xs group-hover:bg-[#1E5E26] transition-colors">
            <div className="grid grid-cols-2 gap-0.5 w-full h-full">
              <div className="bg-[#CD191E] rounded-xs" />
              <div className="bg-white rounded-xs" />
              <div className="bg-white rounded-xs" />
              <div className="bg-white rounded-xs" />
            </div>
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-[#1F2937]">
              Conecta<span className="text-[#2F9E41]">IFPI</span>
            </span>
          </div>
        </button>

        {/* Ações do Usuário e Servidor */}
        <div className="flex items-center gap-2">
          {podeAcessarGestao && (
            <>
              <button
                onClick={aoAlternarModoGestao}
                className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors flex items-center gap-1 cursor-pointer bg-emerald-50 text-[#27A344] border-emerald-300`}
                title="Alternar entre vitrine e painel de gestão de eventos"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="inline">
                  {modoGestaoAtivo ? "Eventos" : "Gestão"}
                </span>
              </button>
            </>
          )}

          {autenticado && usuario ? (
            <div className="flex items-center gap-1.5 pl-1.5 border-l border-gray-200">
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-[#27A344] flex items-center justify-center font-bold text-xs border border-emerald-200 shrink-0">
                  {usuario.nome.charAt(0)}
                </div>
                <div className="hidden sm:block text-left text-xs leading-none">
                  <p className="font-bold text-[#1F2937] max-w-30 truncate">
                    {usuario.nome}
                  </p>
                  <p className="text-[10px] text-gray-500 capitalize mt-0.5">
                    {usuario.tipo === "servidor"
                      ? "Servidor"
                      : usuario.tipo === "aluno"
                        ? "Aluno IFPI"
                        : "Participante"}
                  </p>
                </div>
              </div>

              <button
                onClick={sair}
                title="Sair da conta"
                className="p-1.5 text-gray-400 hover:text-[#CD191E] hover:bg-red-50 rounded-md transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => definirModalAutenticacaoAberto(true)}
              className="bg-white border border-[#27A344] text-[#27A344] hover:bg-[#27A344] hover:text-white transition-colors text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              Entrar
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
