import React from "react";
import { AreaConhecimento } from "../tipos";
import { Search, Bookmark } from "lucide-react";

interface FiltroEventosProps {
  areaSelecionada: AreaConhecimento | "Todos";
  aoSelecionarArea: (area: AreaConhecimento | "Todos") => void;
  termoBusca: string;
  aoAlterarTermoBusca: (termo: string) => void;
  apenasMinhaAgenda?: boolean;
  aoAlternarApenasMinhaAgenda?: () => void;
  totalFavoritos?: number;
  totalEncontrados: number;
}

const AREAS_CONHECIMENTO: (AreaConhecimento | "Todos")[] = [
  "Tecnologia",
  "Gestão",
  "Licenciaturas",
  "Indústria",
  "Saúde",
  "Cultura",
  "Outro",
];

export const FiltroEventos: React.FC<FiltroEventosProps> = ({
  areaSelecionada,
  aoSelecionarArea,
  termoBusca,
  aoAlterarTermoBusca,
  apenasMinhaAgenda,
  aoAlternarApenasMinhaAgenda,
  totalFavoritos = 0,
  totalEncontrados,
}) => {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 mb-4 shadow-2xs space-y-2.5">
      {/* Campo de Busca Compacto */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={termoBusca}
          onChange={(e) => aoAlterarTermoBusca(e.target.value)}
          placeholder="Buscar por título, local ou tema..."
          className="w-full pl-8 pr-3 py-1.5 bg-[#F8FAFC] border border-gray-200 rounded-lg text-[11px] text-[#1F2937] placeholder-gray-400 focus:outline-none focus:border-[#27A344] focus:bg-white transition-colors"
        />
        {termoBusca && (
          <button
            onClick={() => aoAlterarTermoBusca("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-gray-400 hover:text-gray-700 cursor-pointer"
          >
            ×
          </button>
        )}
      </div>

      {/* Chips de Área de Conhecimento */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
        {AREAS_CONHECIMENTO.map((area) => {
          const selecionado = areaSelecionada === area;
          return (
            <button
              key={area}
              onClick={() => aoSelecionarArea(area)}
              className={`px-2.5 py-1 rounded-md font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selecionado
                  ? "bg-[#27A344] text-white shadow-2xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {area}
            </button>
          );
        })}
      </div>

      {/* Filtro da agenda pessoal e quantidade de resultados */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 pt-2 border-t border-gray-100 text-[11px]">
        <div className="flex flex-wrap items-center gap-1.5">
          {aoAlternarApenasMinhaAgenda && (
            <button
              onClick={aoAlternarApenasMinhaAgenda}
              className={`flex items-center gap-1 px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                apenasMinhaAgenda
                  ? "bg-emerald-50 border-[#27A344] text-[#27A344] font-bold"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Bookmark className="w-3 h-3" />
              Minha Agenda {totalFavoritos > 0 && `(${totalFavoritos})`}
            </button>
          )}
        </div>

        <span className="text-gray-400 font-medium">
          {totalEncontrados} {totalEncontrados === 1 ? "evento" : "eventos"}
        </span>
      </div>
    </div>
  );
};
