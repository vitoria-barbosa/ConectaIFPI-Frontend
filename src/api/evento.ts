import { AreaConhecimento, Coorganizador, Evento } from "../tipos";
import {
  ApiException,
  requisitarApiSemCabecalho as requisitarApi,
  requisitarApiComCabecalho,
} from "./apiUtil";
import { supabase } from "../config/supabaseClient";

function inscricoesEstaoAbertas(evento: Evento): boolean {
  const agora = Date.now();
  return (
    new Date(evento.dataHoraInicioInscricoes).getTime() <= agora &&
    new Date(evento.dataHoraTerminoInscricoes).getTime() >= agora
  );
}

export function eventoOcorreHoje(
  dataHoraInicio: string,
  dataHoraTermino: string,
): boolean {
  const inicio = new Date(dataHoraInicio);
  const termino = new Date(dataHoraTermino);
  if (Number.isNaN(inicio.getTime()) || Number.isNaN(termino.getTime())) {
    return false;
  }

  const agora = new Date();
  const hojeZero = new Date(
    agora.getFullYear(),
    agora.getMonth(),
    agora.getDate(),
  );
  const hojeFim = new Date(
    agora.getFullYear(),
    agora.getMonth(),
    agora.getDate() + 1,
  );
  return inicio < hojeFim && termino >= hojeZero;
}

export function eventoAcontecendoAgora(
  dataHoraInicio: string,
  dataHoraTermino: string,
): boolean {
  const agora = Date.now();
  const inicio = new Date(dataHoraInicio).getTime();
  const termino = new Date(dataHoraTermino).getTime();
  return (
    !Number.isNaN(inicio) &&
    !Number.isNaN(termino) &&
    agora >= inicio &&
    agora <= termino
  );
}

export interface FiltrosEventos {
  area?: AreaConhecimento | "Todos";
  busca?: string;
  apenasHoje?: boolean;
  apenasInscricoesAbertas?: boolean;
}

export function resolverCaminhoFotoEvento(caminho: string): string {
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$/i.test(
      caminho,
    )
  ) {
    return "";
  }

  return supabase.storage.from("fotos-eventos").getPublicUrl(caminho).data
    .publicUrl;
}

export async function listarEventos(
  filtros?: FiltrosEventos,
): Promise<Evento[]> {
  const parametros = new URLSearchParams();
  if (filtros?.area && filtros.area !== "Todos") {
    parametros.set("area", filtros.area);
  }
  if (filtros?.busca?.trim()) {
    parametros.set("busca", filtros.busca.trim());
  }

  const sufixo = parametros.size ? `?${parametros.toString()}` : "";
  let eventos = await requisitarApi<Evento[]>(`/eventos${sufixo}`);

  if (filtros?.apenasHoje) {
    eventos = eventos.filter((evento) =>
      eventoOcorreHoje(evento.dataHoraInicio, evento.dataHoraTermino),
    );
  }
  if (filtros?.apenasInscricoesAbertas) {
    eventos = eventos.filter(inscricoesEstaoAbertas);
  }

  return eventos.sort((a, b) => {
    const prioridadeA =
      Number(eventoAcontecendoAgora(a.dataHoraInicio, a.dataHoraTermino)) * 4 +
      Number(eventoOcorreHoje(a.dataHoraInicio, a.dataHoraTermino)) * 2 +
      Number(inscricoesEstaoAbertas(a));
    const prioridadeB =
      Number(eventoAcontecendoAgora(b.dataHoraInicio, b.dataHoraTermino)) * 4 +
      Number(eventoOcorreHoje(b.dataHoraInicio, b.dataHoraTermino)) * 2 +
      Number(inscricoesEstaoAbertas(b));
    return (
      prioridadeB - prioridadeA ||
      new Date(a.dataHoraInicio).getTime() -
        new Date(b.dataHoraInicio).getTime()
    );
  });
}

export async function buscarEventoPorId(id: string): Promise<Evento | null> {
  try {
    return await requisitarApi<Evento>(`/eventos/${encodeURIComponent(id)}`);
  } catch (erro) {
    if (erro instanceof ApiException) return null;
    throw erro;
  }
}

