import React, { useEffect, useState } from "react";
import { AreaConhecimento, Evento, TipoEvento } from "../tipos";
import {
  atualizarEvento,
  atualizarFotoEvento,
  criarEvento,
} from "../api/evento";
import { usarAutenticacao } from "../contextos/ContextoAutenticacao";
import { X, Calendar, AlertCircle } from "lucide-react";

interface ModalCadastroEventoProps {
  aberto: boolean;
  evento?: Evento;
  aoFechar: () => void;
  aoEventoCriado: (evento: Evento) => void;
  aoEventoAtualizado: (evento: Evento) => void;
}

const AREAS: AreaConhecimento[] = [
  "Tecnologia",
  "Gestão",
  "Licenciaturas",
  "Indústria",
  "Saúde",
  "Cultura",
  "Outro",
];

const TIPOS_EVENTO: TipoEvento[] = ["Aberto ao público", "Interno"];

const CAMPO_CLASSE =
  "w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-[#27A344]";
const ROTULO_CLASSE = "block text-[11px] font-bold text-gray-700 mb-0.5";

export const ModalCadastroEvento: React.FC<ModalCadastroEventoProps> = ({
  aberto,
  evento,
  aoFechar,
  aoEventoCriado,
  aoEventoAtualizado,
}) => {
  const { usuario } = usarAutenticacao();

  const [nome, definirNome] = useState("");
  const [descricao, definirDescricao] = useState("");
  const [areaConhecimento, definirAreaConhecimento] =
    useState<AreaConhecimento>("Outro");
  const [local, definirLocal] = useState("");
  const [dataHoraInicioInscricoes, definirDataHoraInicioInscricoes] =
    useState("");
  const [dataHoraTerminoInscricoes, definirDataHoraTerminoInscricoes] =
    useState("");
  const [dataHoraInicio, definirDataHoraInicio] = useState("");
  const [dataHoraTermino, definirDataHoraTermino] = useState("");
  const [fotoCapa, definirFotoCapa] = useState<File | null>(null);
  const [cargaHoraria, definirCargaHoraria] = useState("");
  const [tipoEvento, definirTipoEvento] = useState<TipoEvento>("Interno");
  const [possuiVagasOrganizacao, definirPossuiVagasOrganizacao] =
    useState<boolean>(false);
  const [linkInscricaoSuap, definirLinkInscricaoSuap] = useState("");
  const [linkEventoSuap, definirLinkEventoSuap] = useState("");

  const [erro, definirErro] = useState<string | null>(null);
  const [salvando, definirSalvando] = useState(false);

  useEffect(() => {
    if (!aberto) return;

    const paraDataLocal = (valor: string) => {
      const data = new Date(valor);
      if (Number.isNaN(data.getTime())) return "";
      const local = new Date(data.getTime() - data.getTimezoneOffset() * 60000);
      return local.toISOString().slice(0, 16);
    };

    definirNome(evento?.nome ?? "");
    definirDescricao(evento?.descricao ?? "");
    definirAreaConhecimento(evento?.areaConhecimento ?? "Outro");
    definirLocal(evento?.local ?? "");
    definirDataHoraInicioInscricoes(
      evento ? paraDataLocal(evento.dataHoraInicioInscricoes) : "",
    );
    definirDataHoraTerminoInscricoes(
      evento ? paraDataLocal(evento.dataHoraTerminoInscricoes) : "",
    );
    definirDataHoraInicio(evento ? paraDataLocal(evento.dataHoraInicio) : "");
    definirDataHoraTermino(evento ? paraDataLocal(evento.dataHoraTermino) : "");
    definirFotoCapa(null);
    definirCargaHoraria(evento ? String(evento.cargaHoraria) : "");
    definirTipoEvento(evento?.tipoEvento ?? "Interno");
    definirPossuiVagasOrganizacao(evento?.possuiVagasOrganizacao ?? false);
    definirLinkInscricaoSuap(evento?.linkInscricaoSuap ?? "");
    definirLinkEventoSuap(evento?.linkEventoSuap ?? "");
    definirErro(null);
  }, [aberto, evento]);

  if (!aberto) return null;

  const lidarComSubmissao = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    definirErro(null);

    if (
      !usuario?.id ||
      !usuario.nome.trim() ||
      !usuario.email.trim() ||
      !nome.trim() ||
      !descricao.trim() ||
      !areaConhecimento ||
      !local.trim() ||
      !dataHoraInicioInscricoes ||
      !dataHoraTerminoInscricoes ||
      !dataHoraInicio ||
      !dataHoraTermino ||
      (!evento && !fotoCapa) ||
      !cargaHoraria ||
      !tipoEvento ||
      possuiVagasOrganizacao === null ||
      !linkInscricaoSuap.trim() ||
      !linkEventoSuap.trim()
    ) {
      definirErro("Preencha todos os campos obrigatórios.");
      return;
    }

    if (
      fotoCapa &&
      !["image/jpeg", "image/png", "image/webp"].includes(fotoCapa.type)
    ) {
      definirErro("A foto deve estar no formato JPG, PNG ou WebP.");
      return;
    }
    if (fotoCapa && fotoCapa.size > 5 * 1024 * 1024) {
      definirErro("A foto deve ter no máximo 5 MB.");
      return;
    }

    const inicioInscricoes = new Date(dataHoraInicioInscricoes);
    const terminoInscricoes = new Date(dataHoraTerminoInscricoes);
    const inicioEvento = new Date(dataHoraInicio);
    const terminoEvento = new Date(dataHoraTermino);

    if (terminoInscricoes <= inicioInscricoes) {
      definirErro(
        "O término das inscrições deve ser posterior ao início das inscrições.",
      );
      return;
    }

    if (terminoEvento <= inicioEvento) {
      definirErro("O término do evento deve ser posterior ao início.");
      return;
    }

    if (Number(cargaHoraria) <= 0) {
      definirErro("A carga horária deve ser maior que zero.");
      return;
    }

    const urlsExternas = [linkInscricaoSuap, linkEventoSuap];
    const urlsValidas = urlsExternas.every((url) => {
      try {
        return new URL(url).protocol === "https:";
      } catch {
        return false;
      }
    });
    if (!urlsValidas) {
      definirErro("Informe URLs seguras iniciadas com https://.");
      return;
    }

    definirSalvando(true);

    const payload: Omit<Evento, "id" | "coorganizadoresIds" | "fotoCapaUrl"> = {
      nome: nome.trim(),
      descricao: descricao.trim(),
      areaConhecimento: areaConhecimento,
      local: local.trim(),
      dataHoraInicioInscricoes: inicioInscricoes.toISOString(),
      dataHoraTerminoInscricoes: terminoInscricoes.toISOString(),
      dataHoraInicio: inicioEvento.toISOString(),
      dataHoraTermino: terminoEvento.toISOString(),
      cargaHoraria: Number(cargaHoraria),
      tipoEvento: tipoEvento,
      possuiVagasOrganizacao: possuiVagasOrganizacao,
      linkInscricaoSuap: linkInscricaoSuap.trim(),
      linkEventoSuap: linkEventoSuap.trim(),
      organizadorId: evento?.organizadorId ?? usuario.id,
      organizadorNome: evento?.organizadorNome ?? usuario.nome.trim(),
      organizadorEmail: evento?.organizadorEmail ?? usuario.email.trim(),
    };

    try {
      let eventoSalvo: Evento | undefined;
      let erroSalvamento: string | undefined;

      if (evento) {
        const resultado = await atualizarEvento(evento.id, payload);
        eventoSalvo = resultado.evento;
        erroSalvamento = resultado.erro;

        if (eventoSalvo && fotoCapa) {
          const resultadoFoto = await atualizarFotoEvento(evento.id, fotoCapa);
          if (resultadoFoto.sucesso && resultadoFoto.evento) {
            eventoSalvo = resultadoFoto.evento;
          } else {
            aoEventoAtualizado(eventoSalvo);
            definirErro(
              resultadoFoto.erro ||
                "Os dados foram salvos, mas não foi possível atualizar a foto.",
            );
            return;
          }
        }
      } else if (fotoCapa) {
        const resultado = await criarEvento(payload, fotoCapa);
        eventoSalvo = resultado.evento;
        erroSalvamento = resultado.erro;
      } else {
        erroSalvamento = "Selecione uma foto de capa.";
      }

      if (eventoSalvo) {
        if (evento) aoEventoAtualizado(eventoSalvo);
        else aoEventoCriado(eventoSalvo);
        aoFechar();
      } else {
        definirErro(
          erroSalvamento || `Erro ao ${evento ? "atualizar" : "criar"} evento.`,
        );
      }
    } catch {
      definirErro(
        `Não foi possível ${evento ? "atualizar" : "criar"} o evento. Tente novamente.`,
      );
    } finally {
      definirSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-3 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-lg w-full shadow-lg border border-gray-100 overflow-hidden my-4">
        <div className="bg-[#27A344] text-white p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <h3 className="font-bold text-sm">
              {evento ? "Editar Evento" : "Cadastrar Evento"}
            </h3>
          </div>
          <button
            type="button"
            onClick={aoFechar}
            aria-label="Fechar cadastro"
            className="p-1 rounded text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form
          onSubmit={lidarComSubmissao}
          className="p-4 max-h-[82vh] overflow-y-auto space-y-3 text-xs"
        >
          {erro && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-[#CD191E] flex items-start gap-1.5 text-[11px]">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{erro}</span>
            </div>
          )}

          <div>
            <label className={ROTULO_CLASSE} htmlFor="evento-nome">
              Nome do Evento *
            </label>
            <input
              id="evento-nome"
              type="text"
              required
              value={nome}
              onChange={(e) => definirNome(e.target.value)}
              placeholder="Ex: Seminário de Informática"
              className={CAMPO_CLASSE}
            />
          </div>

          <div>
            <label className={ROTULO_CLASSE} htmlFor="evento-descricao">
              Descrição *
            </label>
            <textarea
              id="evento-descricao"
              required
              rows={2}
              value={descricao}
              onChange={(e) => definirDescricao(e.target.value)}
              placeholder="Apresentação do evento..."
              className={CAMPO_CLASSE}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={ROTULO_CLASSE} htmlFor="evento-area">
                Área de Conhecimento *
              </label>
              <select
                id="evento-area"
                required
                value={areaConhecimento}
                onChange={(e) =>
                  definirAreaConhecimento(
                    AREAS.find((area) => area === e.target.value) ?? "Outro",
                  )
                }
                className={CAMPO_CLASSE}
              >
                <option value="">Selecione a área</option>
                {AREAS.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={ROTULO_CLASSE} htmlFor="evento-carga-horaria">
                Carga Horária (h) *
              </label>
              <input
                id="evento-carga-horaria"
                type="number"
                min={1}
                step="any"
                required
                value={cargaHoraria}
                onChange={(e) => definirCargaHoraria(e.target.value)}
                className={CAMPO_CLASSE}
              />
            </div>
          </div>

          <div>
            <label className={ROTULO_CLASSE} htmlFor="evento-local">
              Local *
            </label>
            <input
              id="evento-local"
              type="text"
              required
              value={local}
              onChange={(e) => definirLocal(e.target.value)}
              placeholder="Ex: Auditório Central, Bloco C"
              className={CAMPO_CLASSE}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={ROTULO_CLASSE} htmlFor="inicio-inscricoes">
                Início das Inscrições *
              </label>
              <input
                id="inicio-inscricoes"
                type="datetime-local"
                required
                value={dataHoraInicioInscricoes}
                onChange={(e) =>
                  definirDataHoraInicioInscricoes(e.target.value)
                }
                className={CAMPO_CLASSE}
              />
            </div>
            <div>
              <label className={ROTULO_CLASSE} htmlFor="termino-inscricoes">
                Término das Inscrições *
              </label>
              <input
                id="termino-inscricoes"
                type="datetime-local"
                required
                value={dataHoraTerminoInscricoes}
                onChange={(e) =>
                  definirDataHoraTerminoInscricoes(e.target.value)
                }
                className={CAMPO_CLASSE}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={ROTULO_CLASSE} htmlFor="inicio-evento">
                Início do Evento *
              </label>
              <input
                id="inicio-evento"
                type="datetime-local"
                required
                value={dataHoraInicio}
                onChange={(e) => definirDataHoraInicio(e.target.value)}
                className={CAMPO_CLASSE}
              />
            </div>
            <div>
              <label className={ROTULO_CLASSE} htmlFor="termino-evento">
                Término do Evento *
              </label>
              <input
                id="termino-evento"
                type="datetime-local"
                required
                value={dataHoraTermino}
                onChange={(e) => definirDataHoraTermino(e.target.value)}
                className={CAMPO_CLASSE}
              />
            </div>
          </div>

          <div>
            <label className={ROTULO_CLASSE} htmlFor="evento-foto">
              {evento
                ? "Foto de Capa (JPG, PNG ou WebP; até 5 MB)"
                : "Foto de Capa * (JPG, PNG ou WebP; até 5 MB)"}
            </label>
            <input
              id="evento-foto"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required={!evento}
              onChange={(e) => definirFotoCapa(e.target.files?.[0] ?? null)}
              className={CAMPO_CLASSE}
            />
            {evento && (
              <p className="mt-1 text-[10px] text-gray-500">
                Selecione uma imagem para substituir a capa atual ou deixe em
                branco para mantê-la.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={ROTULO_CLASSE} htmlFor="evento-tipo">
                Tipo do Evento *
              </label>
              <select
                id="evento-tipo"
                required
                value={tipoEvento}
                onChange={(e) =>
                  definirTipoEvento(
                    TIPOS_EVENTO.find((tipo) => tipo === e.target.value) ??
                      "Interno",
                  )
                }
                className={CAMPO_CLASSE}
              >
                <option value="">Selecione o tipo</option>
                {TIPOS_EVENTO.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={ROTULO_CLASSE} htmlFor="evento-vagas">
                Vagas para Organização? *
              </label>
              <select
                id="evento-vagas"
                required
                value={
                  possuiVagasOrganizacao === null
                    ? ""
                    : possuiVagasOrganizacao
                      ? "sim"
                      : "nao"
                }
                onChange={(e) =>
                  definirPossuiVagasOrganizacao(e.target.value === "sim")
                }
                className={CAMPO_CLASSE}
              >
                <option value="">Selecione</option>
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
            <div>
              <label className={ROTULO_CLASSE} htmlFor="link-inscricao">
                Link de Inscrição no SUAP *
              </label>
              <input
                id="link-inscricao"
                type="url"
                required
                value={linkInscricaoSuap}
                onChange={(e) => definirLinkInscricaoSuap(e.target.value)}
                placeholder="https://..."
                className={CAMPO_CLASSE}
              />
            </div>
            <div>
              <label className={ROTULO_CLASSE} htmlFor="link-evento">
                Link do Evento no SUAP *
              </label>
              <input
                id="link-evento"
                type="url"
                required
                value={linkEventoSuap}
                onChange={(e) => definirLinkEventoSuap(e.target.value)}
                placeholder="https://..."
                className={CAMPO_CLASSE}
              />
            </div>
          </div>

          <div className="text-[10px] text-gray-500">
            Organizador: {usuario?.nome} ({usuario?.email})
          </div>

          <div className="pt-2 border-t border-gray-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={aoFechar}
              className="px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="px-4 py-1.5 bg-[#27A344] hover:bg-[#208337] text-white rounded-lg font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              {salvando
                ? "Salvando..."
                : evento
                  ? "Salvar Alterações"
                  : "Salvar Evento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
