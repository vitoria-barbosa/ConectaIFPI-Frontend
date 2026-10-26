import React, { useState } from "react";
import { Evento } from "../tipos";
import { usarAutenticacao } from "../contextos/ContextoAutenticacao";
import {
  ShieldCheck,
  PlusCircle,
  GraduationCap,
  Calendar,
  MapPin,
  Users,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

interface PaginaGestaoEventosProps {
  eventos: Evento[];
  aoAbrirNovoEvento: () => void;
  aoAbrirDelegar: (evento: Evento) => void;
  aoAbrirDetalhes: (evento: Evento) => void;
  aoEditarEvento: (evento: Evento) => void;
  aoExcluirEvento: (evento: Evento) => Promise<boolean>;
}

export const PaginaGestaoEventos: React.FC<PaginaGestaoEventosProps> = ({
  eventos,
  aoAbrirNovoEvento,
  aoAbrirDelegar,
  aoAbrirDetalhes,
  aoEditarEvento,
  aoExcluirEvento,
}) => {
  const { usuario } = usarAutenticacao();
  const [excluindoId, definirExcluindoId] = useState<string | null>(null);

  const meusEventos = eventos.filter(
    (e) =>
      e.organizadorId === usuario?.id ||
      e.organizadorEmail.toLowerCase() === usuario?.email.toLowerCase() ||
      e.coorganizadoresIds.includes(usuario?.id ?? ""),
  );
  const podeCriarEvento = usuario?.tipo === "servidor";

  const ehOrganizadorPrincipal = (evento: Evento) =>
    evento.organizadorId === usuario?.id ||
    evento.organizadorEmail.toLowerCase() === usuario?.email.toLowerCase();

  const excluirEvento = async (evento: Evento) => {
    if (
      !window.confirm(
        `Tem certeza de que deseja excluir o evento "${evento.nome}"?`,
      )
    ) {
      return;
    }

    definirExcluindoId(evento.id);
    try {
      await aoExcluirEvento(evento);
    } finally {
      definirExcluindoId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4 bg-white border border-[#E5E7EB] rounded-xl p-3.5 shadow-2xs flex items-center justify-between gap-3">
        <div>
          <h1 className="text-sm sm:text-base font-bold text-[#1F2937] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#27A344]" />
            Painel de Gestão
          </h1>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Gerencie os eventos que você organiza ou coorganiza
          </p>
        </div>

        {podeCriarEvento && (
          <button
            onClick={aoAbrirNovoEvento}
            className="px-3 py-1.5 bg-[#27A344] hover:bg-[#208337] text-white rounded-lg text-xs font-bold transition-colors shadow-2xs flex items-center gap-1 cursor-pointer shrink-0"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Novo Evento
          </button>
        )}
      </div>

      {meusEventos.length === 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-8 text-center shadow-2xs">
          <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <h3 className="text-xs font-bold text-gray-700">
            Nenhum evento disponível para gestão
          </h3>
          <p className="text-[11px] text-gray-500 mt-0.5 max-w-sm mx-auto">
            Você poderá gerenciar os eventos em que estiver como organizador ou
            coorganizador.
          </p>
          {podeCriarEvento && (
            <button
              onClick={aoAbrirNovoEvento}
              className="mt-3 px-3 py-1.5 bg-[#27A344] text-white rounded-lg text-xs font-bold hover:bg-[#208337] transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Cadastrar Evento
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
            Seus eventos ({meusEventos.length}):
          </p>

          <div className="grid grid-cols-1 gap-2.5">
            {meusEventos.map((evento) => (
              <div
                key={evento.id}
                className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="min-w-0 flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[9px] font-bold px-1.5 py-0.2 bg-gray-100 text-gray-600 rounded">
                        {evento.areaConhecimento}
                      </span>
                    </div>

                    <h3 className="font-bold text-xs sm:text-sm text-[#1F2937] truncate">
                      {evento.nome}
                    </h3>

                    <span className="flex items-center gap-0.5 text-[11px] text-gray-500 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#CD191E]" />
                      {evento.local}
                    </span>
                    <span className="flex items-center gap-0.5 text-[11px] text-gray-500 mt-0.5">
                      <Users className="w-3 h-3" />
                      {evento.coorganizadoresIds.length} coorganizadores
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 justify-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 md:justify-end">
                  <button
                    onClick={() => aoAbrirDetalhes(evento)}
                    className="px-2.5 py-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    Ver
                  </button>

                  <button
                    onClick={() => aoEditarEvento(evento)}
                    className="px-2.5 py-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Pencil className="w-3 h-3" />
                    Editar
                  </button>

                  {ehOrganizadorPrincipal(evento) && (
                    <button
                      onClick={() => aoAbrirDelegar(evento)}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#27A344] border border-emerald-300 rounded text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      Coorganizadores
                    </button>
                  )}

                  {ehOrganizadorPrincipal(evento) && (
                    <button
                      onClick={() => void excluirEvento(evento)}
                      disabled={Boolean(excluindoId)}
                      className="px-2.5 py-1 bg-red-50 border border-red-200 hover:bg-red-100 text-[#CD191E] rounded text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="w-3 h-3" />
                      {excluindoId === evento.id ? "Excluindo..." : "Excluir"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