export async function criarEvento(
  dados: Omit<Evento, "id" | "coorganizadoresIds" | "fotoCapaUrl">,
  fotoCapa: File,
): Promise<{ sucesso: boolean; evento?: Evento; erro?: string }> {
  try {
    const formulario = new FormData();
    Object.entries(dados).forEach(([campo, valor]) => {
      formulario.append(campo, String(valor));
    });
    formulario.append("fotoCapa", fotoCapa);

    const evento = await requisitarApiComCabecalho<Evento>("/eventos", {
      method: "POST",
      body: formulario,
    });
    return { sucesso: true, evento };
  } catch (erro) {
    return {
      sucesso: false,
      erro:
        erro instanceof Error
          ? erro.message
          : "Não foi possível criar o evento.",
    };
  }
}

export async function atualizarEvento(
  id: string,
  alteracoes: Partial<Evento>,
): Promise<{ sucesso: boolean; evento?: Evento; erro?: string }> {
  try {
    const camposAtualizaveis = Object.fromEntries(
      Object.entries(alteracoes).filter(([campo]) => campo !== "organizadorId"),
    );
    const evento = await requisitarApiComCabecalho<Evento>(
      `/eventos/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        body: JSON.stringify(camposAtualizaveis),
      },
    );
    return { sucesso: true, evento };
  } catch (erro) {
    return {
      sucesso: false,
      erro:
        erro instanceof Error
          ? erro.message
          : "Não foi possível atualizar o evento.",
    };
  }
}

export async function atualizarFotoEvento(
  id: string,
  fotoCapa: File,
): Promise<{ sucesso: boolean; evento?: Evento; erro?: string }> {
  try {
    const formulario = new FormData();
    formulario.append("fotoCapa", fotoCapa);

    const evento = await requisitarApiComCabecalho<Evento>(
      `/eventos/${encodeURIComponent(id)}/foto`,
      {
        method: "PATCH",
        body: formulario,
      },
    );
    return { sucesso: true, evento };
  } catch (erro) {
    return {
      sucesso: false,
      erro:
        erro instanceof Error
          ? erro.message
          : "Não foi possível atualizar a foto do evento.",
    };
  }
}

export async function excluirEvento(
  id: string,
): Promise<{ sucesso: boolean; erro?: string }> {
  try {
    await requisitarApiComCabecalho<{ id: string }>(
      `/eventos/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
      },
    );
    return { sucesso: true };
  } catch (erro) {
    return {
      sucesso: false,
      erro:
        erro instanceof Error
          ? erro.message
          : "Não foi possível excluir o evento.",
    };
  }
}

export async function adicionarCoorganizadorAoEvento(
  eventoId: string,
  emailAluno: string,
): Promise<{ sucesso: boolean; evento?: Evento; erro?: string }> {
  const emailLimpo = emailAluno.trim().toLowerCase();
  if (!emailLimpo.endsWith("@aluno.ifpi.edu.br")) {
    return {
      sucesso: false,
      erro: "Somente estudantes com e-mail institucional oficial (@aluno.ifpi.edu.br) podem ser delegados como coorganizadores.",
    };
  }

  try {
    const evento = await requisitarApiComCabecalho<Evento>(
      `/eventos/${encodeURIComponent(eventoId)}/coorganizadores`,
      {
        method: "POST",
        body: JSON.stringify({ email: emailLimpo }),
      },
    );
    return { sucesso: true, evento };
  } catch (erro) {
    return {
      sucesso: false,
      erro:
        erro instanceof Error
          ? erro.message
          : "Não foi possível atualizar o evento.",
    };
  }
}

export async function listarCoorganizadoresDoEvento(eventoId: string): Promise<{
  sucesso: boolean;
  coorganizadores?: Coorganizador[];
  erro?: string;
}> {
  try {
    const coorganizadores = await requisitarApiComCabecalho<Coorganizador[]>(
      `/eventos/${encodeURIComponent(eventoId)}/coorganizadores`,
    );
    return { sucesso: true, coorganizadores };
  } catch (erro) {
    return {
      sucesso: false,
      erro:
        erro instanceof Error
          ? erro.message
          : "Não foi possível listar os coorganizadores.",
    };
  }
}

export async function removerCoorganizadorDoEvento(
  eventoId: string,
  coorganizadorId: string,
): Promise<{ sucesso: boolean; erro?: string }> {
  try {
    await requisitarApiComCabecalho<void>(
      `/eventos/${encodeURIComponent(eventoId)}/coorganizadores/${encodeURIComponent(coorganizadorId)}`,
      { method: "DELETE" },
    );
    return { sucesso: true };
  } catch (erro) {
    return {
      sucesso: false,
      erro:
        erro instanceof Error
          ? erro.message
          : "Não foi possível remover o coorganizador.",
    };
  }
}
