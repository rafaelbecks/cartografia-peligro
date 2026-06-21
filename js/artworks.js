export async function loadArtworks() {
  const response = await fetch("./data/artworks.json");

  if (!response.ok) {
    throw new Error("No se pudieron cargar las fichas de las obras.");
  }

  const artworks = await response.json();
  return {
    list: artworks,
    byId: new Map(artworks.map((artwork) => [artwork.id, artwork])),
  };
}
