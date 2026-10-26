import { ComunicadoOficial, DuvidaComunidade } from "../tipos";
import {
  requisitarApiComCabecalho as requisitarApi,
  requisitarApiSemCabecalho,
} from "./apiUtil";

type Resultado<T> = { sucesso: boolean; dados?: T; erro?: string };

async function executarOperacao<T>(
  operacao: () => Promise<T>,
): Promise<Resultado<T>> {
  try {
    return { sucesso: true, dados: await operacao() };
  } catch (erro) {
    return {
      sucesso: false,
      erro:
        erro instanceof Error
          ? erro.message
          : "Não foi possível concluir a operação.",
    };
  }
}

export async function listarComunicadosPorEvento(
  eventoId: string,
): Promise<ComunicadoOficial[]> {
  return requisitarApiSemCabecalho<ComunicadoOficial[]>(
    `/comunidade/${encodeURIComponent(eventoId)}/comunicados`,
  );
}

export async function publicarComunicadoOficial(dados: {
  eventoId: string;
  autorId: string;
  autorNome: string;
  autorPapel: string;
  mensagem: string;
}): Promise<{
  sucesso: boolean;
  comunicado?: ComunicadoOficial;
  erro?: string;
}> {
  if (!dados.mensagem.trim()) {
    return {
      sucesso: false,
      erro: "A mensagem do comunicado não pode estar vazia.",
    };
  }
  const resultado = await executarOperacao(() =>
    requisitarApi<ComunicadoOficial>(
      `/comunidade/${encodeURIComponent(dados.eventoId)}/comunicados`,
      { method: "POST", body: JSON.stringify(dados) },
    ),
  );
  return resultado.sucesso
    ? { sucesso: true, comunicado: resultado.dados }
    : { sucesso: false, erro: resultado.erro };
}

export async function atualizarComunicadoOficial(
  comunicadoId: string,
  alteracoes: Pick<ComunicadoOficial, "mensagem">,
): Promise<Resultado<ComunicadoOficial>> {
  return executarOperacao(() =>
    requisitarApi<ComunicadoOficial>(
      `/comunidade/comunicados/${encodeURIComponent(comunicadoId)}`,
      { method: "PATCH", body: JSON.stringify(alteracoes) },
    ),
  );
}

export async function excluirComunicadoOficial(
  comunicadoId: string,
): Promise<Resultado<void>> {
  return executarOperacao(() =>
    requisitarApi<void>(
      `/comunidade/comunicados/${encodeURIComponent(comunicadoId)}`,
      { method: "DELETE" },
    ),
  );
}

export async function listarDuvidasPorEvento(
  eventoId: string,
): Promise<DuvidaComunidade[]> {
  return requisitarApiSemCabecalho<DuvidaComunidade[]>(
    `/comunidade/${encodeURIComponent(eventoId)}/duvidas`,
  );
}

export async function enviarPergunta(dados: {
  eventoId: string;
  autorId: string;
  autorNome: string;
  autorEmail: string;
  pergunta: string;
}): Promise<{ sucesso: boolean; duvida?: DuvidaComunidade; erro?: string }> {
  if (dados.pergunta.trim().length < 5) {
    return {
      sucesso: false,
      erro: "A pergunta deve ter pelo menos 5 caracteres.",
    };
  }
  const resultado = await executarOperacao(() =>
    requisitarApi<DuvidaComunidade>(
      `/comunidade/${encodeURIComponent(dados.eventoId)}/duvidas`,
      { method: "POST", body: JSON.stringify(dados) },
    ),
  );
  return resultado.sucesso
    ? { sucesso: true, duvida: resultado.dados }
    : { sucesso: false, erro: resultado.erro };
}

export async function atualizarPergunta(
  duvidaId: string,
  pergunta: string,
): Promise<Resultado<DuvidaComunidade>> {
  return executarOperacao(() =>
    requisitarApi<DuvidaComunidade>(
      `/comunidade/duvidas/${encodeURIComponent(duvidaId)}`,
      { method: "PATCH", body: JSON.stringify({ pergunta }) },
    ),
  );
}

export async function responderPergunta(
  duvidaId: string,
  resposta: string,
  _respondidoPorNome: string,
  _respondidoPorId: string,
): Promise<{ sucesso: boolean; duvida?: DuvidaComunidade; erro?: string }> {
  if (!resposta.trim()) {
    return { sucesso: false, erro: "A resposta não pode estar vazia." };
  }
  const resultado = await executarOperacao(() =>
    requisitarApi<DuvidaComunidade>(
      `/comunidade/duvidas/${encodeURIComponent(duvidaId)}/resposta`,
      { method: "PATCH", body: JSON.stringify({ resposta }) },
    ),
  );
  return resultado.sucesso
    ? { sucesso: true, duvida: resultado.dados }
    : { sucesso: false, erro: resultado.erro };
}

export async function excluirDuvida(
  duvidaId: string,
): Promise<Resultado<void>> {
  return executarOperacao(() =>
    requisitarApi<void>(`/comunidade/duvidas/${encodeURIComponent(duvidaId)}`, {
      method: "DELETE",
    }),
  );
}
