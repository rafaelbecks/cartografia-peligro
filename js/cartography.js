function createRectHotspot({ className, dataset, hotspot, onSelect }) {
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
  rect.style.cursor = "pointer";

  rect.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    onSelect();
  });

  return rect;
}

function createHotspotLayer(mount, artworks, { onArtworkSelect, onTagSelect }) {
  const ns = "http://www.w3.org/2000/svg";
  const layer = document.createElementNS(ns, "g");
  layer.setAttribute("id", "cartography-hotspots");

  artworks.forEach((artwork) => {
    layer.append(
      createRectHotspot({
        className: "artwork-hit",
        dataset: { artworkId: artwork.id },
        hotspot: artwork.hotspot,
        onSelect: () => onArtworkSelect(artwork.id),
      })
    );
  });

  artworks.forEach((artwork) => {
    (artwork.tags ?? []).forEach((tag) => {
      layer.append(
        createRectHotspot({
          className: "tag-hit",
          dataset: { tagId: tag.id },
          hotspot: tag.hotspot,
          onSelect: () => onTagSelect(tag.id),
        })
      );
    });
  });

  mount.append(layer);
}

function prepareSvgViewport(svg) {
  const contentGroup = svg.querySelector("[clip-path]") ?? svg;

  contentGroup.removeAttribute("clip-path");

  const background = svg.querySelector('rect[fill="url(#paint0_radial_2195_228)"]');

  if (background) {
    background.setAttribute("x", "-3000");
    background.setAttribute("y", "-3000");
    background.setAttribute("width", "7440");
    background.setAttribute("height", "6900");
  }

  svg.setAttribute("overflow", "visible");

  return contentGroup;
}

export async function mountCartography(
  container,
  { artworks, onArtworkSelect, onTagSelect }
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

  const contentGroup = prepareSvgViewport(svg);

  createHotspotLayer(contentGroup, artworks, { onArtworkSelect, onTagSelect });

  return svg;
}
