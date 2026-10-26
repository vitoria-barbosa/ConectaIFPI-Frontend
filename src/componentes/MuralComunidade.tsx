import React, { useState, useEffect } from "react";
import { Evento, ComunicadoOficial, DuvidaComunidade } from "../tipos";
import {
  listarComunicadosPorEvento,
  publicarComunicadoOficial,
  listarDuvidasPorEvento,
  enviarPergunta,
  responderPergunta,
  atualizarComunicadoOficial,
  excluirComunicadoOficial,
  atualizarPergunta,
  excluirDuvida,
} from "../api/comunidade";
import { usarAutenticacao } from "../contextos/ContextoAutenticacao";
import {
  MessageSquare,
  Send,
  CornerDownRight,
  Pencil,
  Trash2,
} from "lucide-react";

interface MuralComunidadeProps {
  evento: Evento;
}

export const MuralComunidade: React.FC<MuralComunidadeProps> = ({ evento }) => {
  const { usuario, autenticado, definirModalAutenticacaoAberto } =
    usarAutenticacao();

  const [comunicados, definirComunicados] = useState<ComunicadoOficial[]>([]);
  const [duvidas, definirDuvidas] = useState<DuvidaComunidade[]>([]);
  const [carregando, definirCarregando] = useState(true);
  const [erroOperacao, definirErroOperacao] = useState<string | null>(null);

  const [novoAviso, definirNovoAviso] = useState("");
  const [enviandoAviso, definirEnviandoAviso] = useState(false);

  const [novaPergunta, definirNovaPergunta] = useState("");
  const [enviandoPergunta, definirEnviandoPergunta] = useState(false);
  const [comunicadoEditandoId, definirComunicadoEditandoId] = useState<
    string | null
  >(null);
  const [textoComunicadoEditando, definirTextoComunicadoEditando] =
    useState("");
  const [salvandoComunicado, definirSalvandoComunicado] = useState(false);
  const [excluindoComunicadoId, definirExcluindoComunicadoId] = useState<
    string | null
  >(null);
  const [perguntaEditandoId, definirPerguntaEditandoId] = useState<
    string | null
  >(null);
  const [textoPerguntaEditando, definirTextoPerguntaEditando] = useState("");
  const [salvandoPergunta, definirSalvandoPergunta] = useState(false);
  const [excluindoPerguntaId, definirExcluindoPerguntaId] = useState<
    string | null
  >(null);

  const [duvidaRespondendoId, definirDuvidaRespondendoId] = useState<
    string | null
  >(null);
  const [textoResposta, definirTextoResposta] = useState("");
  const [salvandoResposta, definirSalvandoResposta] = useState(false);

  const eOrganizadorDesteEvento = Boolean(
    usuario &&
    (usuario.id === evento.organizadorId ||
      evento.coorganizadoresIds.includes(usuario.id)),
  );

  const carregarDados = async () => {
    definirCarregando(true);
    try {
      const [coms, duvs] = await Promise.all([
        listarComunicadosPorEvento(evento.id),
        listarDuvidasPorEvento(evento.id),
      ]);
      definirComunicados(coms);
      definirDuvidas(duvs);
      definirErroOperacao(null);
    } catch (erro) {
      definirErroOperacao(
        erro instanceof Error
          ? erro.message
          : "Não foi possível carregar o mural.",
      );
    } finally {
      definirCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [evento.id]);

  const submeterComunicado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoAviso.trim() || !usuario) return;

    definirEnviandoAviso(true);
    definirErroOperacao(null);
    const papel =
      usuario.id === evento.organizadorId ? "Organizador" : "Coorganizador";

    const res = await publicarComunicadoOficial({
      eventoId: evento.id,
      autorId: usuario.id,
      autorNome: usuario.nome,
      autorPapel: papel,
      mensagem: novoAviso,
    });

    definirEnviandoAviso(false);
    if (res.sucesso && res.comunicado) {
      definirComunicados([res.comunicado, ...comunicados]);
      definirNovoAviso("");
    } else {
      definirErroOperacao(
        res.erro || "Não foi possível publicar o comunicado.",
      );
    }
  };

  const submeterPergunta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaPergunta.trim() || !usuario) return;

    definirEnviandoPergunta(true);
    definirErroOperacao(null);
    const res = await enviarPergunta({
      eventoId: evento.id,
      autorId: usuario.id,
      autorNome: usuario.nome,
      autorEmail: usuario.email,
      pergunta: novaPergunta,
    });

    definirEnviandoPergunta(false);
    if (res.sucesso && res.duvida) {
      definirDuvidas([res.duvida, ...duvidas]);
      definirNovaPergunta("");
    } else {
      definirErroOperacao(res.erro || "Não foi possível enviar a dúvida.");
    }
  };

  const submeterResposta = async (duvidaId: string) => {
    if (!textoResposta.trim() || !usuario) return;

    definirSalvandoResposta(true);
    definirErroOperacao(null);
    const nomeResp = `${usuario.nome} (${
      usuario.id === evento.organizadorId ? "Organizador" : "Coorganizador"
    })`;

    const res = await responderPergunta(
      duvidaId,
      textoResposta,
      nomeResp,
      usuario.id,
    );

    definirSalvandoResposta(false);
    if (res.sucesso) {
      definirDuvidas(
        duvidas.map((d) => (d.id === duvidaId ? (res.duvida ?? d) : d)),
      );
      definirDuvidaRespondendoId(null);
      definirTextoResposta("");
    } else {
      definirErroOperacao(res.erro || "Não foi possível registrar a resposta.");
    }
  };

  const salvarEdicaoComunicado = async (
    e: React.FormEvent<HTMLFormElement>,
    comunicadoId: string,
  ) => {
    e.preventDefault();
    if (!textoComunicadoEditando.trim()) return;

    definirSalvandoComunicado(true);
    definirErroOperacao(null);
    const resultado = await atualizarComunicadoOficial(comunicadoId, {
      mensagem: textoComunicadoEditando.trim(),
    });
    definirSalvandoComunicado(false);

    const comunicadoAtualizado = resultado.dados;
    if (resultado.sucesso && comunicadoAtualizado) {
      definirComunicados((atuais) =>
        atuais.map((comunicado) =>
          comunicado.id === comunicadoId ? comunicadoAtualizado : comunicado,
        ),
      );
      definirComunicadoEditandoId(null);
      definirTextoComunicadoEditando("");
    } else {
      definirErroOperacao(
        resultado.erro || "Não foi possível atualizar o comunicado.",
      );
    }
  };

  const removerComunicado = async (comunicado: ComunicadoOficial) => {
    if (!window.confirm("Tem certeza de que deseja excluir este comunicado?")) {
      return;
    }

    definirErroOperacao(null);
    definirExcluindoComunicadoId(comunicado.id);
    const resultado = await excluirComunicadoOficial(comunicado.id);
    definirExcluindoComunicadoId(null);
    if (resultado.sucesso) {
      definirComunicados((atuais) =>
        atuais.filter((item) => item.id !== comunicado.id),
      );
    } else {
      definirErroOperacao(
        resultado.erro || "Não foi possível excluir o comunicado.",
      );
    }
  };

  const salvarEdicaoPergunta = async (
    e: React.FormEvent<HTMLFormElement>,
    duvidaId: string,
  ) => {
    e.preventDefault();
    if (textoPerguntaEditando.trim().length < 5) {
      definirErroOperacao("A pergunta deve ter pelo menos 5 caracteres.");
      return;
    }

    definirSalvandoPergunta(true);
    definirErroOperacao(null);
    const resultado = await atualizarPergunta(
      duvidaId,
      textoPerguntaEditando.trim(),
    );
    definirSalvandoPergunta(false);

    const perguntaAtualizada = resultado.dados;
    if (resultado.sucesso && perguntaAtualizada) {
      definirDuvidas((atuais) =>
        atuais.map((duvida) =>
          duvida.id === duvidaId ? perguntaAtualizada : duvida,
        ),
      );
      definirPerguntaEditandoId(null);
      definirTextoPerguntaEditando("");
    } else {
      definirErroOperacao(
        resultado.erro || "Não foi possível atualizar a pergunta.",
      );
    }
  };

  const removerPergunta = async (duvida: DuvidaComunidade) => {
    if (!window.confirm("Tem certeza de que deseja excluir esta pergunta?")) {
      return;
    }

    definirErroOperacao(null);
    definirExcluindoPerguntaId(duvida.id);
    const resultado = await excluirDuvida(duvida.id);
    definirExcluindoPerguntaId(null);
    if (resultado.sucesso) {
      definirDuvidas((atuais) =>
        atuais.filter((item) => item.id !== duvida.id),
      );
    } else {
      definirErroOperacao(
        resultado.erro || "Não foi possível excluir a pergunta.",
      );
    }
  };

  const formatarDataHora = (iso: string) => {
    try {
      const data = new Date(iso);
      return data.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="mt-5 pt-4 border-t border-gray-200">
      {erroOperacao && (
        <div
          role="alert"
          className="mb-3 rounded-lg border border-red-200 bg-red-50 p-2.5 text-[11px] text-[#CD191E]"
        >
          {erroOperacao}
        </div>
      )}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-[#1F2937] flex items-center gap-1.5 uppercase tracking-wide">
          <MessageSquare className="w-4 h-4 text-[#27A344]" />
          Comunidade
        </h2>
      </div>

      {/* BLOCO 1: COMUNICADOS FIXADOS */}
      <div className="mb-4">
        {eOrganizadorDesteEvento && (
          <form
            onSubmit={submeterComunicado}
            className="mb-3 bg-emerald-50/50 border border-emerald-200 rounded-lg p-2.5 text-xs"
          >
            <p className="font-bold text-gray-800 mb-1">
              Novo Comunicado Oficial aos Participantes
            </p>
            <textarea
              required
              rows={2}
              value={novoAviso}
              onChange={(e) => definirNovoAviso(e.target.value)}
              placeholder="Ex: Atenção: A oficina de React mudou para o Laboratório 5..."
              className="w-full p-2 bg-white border border-gray-200 rounded text-xs text-gray-800 focus:outline-none focus:border-[#27A344]"
            />
            <div className="flex justify-end mt-1.5">
              <button
                type="submit"
                disabled={enviandoAviso}
                className="px-3 py-1 bg-[#27A344] hover:bg-[#208337] text-white rounded font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1 text-[11px]"
              >
                <Send className="w-3 h-3" />
                {enviandoAviso ? "Publicando..." : "Publicar"}
              </button>
            </div>
          </form>
        )}

        {/* Lista de Comunicados */}
        {comunicados.length === 0 ? (
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-lg p-3 text-center text-[11px] text-gray-500">
            Nenhum comunicado oficial no momento.
          </div>
        ) : (
          <div className="space-y-2">
            {comunicados.map((com) => (
              <div
                key={com.id}
                className="p-2.5 rounded-lg border bg-emerald-50/50 border-emerald-200"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex flex-col gap-1 mb-1">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase bg-[#27A344] text-white">
                      Comunicado
                    </span>
                    <span className="text-[10px] text-[#1E5E26]">
                      Autor: {com.autorNome}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-gray-400">
                      {formatarDataHora(com.criadoEm)}
                    </span>
                    {eOrganizadorDesteEvento && (
                      <>
                        <button
                          type="button"
                          disabled={
                            salvandoComunicado ||
                            Boolean(excluindoComunicadoId)
                          }
                          aria-label="Editar comunicado"
                          title="Editar comunicado"
                          onClick={() => {
                            definirComunicadoEditandoId(com.id);
                            definirTextoComunicadoEditando(com.mensagem);
                          }}
                          className="text-gray-500 hover:text-[#1E5E26] cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={excluindoComunicadoId === com.id}
                          aria-label="Excluir comunicado"
                          title="Excluir comunicado"
                          onClick={() => void removerComunicado(com)}
                          className="text-gray-500 hover:text-[#CD191E] cursor-pointer disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {comunicadoEditandoId === com.id ? (
                  <form
                    onSubmit={(e) => void salvarEdicaoComunicado(e, com.id)}
                    className="space-y-1.5"
                  >
                    <textarea
                      required
                      rows={3}
                      value={textoComunicadoEditando}
                      onChange={(e) =>
                        definirTextoComunicadoEditando(e.target.value)
                      }
                      className="w-full p-2 bg-white border border-gray-200 rounded text-xs text-gray-800 focus:outline-none focus:border-[#27A344]"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => definirComunicadoEditandoId(null)}
                        className="text-[11px] text-gray-600 cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={salvandoComunicado}
                        className="px-2.5 py-1 bg-[#27A344] text-white rounded text-[11px] font-bold cursor-pointer disabled:opacity-50"
                      >
                        {salvandoComunicado ? "Salvando..." : "Salvar"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <p className="text-xs text-gray-800 leading-relaxed font-medium">
                    {com.mensagem}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BLOCO 2: DÚVIDAS E PERGUNTAS */}
      <div>
        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 flex items-center gap-1">
          <MessageSquare className="w-3.5 h-3.5 text-gray-500" />
          Perguntas dos Participantes
        </h3>

        {autenticado ? (
          <form onSubmit={submeterPergunta} className="mb-3 flex gap-1.5">
            <input
              type="text"
              required
              value={novaPergunta}
              onChange={(e) => definirNovaPergunta(e.target.value)}
              placeholder="Ex: Será disponibilizado material em PDF após a aula?"
              className="flex-1 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-[#27A344] focus:bg-white"
            />
            <button
              type="submit"
              disabled={enviandoPergunta}
              className="px-3 py-1.5 bg-[#27A344] hover:bg-[#208337] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 disabled:opacity-50 flex items-center gap-1"
            >
              <Send className="w-3 h-3" />
              Perguntar
            </button>
          </form>
        ) : (
          <div className="mb-3 bg-gray-50 border border-gray-200 rounded-lg p-2.5 flex items-center justify-between gap-2 text-xs">
            <span className="text-[11px] text-gray-500">
              Faça login para enviar dúvidas aos organizadores.
            </span>
            <button
              onClick={() => definirModalAutenticacaoAberto(true)}
              className="px-2.5 py-1 bg-[#27A344] text-white rounded text-[11px] font-bold hover:bg-[#208337] transition-colors cursor-pointer shrink-0"
            >
              Entrar
            </button>
          </div>
        )}

        {/* Lista de Dúvidas */}
        {duvidas.length === 0 ? (
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-lg p-3 text-center text-[11px] text-gray-400">
            Nenhuma dúvida enviada ainda.
          </div>
        ) : (
          <div className="space-y-2">
            {duvidas.map((duv) => (
              <div
                key={duv.id}
                className="bg-white border border-gray-200 rounded-lg p-2.5 text-xs"
              >
                <div className="flex items-center justify-between text-[10px] text-gray-400 mb-0.5">
                  <span className="font-bold text-gray-700">
                    {duv.autorNome}
                  </span>
                  <span>{formatarDataHora(duv.criadoEm)}</span>
                </div>
                {perguntaEditandoId === duv.id ? (
                  <form
                    onSubmit={(e) => void salvarEdicaoPergunta(e, duv.id)}
                    className="space-y-1.5"
                  >
                    <input
                      type="text"
                      required
                      minLength={5}
                      value={textoPerguntaEditando}
                      onChange={(e) =>
                        definirTextoPerguntaEditando(e.target.value)
                      }
                      className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs text-gray-800 focus:outline-none focus:border-[#27A344]"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => definirPerguntaEditandoId(null)}
                        className="text-[11px] text-gray-600 cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={salvandoPergunta}
                        className="px-2.5 py-1 bg-[#27A344] text-white rounded text-[11px] font-bold cursor-pointer disabled:opacity-50"
                      >
                        {salvandoPergunta ? "Salvando..." : "Salvar"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <p className="text-xs text-gray-800 font-medium">
                    "{duv.pergunta}"
                  </p>
                )}

                {usuario?.id === duv.autorId && perguntaEditandoId !== duv.id && (
                  <div className="mt-1.5 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        definirPerguntaEditandoId(duv.id);
                        definirTextoPerguntaEditando(duv.pergunta);
                      }}
                      className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-500 hover:text-[#1E5E26] cursor-pointer"
                    >
                      <Pencil className="w-3 h-3" />
                      Editar
                    </button>
                    <button
                      type="button"
                      disabled={excluindoPerguntaId === duv.id}
                      onClick={() => void removerPergunta(duv)}
                      className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-500 hover:text-[#CD191E] cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="w-3 h-3" />
                      Excluir
                    </button>
                  </div>
                )}
                {eOrganizadorDesteEvento &&
                  usuario?.id !== duv.autorId && (
                    <button
                      type="button"
                      disabled={excluindoPerguntaId === duv.id}
                      onClick={() => void removerPergunta(duv)}
                      className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-gray-500 hover:text-[#CD191E] cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="w-3 h-3" />
                      Excluir pergunta
                    </button>
                  )}

                {duv.resposta ? (
                  <div className="mt-1.5 pl-2.5 border-l-2 border-[#27A344] bg-emerald-50/50 p-1.5 rounded-r text-[11px]">
                    <span className="font-bold text-[#27A344] block text-[10px]">
                      Resposta: {duv.respondidoPorNome}
                    </span>
                    <p className="text-gray-700 mt-0.5">{duv.resposta}</p>
                  </div>
                ) : (
                  eOrganizadorDesteEvento && (
                    <div className="mt-2">
                      {duvidaRespondendoId === duv.id ? (
                        <div className="bg-gray-50 p-2 rounded border border-gray-200 space-y-1.5">
                          <textarea
                            rows={2}
                            value={textoResposta}
                            onChange={(e) =>
                              definirTextoResposta(e.target.value)
                            }
                            placeholder="Resposta oficial do organizador..."
                            className="w-full p-1.5 bg-white border border-gray-200 rounded text-xs text-gray-800 focus:outline-none focus:border-[#27A344]"
                          />
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                definirDuvidaRespondendoId(null);
                                definirTextoResposta("");
                              }}
                              className="px-2 py-0.5 text-gray-500 text-[11px]"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              disabled={salvandoResposta}
                              onClick={() => submeterResposta(duv.id)}
                              className="px-2.5 py-0.5 bg-[#27A344] text-white font-bold rounded text-[11px]"
                            >
                              Enviar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            definirDuvidaRespondendoId(duv.id);
                            definirTextoResposta("");
                          }}
                          className="text-[11px] font-bold text-[#27A344] flex items-center gap-1 cursor-pointer"
                        >
                          <CornerDownRight className="w-3 h-3" />
                          Responder (Organizador)
                        </button>
                      )}
                    </div>
                  )
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
