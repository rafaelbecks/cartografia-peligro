const CLOSE_MS = 280;

function createOverlay({ labelledBy, onClose, content, variant = "artwork" }) {
  const overlay = document.createElement("div");
  overlay.className = `modal-overlay modal-overlay--${variant}`;
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", labelledBy);

  const backdrop = document.createElement("div");
  backdrop.className = "modal-overlay__backdrop";
  backdrop.setAttribute("aria-hidden", "true");

  overlay.append(backdrop, content);

  const controller = new AbortController();
  const { signal } = controller;
  let closing = false;

  const close = () => {
    if (closing) {
      return;
    }

    closing = true;
    controller.abort();
    overlay.classList.add("modal-overlay--closing");

    window.setTimeout(() => {
      onClose?.();
    }, CLOSE_MS);
  };

  const closeButton = content.querySelector(".modal__close");
  closeButton?.addEventListener("click", close, { signal });
  backdrop.addEventListener("click", close, { signal });

  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape") {
        close();
      }
    },
    { signal }
  );

  requestAnimationFrame(() => {
    overlay.classList.add("modal-overlay--visible");
  });

  return overlay;
}

function createCloseButton() {
  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "modal__close";
  closeButton.setAttribute("aria-label", "Cerrar");
  closeButton.textContent = "×";
  return closeButton;
}

function createArtworkModalContent(artwork) {
  const modal = document.createElement("article");
  modal.className = "modal modal--artwork";

  const layout = document.createElement("div");
  layout.className = "modal__layout";

  const text = document.createElement("div");
  text.className = "modal__content";

  const media = document.createElement("div");
  media.className = "modal__media";

  const image = document.createElement("img");
  image.className = "modal__image";
  image.src = artwork.image;
  image.alt = artwork.title;
  image.loading = "eager";
  image.decoding = "async";

  const meta = document.createElement("p");
  meta.className = "modal__meta";
  meta.textContent = [artwork.artist, artwork.year].filter(Boolean).join(" · ");

  const title = document.createElement("h2");
  title.id = "modal-title";
  title.className = "modal__title";
  title.textContent = artwork.title;

  const description = document.createElement("div");
  description.className = "modal__description";
  description.textContent = artwork.description;

  text.append(meta, title, description);
  media.append(image);
  layout.append(text, media);
  modal.append(createCloseButton(), layout);

  return modal;
}

function createReferencesList(references) {
  if (!references?.length) {
    return null;
  }

  const section = document.createElement("div");
  section.className = "modal__references";

  const heading = document.createElement("h3");
  heading.className = "modal__references-title";
  heading.textContent = "Referencias";

  const list = document.createElement("ul");
  list.className = "modal__references-list";

  references.forEach((reference) => {
    const item = document.createElement("li");

    if (reference.url) {
      const link = document.createElement("a");
      link.href = reference.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = reference.label;
      item.append(link);
    } else {
      item.textContent = reference.label;
    }

    list.append(item);
  });

  section.append(heading, list);
  return section;
}

function createTagModalContent(tag) {
  const modal = document.createElement("article");
  modal.className = "modal modal--tag";

  const title = document.createElement("h2");
  title.id = "modal-tag-title";
  title.className = "modal__title modal__title--tag";
  title.textContent = tag.title;

  const description = document.createElement("div");
  description.className = "modal__description";
  description.textContent = tag.description;

  const references = createReferencesList(tag.references);

  modal.append(createCloseButton(), title, description);
  if (references) {
    modal.append(references);
  }

  return modal;
}

export function openArtworkModal(root, artwork) {
  document.body.style.overflow = "hidden";
  root.hidden = false;

  const content = createArtworkModalContent(artwork);
  root.replaceChildren(
    createOverlay({
      labelledBy: "modal-title",
      variant: "artwork",
      content,
      onClose: () => closeModal(root),
    })
  );
}

export function openTagModal(root, tag) {
  document.body.style.overflow = "hidden";
  root.hidden = false;

  const content = createTagModalContent(tag);
  root.replaceChildren(
    createOverlay({
      labelledBy: "modal-tag-title",
      variant: "tag",
      content,
      onClose: () => closeModal(root),
    })
  );
}

export function closeModal(root) {
  root.replaceChildren();
  root.hidden = true;
  document.body.style.overflow = "";
}
