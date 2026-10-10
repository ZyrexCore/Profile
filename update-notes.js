const GAME_UPDATE_NOTES = {
  gameName: "YOUR GAME NAME",
  updateName: "UPDATE NAME",
  subtitle: "Write a short summary of this update here.",
  image: "assets/update-cover.png",
  playUrl: "https://www.roblox.com/",
  notes: [
    "Add your first update note here.",
    "Add another change, feature, or fix here.",
    "Add more points as needed. The notes box scrolls independently."
  ]
};

function renderGameUpdateNotes() {
  const hero = document.querySelector(".hero-inner");
  if (!hero || document.getElementById("gameUpdateNotes")) return;
  const actions = hero.querySelector(".actions");
  const panel = document.createElement("section");
  panel.className = "update-notes";
  panel.id = "gameUpdateNotes";
  panel.setAttribute("aria-labelledby", "updateNotesTitle");

  const notes = Array.isArray(GAME_UPDATE_NOTES.notes) ? GAME_UPDATE_NOTES.notes : [];
  const image = String(GAME_UPDATE_NOTES.image || "").trim();
  const playUrl = String(GAME_UPDATE_NOTES.playUrl || "").trim();
  const title = [GAME_UPDATE_NOTES.gameName, GAME_UPDATE_NOTES.updateName].filter(Boolean).join(" — ");

  panel.innerHTML = `
    <div class="update-notes-media">
      <div class="update-notes-image-wrap">
        <img class="update-notes-image" src="${escapeUpdateText(image)}" alt="${escapeUpdateText(title)} cover" ${image ? "" : "hidden"}>
        <div class="update-notes-image-fallback" ${image ? "hidden" : ""}>GAME UPDATE</div>
      </div>
      <a class="btn primary update-notes-play" href="${escapeUpdateText(playUrl || "#")}" ${playUrl ? 'target="_blank" rel="noopener noreferrer"' : 'aria-disabled="true"'}>▶ PLAY NOW</a>
    </div>
    <div class="update-notes-content">
      <div class="update-notes-label">LATEST UPDATE</div>
      <h2 class="update-notes-title" id="updateNotesTitle">${escapeUpdateText(title || "GAME NAME — UPDATE NAME")}</h2>
      <p class="update-notes-subtitle">${escapeUpdateText(GAME_UPDATE_NOTES.subtitle || "")}</p>
      <div class="update-notes-divider"></div>
      <h3 class="update-notes-list-title">PATCH NOTES</h3>
      <div class="update-notes-scroll" tabindex="0" role="region" aria-label="Scrollable game update notes">
        ${notes.length ? '<ul class="update-notes-list">' + notes.map(note => '<li>' + escapeUpdateText(note) + '</li>').join("") + '</ul>' : '<p class="update-notes-empty">No update notes added yet.</p>'}
      </div>
    </div>`;
  const img = panel.querySelector(".update-notes-image");
  const fallback = panel.querySelector(".update-notes-image-fallback");
  if (img) img.addEventListener("error", () => { img.hidden = true; fallback.hidden = false; });
  const play = panel.querySelector(".update-notes-play");
  if (!playUrl && play) {
    play.addEventListener("click", event => event.preventDefault());
    play.style.opacity = ".55";
    play.style.cursor = "not-allowed";
  }
  if (actions) actions.insertAdjacentElement("afterend", panel);
  else hero.appendChild(panel);
}

function escapeUpdateText(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

renderGameUpdateNotes();