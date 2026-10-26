import React from "react";
import { Evento } from "../tipos";
import {
  eventoOcorreHoje,
  eventoAcontecendoAgora,
  resolverCaminhoFotoEvento,
} from "../api/evento";
import {
  CalendarDays,
  MapPin,
  Clock,
  Award,
  Bookmark,
  ExternalLink,
  Check,
} from "lucide-react";

interface CardEventoProps {
  evento: Evento;
  salvoNaAgenda: boolean;
  aoAlternarAgenda: (evento: Evento) => void;
  aoAbrirDetalhes: (evento: Evento) => void;
}

export const CardEvento: React.FC<CardEventoProps> = ({
  evento,
  salvoNaAgenda,
  aoAlternarAgenda,
  aoAbrirDetalhes,
}) => {
  const ocorreHoje = eventoOcorreHoje(
    evento.dataHoraInicio,
    evento.dataHoraTermino,
  );
  const estaAcontecendo = eventoAcontecendoAgora(
    evento.dataHoraInicio,
    evento.dataHoraTermino,
  );

  const estaEncerrado = new Date(evento.dataHoraTermino).getTime() < Date.now();

  const inscricoesAbertas =
    new Date(evento.dataHoraInicioInscricoes).getTime() <= Date.now() &&
    new Date(evento.dataHoraTerminoInscricoes).getTime() >= Date.now();

  const formatarDataHora = (iso: string) => {
    try {
      const data = new Date(iso);
      if (Number.isNaN(data.getTime())) return "Data não disponível";
      return data.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Data não disponível";
    }
  };

  return (
    <div className="group relative bg-white rounded-xl border transition-all duration-150 overflow-hidden flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 border-[#E5E7EB]">
      <a
        href="#"
        aria-label={`Ver detalhes do evento ${evento.nome}`}
        onClick={(e) => {
          e.preventDefault();
          aoAbrirDetalhes(evento);
        }}
        className="absolute inset-0 z-10 cursor-pointer rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#27A344]"
      />
      <div className="relative h-40 sm:h-44 w-full bg-gray-100 overflow-hidden pointer-events-none">
        <img
          src={resolverCaminhoFotoEvento(evento.fotoCapaUrl)}
          alt={evento.nome}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          loading="lazy"
        />
      </div>

      <div className="relative z-20 pointer-events-none p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <span className="inline-flex text-[11px] font-semibold text-[#1E5E26] bg-emerald-50 px-2 py-0.5 rounded-full mb-1.5">
            {evento.areaConhecimento}
          </span>

          <h3 className="font-bold text-sm text-[#1F2937] group-hover:text-[#27A344] transition-colors line-clamp-2 leading-snug">
            {evento.nome}
          </h3>

          <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
            {evento.descricao}
          </p>

          <div className="mt-2 space-y-1 text-[11px] text-gray-600">
            <p className="flex items-center gap-1.5">
              <CalendarDays className="w-3 h-3 text-gray-700 shrink-0" />
              <span>Início: {formatarDataHora(evento.dataHoraInicio)}</span>
            </p>
            <p className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-gray-700 shrink-0" />
              <span>Término: {formatarDataHora(evento.dataHoraTermino)}</span>
            </p>
            <p className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-[#CD191E] shrink-0" />
              <span className="text-gray-700 truncate">{evento.local}</span>
            </p>

            <p className="flex items-center gap-1.5">
              <Award className="w-3 h-3 text-amber-600 shrink-0" />
              <span>{evento.cargaHoraria}h</span>
            </p>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between gap-1.5 text-[11px]">
          <button
            onClick={() => aoAlternarAgenda(evento)}
            title={salvoNaAgenda ? "Salvo na agenda" : "Salvar na agenda"}
            className={`relative z-30 pointer-events-auto p-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
              salvoNaAgenda
                ? "bg-emerald-50 text-[#27A344] border border-[#27A344]/30"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-100 border border-transparent"
            }`}
          >
            {salvoNaAgenda ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#27A344]" />
                <span>Salvo</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5" />
                <span>Salvar</span>
              </>
            )}
          </button>

          {inscricoesAbertas && !estaEncerrado ? (
            <a
              href={evento.linkInscricaoSuap}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-30 pointer-events-auto py-1 px-2 bg-[#27A344] hover:bg-[#208337] text-white rounded-lg font-bold transition-colors flex items-center gap-1 cursor-pointer"
              title="Inscrever-se pelo SUAP oficial"
            >
              Inscrever-se <ExternalLink className="w-3 h-3" />
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
};
