import React from "react";
import { Evento } from "../tipos";
import { eventoAcontecendoAgora } from "../api/evento";
import { Clock, MapPin, ArrowRight } from "lucide-react";

interface SecaoAcontecendoAgoraProps {
  eventos: Evento[];
  aoSelecionarEvento: (evento: Evento) => void;
}

export const SecaoAcontecendoAgora: React.FC<SecaoAcontecendoAgoraProps> = ({
  eventos,
  aoSelecionarEvento,
}) => {
  const emAndamento = eventos.filter((e) =>
    eventoAcontecendoAgora(e.dataHoraInicio, e.dataHoraTermino),
  );

  const agora = new Date().getTime();
  const proximosEventos = eventos
    .filter((e) => new Date(e.dataHoraInicio).getTime() > agora)
    .sort(
      (a, b) =>
        new Date(a.dataHoraInicio).getTime() -
        new Date(b.dataHoraInicio).getTime(),
    );
  const proximo = proximosEventos[0];

  const formatarHora = (data: Date) => {
    if (Number.isNaN(data.getTime())) return "--:--";
    return data.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatarDataHora = (iso: string) => {
    const data = new Date(iso);
    if (Number.isNaN(data.getTime())) return "Data não disponível";

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);
    const diaEvento = new Date(data);
    diaEvento.setHours(0, 0, 0, 0);

    let dia: string;
    if (diaEvento.getTime() === hoje.getTime()) {
      dia = "Hoje";
    } else if (diaEvento.getTime() === amanha.getTime()) {
      dia = "Amanhã";
    } else {
      dia = data.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: data.getFullYear() !== hoje.getFullYear() ? "numeric" : undefined,
      });
    }

    return `${dia}, ${formatarHora(data)}`;
  };

  if (emAndamento.length === 0 && !proximo) return null;

  return (
    <section className="mb-4">
      {emAndamento.length > 0 ? (
        <div className="bg-white border border-[#27A344] rounded-xl p-3 shadow-2xs">
          <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-gray-100">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#27A344]" />
              </span>
              <h2 className="text-xs font-bold text-[#1F2937] uppercase tracking-wide">
                Acontecendo Agora no Campus
              </h2>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-[#27A344] rounded-full border border-emerald-200">
              Ao Vivo
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {emAndamento.map((evento) => (
              <div
                key={evento.id}
                onClick={() => aoSelecionarEvento(evento)}
                className="bg-[#F8FAFC] hover:bg-emerald-50/60 transition-colors rounded-lg p-2.5 border border-gray-200 cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-bold px-1.5 py-0.2 bg-[#27A344] text-white rounded">
                      {evento.areaConhecimento}
                    </span>
                    <span className="text-[10px] text-[#CD191E] font-semibold flex items-center gap-0.5">
                      <Clock className="w-3 h-3" />
                      até {formatarDataHora(evento.dataHoraTermino)}
                    </span>
                  </div>
                  <h3 className="font-bold text-xs text-[#1F2937] truncate hover:text-[#27A344]">
                    {evento.nome}
                  </h3>
                  <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                    <MapPin className="w-3 h-3 text-[#CD191E] shrink-0" />
                    <span className="font-medium text-gray-700">
                      {evento.local}
                    </span>
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#27A344] shrink-0" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Quando não há evento ao vivo (HU02 Cenário 2) */
        <div className="bg-white border border-gray-200 rounded-xl p-2.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-[11px]">
              Nenhum evento em andamento no momento.
            </span>
          </div>

          {proximo && (
            <div
              onClick={() => aoSelecionarEvento(proximo)}
              className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-[#27A344] px-2.5 py-1 rounded-lg cursor-pointer transition-colors text-[11px] font-bold"
            >
              <span>
                {`Próximo: ${proximo.nome} (${formatarDataHora(proximo.dataHoraInicio)})`}
              </span>
              <ArrowRight className="w-3 h-3" />
            </div>
          )}
        </div>
      )}
    </section>
  );
};
