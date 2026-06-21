function createRectHotspot(svg, { className, dataset, hotspot, ariaLabel, onSelect }) {
  const ns = "http://www.w3.org/2000/svg";
  const rect = document.createElementNS(ns, "rect");

  rect.classList.add(className);
  Object.entries(dataset).forEach(([key, value]) => {
    rect.dataset[key] = value;
  });

  rect.setAttribute("x", hotspot.x);
  rect.setAttribute("y", hotspot.y);
  rect.setAttribute("width", hotspot.width);
  rect.setAttribute("height", hotspot.height);
  rect.setAttribute("fill", "transparent");
  rect.setAttribute("pointer-events", "all");
  rect.setAttribute("role", "button");
  rect.setAttribute("tabindex", "0");
  rect.setAttribute("aria-label", ariaLabel);
  rect.style.cursor = "pointer";

  rect.addEventListener("click", (event) => {
    event.stopPropagation();
    onSelect();
  });

  rect.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect();
    }
  });

  return rect;
}

function createHotspotLayer(svg, artworks, tagsById, { onArtworkSelect, onTagSelect }) {
  const ns = "http://www.w3.org/2000/svg";
  const layer = document.createElementNS(ns, "g");
  layer.setAttribute("id", "cartography-hotspots");

  artworks.forEach((artwork) => {
    layer.append(
      createRectHotspot(svg, {
        className: "artwork-hit",
        dataset: { artworkId: artwork.id },
        hotspot: artwork.hotspot,
        ariaLabel: artwork.title,
        onSelect: () => onArtworkSelect(artwork.id),
      })
    );

    (artwork.tags ?? []).forEach((tag) => {
      const tagData = tagsById.get(tag.id);
      layer.append(
        createRectHotspot(svg, {
          className: "tag-hit",
          dataset: { tagId: tag.id },
          hotspot: tag.hotspot,
          ariaLabel: tagData?.title ?? tag.id,
          onSelect: () => onTagSelect(tag.id),
        })
      );
    });
  });

  const mount = svg.querySelector("[clip-path]") ?? svg;
  mount.append(layer);
}

export async function mountCartography(
  container,
  { artworks, tagsById, onArtworkSelect, onTagSelect }
) {
  const response = await fetch("./cartografia.svg");

  if (!response.ok) {
    throw new Error("No se pudo cargar la cartografía.");
  }

  const svgText = await response.text();
  container.innerHTML = svgText;

  const svg = container.querySelector("svg");

  if (!svg) {
    throw new Error("El archivo SVG no es válido.");
  }

  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  svg.removeAttribute("width");
  svg.removeAttribute("height");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "Cartografía de obras artísticas");
  svg.style.cursor = "default";

  createHotspotLayer(svg, artworks, tagsById, { onArtworkSelect, onTagSelect });

  return svg;
}
