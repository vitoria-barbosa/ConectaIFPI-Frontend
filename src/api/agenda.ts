import { ItemAgenda } from "../tipos";
import { requisitarApiComCabecalho as requisitarApi } from "./apiUtil";

export async function listarFavoritosUsuario(
  usuarioId: string,
): Promise<string[]> {
  if (!usuarioId) return [];
  const itens = await requisitarApi<ItemAgenda[]>(
    `/agenda/${encodeURIComponent(usuarioId)}`,
  );
  return itens.map((item) => item.eventoId);
}

export async function adicionarFavorito(
  usuarioId: string,
  eventoId: string,
): Promise<ItemAgenda> {
  return requisitarApi<ItemAgenda>("/agenda", {
    method: "POST",
    body: JSON.stringify({ usuarioId, eventoId }),
  });
}

export async function removerFavorito(
  usuarioId: string,
  eventoId: string,
): Promise<void> {
  await requisitarApi<void>(
    `/agenda/${encodeURIComponent(usuarioId)}/${encodeURIComponent(eventoId)}`,
    { method: "DELETE" },
  );
}

export async function alternarFavorito(
  usuarioId: string,
  eventoId: string,
): Promise<{ salvo: boolean; erro?: string }> {
  if (!usuarioId) {
    return { salvo: false, erro: "Usuário não autenticado." };
  }

  try {
    const favoritos = await listarFavoritosUsuario(usuarioId);
    if (favoritos.includes(eventoId)) {
      await removerFavorito(usuarioId, eventoId);
      return { salvo: false };
    }
    await adicionarFavorito(usuarioId, eventoId);
    return { salvo: true };
  } catch (erro) {
    return {
      salvo: false,
      erro:
        erro instanceof Error
          ? erro.message
          : "Não foi possível atualizar a agenda.",
    };
  }
}
