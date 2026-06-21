export async function loadTags() {
  const response = await fetch("./data/tags.json");

  if (!response.ok) {
    throw new Error("No se pudieron cargar las etiquetas.");
  }

  const tags = await response.json();
  return new Map(tags.map((tag) => [tag.id, tag]));
}
