import React, { useState, useEffect } from "react";
import { Evento, AreaConhecimento } from "./tipos";
import { excluirEvento, listarEventos } from "./api/evento";
import { listarFavoritosUsuario, alternarFavorito } from "./api/agenda";
import {
  ProvedorAutenticacao,
  usarAutenticacao,
} from "./contextos/ContextoAutenticacao";

// Componentes
import { Cabecalho } from "./componentes/Cabecalho";
import { Rodape } from "./componentes/Rodape";
import { ModalAutenticacao } from "./componentes/ModalAutenticacao";
import { ModalCadastroEvento } from "./componentes/ModalCadastroEvento";
import { ModalDelegarOrganizador } from "./componentes/ModalDelegarOrganizador";

// Páginas
import { PaginaCatalogo } from "./paginas/PaginaCatalogo";
import { PaginaDetalhesEvento } from "./paginas/PaginaDetalhesEvento";
import { PaginaGestaoEventos } from "./paginas/PaginaGestaoEventos";

function ConteudoAplicacao() {
  const {
    usuario,
    autenticado,
    modalAutenticacaoAberto,
    definirModalAutenticacaoAberto,
    eventoPendenteFavoritar,
    definirEventoPendenteFavoritar,
  } = usarAutenticacao();

  // Estados principais
  const [modoGestao, definirModoGestao] = useState<boolean>(false);
  const [eventoSelecionado, definirEventoSelecionado] = useState<Evento | null>(
    null,
  );

  // Estados de dados
  const [eventos, definirEventos] = useState<Evento[]>([]);
  const [eventosGestao, definirEventosGestao] = useState<Evento[]>([]);
  const [favoritos, definirFavoritos] = useState<string[]>([]);
  const [carregando, definirCarregando] = useState<boolean>(true);
  const [erroApi, definirErroApi] = useState<string | null>(null);

  // Filtros
  const [areaSelecionada, definirAreaSelecionada] = useState<
    AreaConhecimento | "Todos"
  >("Todos");
  const [termoBusca, definirTermoBusca] = useState<string>("");
  const [apenasMinhaAgenda, definirApenasMinhaAgenda] =
    useState<boolean>(false);

  // Modais
  const [modalNovoEventoAberto, definirModalNovoEventoAberto] =
    useState<boolean>(false);
  const [eventoParaEditar, definirEventoParaEditar] = useState<Evento | null>(
    null,
  );
  const [eventoParaDelegar, definirEventoParaDelegar] = useState<Evento | null>(
    null,
  );
  const podeAcessarGestao =
    usuario?.tipo === "servidor" ||
    eventosGestao.some((evento) =>
      evento.coorganizadoresIds.includes(usuario?.id ?? ""),
    );

  // Carregar eventos com os filtros
  const carregarEventos = async () => {
    definirCarregando(true);
    try {
      let lista = await listarEventos({
        area: areaSelecionada,
        busca: termoBusca,
      });

      if (apenasMinhaAgenda) {
        lista = lista.filter((e) => favoritos.includes(e.id));
      }

      definirEventos(lista);
      definirErroApi(null);
    } catch (erro) {
      definirErroApi(
        erro instanceof Error
          ? erro.message
          : "Não foi possível carregar os eventos.",
      );
    } finally {
      definirCarregando(false);
    }
  };

  // Carregar favoritos do usuário
  const carregarFavoritos = async () => {
    if (usuario?.id) {
      try {
        const favs = await listarFavoritosUsuario(usuario.id);
        definirFavoritos(favs);
      } catch (erro) {
        definirErroApi(
          erro instanceof Error
            ? erro.message
            : "Não foi possível carregar sua agenda.",
        );
      }
    } else {
      definirFavoritos([]);
    }
  };

  useEffect(() => {
    carregarEventos();
  }, [areaSelecionada, termoBusca, apenasMinhaAgenda, favoritos]);

  useEffect(() => {
    carregarFavoritos();
  }, [usuario?.id]);

  useEffect(() => {
    if (!usuario?.id) {
      definirEventosGestao([]);
      return;
    }

    let cancelado = false;
    listarEventos()
      .then((lista) => {
        if (!cancelado) definirEventosGestao(lista);
      })
      .catch((erro) => {
        if (!cancelado) {
          definirErroApi(
            erro instanceof Error
              ? erro.message
              : "Não foi possível carregar os eventos para gestão.",
          );
        }
      });

    return () => {
      cancelado = true;
    };
  }, [usuario?.id]);

  const lidarComAlternarAgenda = async (evt: Evento) => {
    if (!autenticado || !usuario) {
      definirEventoPendenteFavoritar(evt.id);
      definirModalAutenticacaoAberto(true);
      return;
    }

    const res = await alternarFavorito(usuario.id, evt.id);
    if (res.salvo) {
      definirFavoritos((prev) => [...prev, evt.id]);
    } else {
      definirFavoritos((prev) => prev.filter((id) => id !== evt.id));
    }
    if (res.erro) definirErroApi(res.erro);
  };

  // Sucesso de autenticação
  const lidarComSucessoLogin = async () => {
    if (eventoPendenteFavoritar && usuario?.id) {
      await alternarFavorito(usuario.id, eventoPendenteFavoritar);
      definirFavoritos((prev) =>
        prev.includes(eventoPendenteFavoritar)
          ? prev
          : [...prev, eventoPendenteFavoritar],
      );
      definirEventoPendenteFavoritar(null);
    }
  };

  const lidarComEventoCriado = (novoEvento: Evento) => {
    definirEventos((prev) => [novoEvento, ...prev]);
    definirEventosGestao((prev) => [novoEvento, ...prev]);
    definirModoGestao(false);
    definirEventoSelecionado(novoEvento);
  };

  const lidarComAtualizacaoEvento = (atualizado: Evento) => {
    definirEventos((prev) =>
      prev.map((e) => (e.id === atualizado.id ? atualizado : e)),
    );
    definirEventosGestao((prev) =>
      prev.map((e) => (e.id === atualizado.id ? atualizado : e)),
    );
    if (eventoSelecionado?.id === atualizado.id) {
      definirEventoSelecionado(atualizado);
    }
  };

  const lidarComExclusaoEvento = async (evento: Evento): Promise<boolean> => {
    const resultado = await excluirEvento(evento.id);
    if (!resultado.sucesso) {
      definirErroApi(resultado.erro || "Não foi possível excluir o evento.");
      return false;
    }

    definirEventos((prev) => prev.filter((item) => item.id !== evento.id));
    definirEventosGestao((prev) =>
      prev.filter((item) => item.id !== evento.id),
    );
    definirFavoritos((prev) => prev.filter((id) => id !== evento.id));
    if (eventoSelecionado?.id === evento.id) definirEventoSelecionado(null);
    definirErroApi(null);
    return true;
  };

  const lidarComEventoEditado = (atualizado: Evento) => {
    lidarComAtualizacaoEvento(atualizado);
    definirEventoParaEditar(null);
  };

  const voltarParaInicio = () => {
    definirEventoSelecionado(null);
    definirModoGestao(false);
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-[#1F2937] flex flex-col font-['Open_Sans',sans-serif]">
      <Cabecalho
        irParaInicio={voltarParaInicio}
        modoGestaoAtivo={modoGestao}
        podeAcessarGestao={podeAcessarGestao}
        aoAlternarModoGestao={() => {
          definirEventoSelecionado(null);
          definirModoGestao(!modoGestao);
        }}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-4 py-4">
        {erroApi && (
          <div
            role="alert"
            className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-[#CD191E]"
          >
            {erroApi}
          </div>
        )}
        {eventoSelecionado ? (
          <PaginaDetalhesEvento
            evento={eventoSelecionado}
            aoVoltar={() => definirEventoSelecionado(null)}
            salvoNaAgenda={favoritos.includes(eventoSelecionado.id)}
            aoAlternarAgenda={lidarComAlternarAgenda}
            aoAbrirDelegarOrganizador={(evt) => definirEventoParaDelegar(evt)}
          />
        ) : modoGestao && podeAcessarGestao ? (
          <PaginaGestaoEventos
            eventos={eventosGestao}
            aoAbrirNovoEvento={() => {
              definirEventoParaEditar(null);
              definirModalNovoEventoAberto(true);
            }}
            aoAbrirDelegar={(evt) => definirEventoParaDelegar(evt)}
            aoAbrirDetalhes={(evt) => definirEventoSelecionado(evt)}
            aoEditarEvento={(evt) => definirEventoParaEditar(evt)}
            aoExcluirEvento={lidarComExclusaoEvento}
          />
        ) : (
          <PaginaCatalogo
            eventos={eventos}
            favoritos={favoritos}
            areaSelecionada={areaSelecionada}
            aoSelecionarArea={definirAreaSelecionada}
            termoBusca={termoBusca}
            aoAlterarTermoBusca={definirTermoBusca}
            apenasMinhaAgenda={apenasMinhaAgenda}
            aoAlternarApenasMinhaAgenda={() =>
              definirApenasMinhaAgenda(!apenasMinhaAgenda)
            }
            aoAlternarAgenda={lidarComAlternarAgenda}
            aoAbrirDetalhes={(evt) => definirEventoSelecionado(evt)}
          />
        )}
      </main>

      <Rodape />

      <ModalAutenticacao
        aberto={modalAutenticacaoAberto}
        aoFechar={() => definirModalAutenticacaoAberto(false)}
        aoConcluirLoginComSucesso={lidarComSucessoLogin}
      />

      {usuario &&
        (usuario.tipo === "servidor" || Boolean(eventoParaEditar)) && (
          <ModalCadastroEvento
            aberto={modalNovoEventoAberto || Boolean(eventoParaEditar)}
            evento={eventoParaEditar ?? undefined}
            aoFechar={() => {
              definirModalNovoEventoAberto(false);
              definirEventoParaEditar(null);
            }}
            aoEventoCriado={lidarComEventoCriado}
            aoEventoAtualizado={lidarComEventoEditado}
          />
        )}

      {eventoParaDelegar && (
        <ModalDelegarOrganizador
          aberto={Boolean(eventoParaDelegar)}
          aoFechar={() => definirEventoParaDelegar(null)}
          evento={eventoParaDelegar}
          aoAtualizarEvento={lidarComAtualizacaoEvento}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ProvedorAutenticacao>
      <ConteudoAplicacao />
    </ProvedorAutenticacao>
  );
}
