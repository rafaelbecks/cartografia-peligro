import { loadArtworks } from "./artworks.js";
import { mountCartography } from "./cartography.js";
import { openArtworkModal, openTagModal } from "./modal.js";
import { loadTags } from "./tags.js";

async function init() {
  const cartographyRoot = document.getElementById("cartography");
  const modalRoot = document.getElementById("modal-root");

  const [{ list: artworks, byId }, { list: tags, byId: tagsById }] = await Promise.all([
    loadArtworks(),
    loadTags(),
  ]);

  await mountCartography(cartographyRoot, {
    artworks,
    tags,
    onArtworkSelect(artworkId) {
      const artwork = byId.get(artworkId);

      if (!artwork) {
        console.warn(`Obra desconocida: ${artworkId}`);
        return;
      }

      openArtworkModal(modalRoot, artwork);
    },
    onTagSelect(tagId) {
      const tag = tagsById.get(tagId);

      if (!tag) {
        console.warn(`Etiqueta desconocida: ${tagId}`);
        return;
      }

      openTagModal(modalRoot, tag);
    },
  });
}

init().catch((error) => {
  console.error(error);
  document.body.innerHTML = `<p style="padding:2rem;font-family:sans-serif;">${error.message}</p>`;
});
