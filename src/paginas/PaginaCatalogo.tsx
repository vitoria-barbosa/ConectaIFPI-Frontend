import React from "react";
import { Evento, AreaConhecimento } from "../tipos";
import { SecaoAcontecendoAgora } from "../componentes/SecaoAcontecendoAgora";
import { FiltroEventos } from "../componentes/FiltroEventos";
import { CardEvento } from "../componentes/CardEvento";
import { CalendarX } from "lucide-react";

interface PaginaCatalogoProps {
  eventos: Evento[];
  favoritos: string[];
  areaSelecionada: AreaConhecimento | "Todos";
  aoSelecionarArea: (area: AreaConhecimento | "Todos") => void;
  termoBusca: string;
  aoAlterarTermoBusca: (termo: string) => void;
  apenasMinhaAgenda: boolean;
  aoAlternarApenasMinhaAgenda: () => void;
  aoAlternarAgenda: (evento: Evento) => void;
  aoAbrirDetalhes: (evento: Evento) => void;
}

export const PaginaCatalogo: React.FC<PaginaCatalogoProps> = ({
  eventos,
  favoritos,
  areaSelecionada,
  aoSelecionarArea,
  termoBusca,
  aoAlterarTermoBusca,
  apenasMinhaAgenda,
  aoAlternarApenasMinhaAgenda,
  aoAlternarAgenda,
  aoAbrirDetalhes,
}) => {
  return (
    <div>
      <SecaoAcontecendoAgora
        eventos={eventos}
        aoSelecionarEvento={aoAbrirDetalhes}
      />

      <FiltroEventos
        areaSelecionada={areaSelecionada}
        aoSelecionarArea={aoSelecionarArea}
        termoBusca={termoBusca}
        aoAlterarTermoBusca={aoAlterarTermoBusca}
        apenasMinhaAgenda={apenasMinhaAgenda}
        aoAlternarApenasMinhaAgenda={aoAlternarApenasMinhaAgenda}
        totalFavoritos={favoritos.length}
        totalEncontrados={eventos.length}
      />

      {/* Lista de Eventos */}
      {eventos.length === 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-8 text-center shadow-2xs">
          <CalendarX className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <h3 className="text-xs font-bold text-gray-700">
            Nenhum evento encontrado
          </h3>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Tente limpar a busca ou selecionar outra área temática.
          </p>
          <button
            onClick={() => {
              aoSelecionarArea("Todos");
              aoAlterarTermoBusca("");
            }}
            className="mt-3 px-3 py-1.5 bg-[#27A344] text-white rounded-lg text-xs font-bold hover:bg-[#208337] transition-colors cursor-pointer"
          >
            Limpar Filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {eventos.map((evento) => (
            <CardEvento
              key={evento.id}
              evento={evento}
              salvoNaAgenda={favoritos.includes(evento.id)}
              aoAlternarAgenda={aoAlternarAgenda}
              aoAbrirDetalhes={aoAbrirDetalhes}
            />
          ))}
        </div>
      )}
    </div>
  );
};
