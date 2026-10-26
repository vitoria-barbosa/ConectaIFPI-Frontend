import React from "react";
import { Evento } from "../tipos";
import { resolverCaminhoFotoEvento } from "../api/evento";
import { MuralComunidade } from "../componentes/MuralComunidade";
import {
  ArrowLeft,
  Award,
  Bookmark,
  Building2,
  Calendar,
  Check,
  ExternalLink,
  GraduationCap,
  Link2,
  MapPin,
  Ticket,
  Users,
  UsersRound,
} from "lucide-react";

interface PaginaDetalhesEventoProps {
  evento: Evento;
  aoVoltar: () => void;
  salvoNaAgenda: boolean;
  aoAlternarAgenda: (evento: Evento) => void;
  aoAbrirDelegarOrganizador: (evento: Evento) => void;
}

const formatarDataHora = (valor: string) => {
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return "Data não informada";

  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const urlSegura = (valor: string) => {
  try {
    return new URL(valor).protocol === "https:";
  } catch {
    return false;
  }
};

export const PaginaDetalhesEvento: React.FC<PaginaDetalhesEventoProps> = ({
  evento,
  aoVoltar,
  salvoNaAgenda,
  aoAlternarAgenda,
}) => {
  const agora = Date.now();
  const terminoEvento = new Date(evento.dataHoraTermino).getTime();
  const inicioInscricoes = new Date(evento.dataHoraInicioInscricoes).getTime();
  const terminoInscricoes = new Date(
    evento.dataHoraTerminoInscricoes,
  ).getTime();
  const estaEncerrado = terminoEvento < agora;
  const inscricoesAbertas =
    inicioInscricoes <= agora && terminoInscricoes >= agora;
  const inscricoesFuturas = inicioInscricoes > agora;
  const statusInscricoes = inscricoesAbertas
    ? "Inscrições abertas"
    : inscricoesFuturas
      ? "Inscrições em breve"
      : "Inscrições encerradas";

  const linksOficiais = [
    {
      nome: "Inscrição pelo SUAP",
      url: evento.linkInscricaoSuap,
      destaque: inscricoesAbertas && !estaEncerrado,
    },
    {
      nome: "Página do evento no SUAP",
      url: evento.linkEventoSuap,
      destaque: false,
    },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <button
        type="button"
        onClick={aoVoltar}
        className="mb-3 inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-xs font-semibold text-gray-600 transition-colors hover:text-[#1E5E26] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F9E41]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Voltar aos eventos
      </button>

      <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <header className="h-44 bg-gray-200 sm:h-56">
          <img
            src={resolverCaminhoFotoEvento(evento.fotoCapaUrl)}
            alt={`Imagem de capa do evento ${evento.nome}`}
            className="h-full w-full object-cover"
          />
        </header>

        <div className="space-y-4 p-3 text-xs sm:space-y-5 sm:p-4">
          <section className="min-w-0">
            <h1 className="text-lg font-bold leading-snug text-gray-900 sm:text-xl">
              {evento.nome}
            </h1>
          </section>

          <section
            aria-labelledby="agenda-evento"
            className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3 sm:p-4"
          >
            <div className="mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#1E5E26]" aria-hidden="true" />
              <h2
                id="agenda-evento"
                className="text-[12px] font-bold text-gray-900"
              >
                Data e horário do evento
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-emerald-100 bg-white p-3">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                  Início
                </p>
                <p className="text-xs font-semibold leading-relaxed text-gray-900">
                  {formatarDataHora(evento.dataHoraInicio)}
                </p>
              </div>
              <div className="rounded-lg border border-emerald-100 bg-white p-3">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                  Término
                </p>
                <p className="text-xs font-semibold leading-relaxed text-gray-900">
                  {formatarDataHora(evento.dataHoraTermino)}
                </p>
              </div>
            </div>
          </section>

          <section aria-labelledby="informacoes-evento">
            <h2
              id="informacoes-evento"
              className="mb-2 text-sm font-bold text-gray-900"
            >
              Informações do evento
            </h2>
            <dl className="grid gap-3 sm:grid-cols-2">
              <div className="flex gap-2.5 rounded-xl border border-gray-200 p-3">
                <GraduationCap
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#1E5E26]"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <dt className="text-xs font-semibold text-gray-500">
                    Área do conhecimento
                  </dt>
                  <dd className="mt-1 text-[11px] font-semibold text-gray-900">
                    {evento.areaConhecimento}
                  </dd>
                </div>
              </div>

              <div className="flex gap-2.5 rounded-xl border border-gray-200 p-3">
                <UsersRound
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#1E5E26]"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <dt className="text-xs font-semibold text-gray-500">
                    Público-alvo
                  </dt>
                  <dd className="mt-1 text-[11px] font-semibold text-gray-900">
                    {evento.tipoEvento}
                  </dd>
                </div>
              </div>

              <div className="flex gap-2.5 rounded-xl border border-gray-200 p-3">
                <MapPin
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#CD191E]"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <dt className="text-xs font-semibold text-gray-500">Local</dt>
                  <dd className="mt-1 wrap-break-word text-[11px] font-semibold text-gray-900">
                    {evento.local}
                  </dd>
                </div>
              </div>

              <div className="flex gap-2.5 rounded-xl border border-gray-200 p-3">
                <Award
                  className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <dt className="text-xs font-semibold text-gray-500">
                    Certificação e carga horária
                  </dt>
                  <dd className="mt-1 text-[11px] font-semibold text-gray-900">
                    {evento.cargaHoraria} horas
                  </dd>
                </div>
              </div>

              <div className="flex gap-2.5 rounded-xl border border-gray-200 p-3">
                <Building2
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#1E5E26]"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <dt className="text-xs font-semibold text-gray-500">
                    Vagas para organização
                  </dt>
                  <dd className="mt-1 text-[11px] font-semibold text-gray-900">
                    {evento.possuiVagasOrganizacao
                      ? "Disponíveis"
                      : "Não disponíveis"}
                  </dd>
                </div>
              </div>

              <div className="flex gap-2.5 rounded-xl border border-gray-200 p-3">
                <Users className="h-4 w-4 text-[#1E5E26]" aria-hidden="true" />
                <div className="min-w-0">
                  <dt className="text-xs font-semibold text-gray-500">
                    Organizador responsável:
                  </dt>
                  <dd className="mt-1 text-[11px] font-semibold text-gray-900">
                    {evento.organizadorNome}
                  </dd>
                </div>
              </div>

              <div className="flex gap-2.5 rounded-xl border border-gray-200 p-3">
                <Ticket
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#1E5E26]"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <dt className="text-xs font-semibold text-gray-500">
                    Período de inscrições
                  </dt>
                  <dd className="mt-1 text-[11px] font-semibold leading-relaxed text-gray-900">
                    {formatarDataHora(evento.dataHoraInicioInscricoes)}
                    <span className="block text-[11px] font-semibold text-gray-900">
                      até {formatarDataHora(evento.dataHoraTerminoInscricoes)}
                    </span>
                  </dd>
                  <dd
                    className={`mt-2 inline-flex rounded-full px-2 py-1 text-[10px] font-bold ${
                      inscricoesAbertas
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {statusInscricoes}
                  </dd>
                </div>
              </div>
            </dl>
          </section>

          <section aria-labelledby="descricao-evento">
            <h2
              id="descricao-evento"
              className="mb-2 text-sm font-bold text-gray-900"
            >
              Sobre o evento
            </h2>
            <p className="whitespace-pre-line text-xs leading-relaxed text-gray-700">
              {evento.descricao}
            </p>
          </section>

          <section aria-labelledby="links-evento">
            <div className="mb-3 flex items-center gap-2">
              <Link2 className="h-5 w-5 text-[#1E5E26]" aria-hidden="true" />
              <h2 id="links-evento" className="text-sm font-bold text-gray-900">
                Links oficiais
              </h2>
            </div>
            <ul className="grid gap-3 sm:grid-cols-3">
              {linksOficiais.map((link) => (
                <li key={link.nome}>
                  {urlSegura(link.url) ? (
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex min-h-10 items-center justify-between gap-3 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F9E41] ${
                        link.destaque
                          ? "border-[#2F9E41] bg-[#2F9E41] text-white hover:bg-[#1E5E26]"
                          : "border-gray-200 bg-white text-gray-800 hover:border-emerald-300 hover:bg-emerald-50"
                      }`}
                    >
                      {link.nome}
                      <ExternalLink
                        className="h-4 w-4 shrink-0"
                        aria-hidden="true"
                      />
                    </a>
                  ) : (
                    <span className="flex min-h-10 items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500">
                      {link.nome} — link indisponível
                    </span>
                  )}
                </li>
              ))}
              <li key="Certificado no SUAP">
                <a
                  href="https://suap.ifpi.edu.br/admin/eventos/evento/?tab=tab_participante"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-10 items-center justify-between gap-3 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F9E41] border-gray-200 bg-white text-gray-800 hover:border-emerald-300 hover:bg-emerald-50"
                >
                  Certificado no SUAP
                  <ExternalLink
                    className="h-4 w-4 shrink-0"
                    aria-hidden="true"
                  />
                </a>
              </li>
            </ul>
          </section>

          <div className="flex flex-col gap-2  pt-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => aoAlternarAgenda(evento)}
              aria-pressed={salvoNaAgenda}
              className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F9E41] ${
                salvoNaAgenda
                  ? "border-emerald-200 bg-emerald-50 text-[#1E5E26]"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {salvoNaAgenda ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Bookmark className="h-4 w-4" aria-hidden="true" />
              )}
              {salvoNaAgenda
                ? "Salvo na minha agenda"
                : "Salvar na minha agenda"}
            </button>
          </div>

          <MuralComunidade evento={evento} />
        </div>
      </article>
    </div>
  );
};
