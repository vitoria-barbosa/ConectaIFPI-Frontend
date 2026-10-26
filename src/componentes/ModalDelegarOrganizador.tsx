import React, { useEffect, useState } from "react";
import { Evento } from "../tipos";
import {
  adicionarCoorganizadorAoEvento,
  listarCoorganizadoresDoEvento,
  removerCoorganizadorDoEvento,
} from "../api/evento";
import { Coorganizador } from "../tipos";
import {
  X,
  UserPlus,
  ShieldCheck,
  AlertCircle,
  CheckCircle,
  GraduationCap,
  UserMinus,
} from "lucide-react";

interface ModalDelegarOrganizadorProps {
  aberto: boolean;
  aoFechar: () => void;
  evento: Evento;
  aoAtualizarEvento: (eventoAtualizado: Evento) => void;
}

export const ModalDelegarOrganizador: React.FC<
  ModalDelegarOrganizadorProps
> = ({ aberto, aoFechar, evento, aoAtualizarEvento }) => {
  const [emailEstudante, definirEmailEstudante] = useState("");
  const [carregando, definirCarregando] = useState(false);
  const [erro, definirErro] = useState<string | null>(null);
  const [sucesso, definirSucesso] = useState<string | null>(null);
  const [coorganizadores, definirCoorganizadores] = useState<Coorganizador[]>(
    [],
  );
  const [carregandoCoorganizadores, definirCarregandoCoorganizadores] =
    useState(false);
  const [idRemovendo, definirIdRemovendo] = useState<string | null>(null);
  const [erroLista, definirErroLista] = useState<string | null>(null);

  useEffect(() => {
    if (!aberto) return;

    let cancelado = false;
    definirCarregandoCoorganizadores(true);
    definirErroLista(null);
    listarCoorganizadoresDoEvento(evento.id)
      .then((res) => {
        if (cancelado) return;
        if (res.sucesso && res.coorganizadores) {
          definirCoorganizadores(res.coorganizadores);
        } else {
          definirErroLista(
            res.erro || "Não foi possível listar os coorganizadores.",
          );
        }
      })
      .finally(() => {
        if (!cancelado) definirCarregandoCoorganizadores(false);
      });

    return () => {
      cancelado = true;
    };
  }, [aberto, evento.id]);

  if (!aberto) return null;

  const lidarComAdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    definirErro(null);
    definirSucesso(null);

    const emailLimpo = emailEstudante.trim().toLowerCase();

    if (!emailLimpo.endsWith("@aluno.ifpi.edu.br")) {
      definirErro(
        "Somente alunos com e-mail institucional podem ser delegados como coorganizadores.",
      );
      return;
    }

    definirCarregando(true);
    const res = await adicionarCoorganizadorAoEvento(evento.id, emailLimpo);
    definirCarregando(false);

    if (res.sucesso && res.evento) {
      definirSucesso("Estudante adicionado à comissão organizadora.");
      definirEmailEstudante("");
      aoAtualizarEvento(res.evento);
      const resultadoLista = await listarCoorganizadoresDoEvento(evento.id);
      if (resultadoLista.sucesso && resultadoLista.coorganizadores) {
        definirCoorganizadores(resultadoLista.coorganizadores);
      } else {
        definirErroLista(
          resultadoLista.erro || "Não foi possível atualizar a lista.",
        );
      }
    } else {
      definirErro(res.erro || "Falha ao adicionar coorganizador.");
    }
  };

  const lidarComRemocao = async (coorganizador: Coorganizador) => {
    if (
      !window.confirm(`Remover ${coorganizador.nome} da comissão organizadora?`)
    ) {
      return;
    }

    definirIdRemovendo(coorganizador.id);
    definirErroLista(null);
    const resultado = await removerCoorganizadorDoEvento(
      evento.id,
      coorganizador.id,
    );
    definirIdRemovendo(null);

    if (!resultado.sucesso) {
      definirErroLista(
        resultado.erro || "Não foi possível remover o coorganizador.",
      );
      return;
    }

    definirCoorganizadores((atuais) =>
      atuais.filter((atual) => atual.id !== coorganizador.id),
    );
    aoAtualizarEvento({
      ...evento,
      coorganizadoresIds: evento.coorganizadoresIds.filter(
        (id) => id !== coorganizador.id,
      ),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-3">
      <div className="bg-white rounded-xl max-w-sm w-full shadow-lg border border-gray-100 overflow-hidden animate-in fade-in duration-150">
        <div className="bg-[#27A344] text-white p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <h3 className="font-bold text-xs sm:text-sm">
              Delegar Coorganizador
            </h3>
          </div>
          <button
            onClick={aoFechar}
            className="p-1 rounded text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 text-xs">
          <div className="mb-3 bg-gray-50 p-2 rounded-lg border border-gray-200">
            <p className="font-bold text-gray-800 text-xs truncate">
              {evento.nome}
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">
              Organizador: {evento.organizadorNome}
            </p>
          </div>

          {erro && (
            <div className="mb-2.5 p-2 bg-red-50 border border-red-200 rounded text-[#CD191E] flex items-start gap-1 text-[11px]">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{erro}</span>
            </div>
          )}

          {sucesso && (
            <div className="mb-2.5 p-2 bg-emerald-50 border border-emerald-200 rounded text-[#27A344] flex items-start gap-1 text-[11px]">
              <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{sucesso}</span>
            </div>
          )}

          {erroLista && (
            <div className="mb-2.5 p-2 bg-red-50 border border-red-200 rounded text-[#CD191E] flex items-start gap-1 text-[11px]">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{erroLista}</span>
            </div>
          )}

          <form onSubmit={lidarComAdicao} className="space-y-2.5">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-0.5">
                E-mail Institucional (@aluno.ifpi.edu.br) *
              </label>
              <input
                type="email"
                required
                value={emailEstudante}
                onChange={(e) => definirEmailEstudante(e.target.value)}
                placeholder="lucas.estudante@aluno.ifpi.edu.br"
                className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-[#27A344]"
              />
            </div>

            <button
              type="submit"
              disabled={carregando}
              className="w-full py-1.5 bg-[#27A344] hover:bg-[#208337] text-white rounded-lg font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1"
            >
              <UserPlus className="w-3.5 h-3.5" />
              {carregando ? "Concedendo..." : "Conceder Permissão"}
            </button>
          </form>

          {/* Coorganizadores Atuais */}
          <div className="mt-4 pt-2.5 border-t border-gray-200">
            <h4 className="font-bold text-gray-600 text-[11px] mb-1.5 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-[#27A344]" />
              Coorganizadores ({coorganizadores.length}):
            </h4>
            {carregandoCoorganizadores ? (
              <p className="text-gray-400 text-[11px]">Carregando...</p>
            ) : coorganizadores.length === 0 ? (
              <p className="text-gray-400 text-[11px] italic">
                Nenhum adicionado ainda.
              </p>
            ) : (
              <ul className="space-y-1">
                {coorganizadores.map((coorganizador) => (
                  <li
                    key={coorganizador.id}
                    className="p-1.5 bg-gray-50 rounded border border-gray-100 text-[10px] text-gray-700 flex items-center justify-between gap-2"
                  >
                    <span className="truncate">{coorganizador.nome}</span>
                    <button
                      type="button"
                      onClick={() => void lidarComRemocao(coorganizador)}
                      disabled={Boolean(idRemovendo)}
                      title={`Remover ${coorganizador.nome}`}
                      aria-label={`Remover ${coorganizador.nome}`}
                      className="shrink-0 p-1 text-[#CD191E] hover:bg-red-50 rounded disabled:opacity-50"
                    >
                      <UserMinus className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
