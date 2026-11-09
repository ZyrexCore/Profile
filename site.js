/* ZyrexCore site app — data, navigation, galleries and feedback */
(() => {
  "use strict";
  const CONFIG = {
    manifest: "portfolio-manifest.json",
    feedbackEndpoint: "https://orange-waterfall-e488.linganagoudapatilpatil.workers.dev",
    social: {
      roblox: "https://www.roblox.com/users/4818300014/profile",
      instagram: "https://www.instagram.com/manvith_1005?igsh=bWppbzBxZWc9emhv",
      discord: "https://discord.gg/nGqKXKNKsW"
    }
  };
  const $ = (selector, root=document) => root.querySelector(selector);
  const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const assetURL = file => "assets/" + String(file || "").split("/").map(encodeURIComponent).join("/");
  const page = document.body.dataset.page || "home";

  function header() {
    const links = [["home","index.html","Home"],["games","games.html","Games"],["gfx","gfx.html","GFX"],["models","models.html","3D"],["audio","audio.html","Audio"]];
    return `<header class="site-header"><div class="header-inner">
      <a class="wordmark" href="index.html"><span class="wordmark-mark">Z</span><span>ZYREXCORE<small>CREATIVE PORTFOLIO</small></span></a>
      <nav class="primary-nav" id="primaryNav" aria-label="Main navigation">${links.map(([key,url,label])=>`<a href="${url}" ${page===key?'aria-current="page"':""}>${label}</a>`).join("")}</nav>
      <a class="header-contact" href="https://www.instagram.com/manvith_1005" target="_blank" rel="noopener">LET'S CONNECT ↗</a>
      <button class="menu-toggle" id="menuToggle" type="button" aria-label="Toggle navigation" aria-expanded="false">☰</button>
    </div></header>`;
  }
  function footer() {
    return `<footer class="site-footer"><div class="footer-inner"><span>© ${new Date().getFullYear()} ZYREXCORE · BUILT BY MANVITH PATIL</span><div class="footer-social"><a href="${CONFIG.social.roblox}" target="_blank" rel="noopener">ROBLOX ↗</a><a href="${CONFIG.social.instagram}" target="_blank" rel="noopener">INSTAGRAM ↗</a><a href="${CONFIG.social.discord}" target="_blank" rel="noopener">DISCORD ↗</a><button class="feedback-trigger" id="feedbackOpen" type="button">SEND FEEDBACK +</button></div></div></footer>
    <div class="lightbox" id="lightbox" role="dialog" aria-modal="true" aria-label="Image preview"><button class="lightbox-close" id="lightboxClose" type="button">CLOSE ✕</button><img id="lightboxImage" alt="Expanded project preview"></div>
    <div class="feedback-overlay" id="feedbackOverlay" aria-hidden="true"><section class="feedback-modal" role="dialog" aria-modal="true" aria-labelledby="feedbackTitle"><div class="overline">A NOTE TO THE CREATOR</div><h2 id="feedbackTitle">Send feedback.</h2><p>Have a thought, suggestion or bug report? Drop it here.</p><form id="feedbackForm"><label>Discord username<input name="discord" maxlength="100" placeholder="your_discord_username" required></label><label>Roblox username<input name="roblox" maxlength="100" placeholder="your_roblox_username" required></label><label>Your message<textarea name="message" maxlength="2000" required></textarea></label><div class="feedback-actions"><button class="button" type="button" id="feedbackCancel">Cancel</button><button class="button button-dark" type="submit">Send message ↗</button></div></form></section></div>
    <div class="feedback-toast" id="feedbackToast" role="status" aria-live="polite"></div>`;
  }
  function setupShell() {
    $("#siteHeader").innerHTML = header();
    $("#siteFooter").innerHTML = footer();
    const toggle = $("#menuToggle"), nav = $("#primaryNav");
    toggle?.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "×" : "☰";
    });
    $("#lightboxClose")?.addEventListener("click", closeLightbox);
    $("#lightbox")?.addEventListener("click", event => { if(event.target.id==="lightbox") closeLightbox(); });
    document.addEventListener("keydown", event => { if(event.key==="Escape"){closeLightbox();closeFeedback();} });
    $("#feedbackOpen")?.addEventListener("click", openFeedback);
    $("#feedbackCancel")?.addEventListener("click", closeFeedback);
    $("#feedbackOverlay")?.addEventListener("click", event => { if(event.target.id==="feedbackOverlay") closeFeedback(); });
    $("#feedbackForm")?.addEventListener("submit", sendFeedback);
  }
  async function loadManifest() {
    const response = await fetch(CONFIG.manifest, {cache:"no-store"});
    if(!response.ok) throw new Error("Portfolio data is temporarily unavailable.");
    const data = await response.json();
    return Array.isArray(data) ? data.slice().sort((a,b)=>(a.number||0)-(b.number||0)) : [];
  }
  function projectCard(item, category, options={}) {
    const image = item.type==="game" ? (item.thumbnails?.[0] || "") : assetURL(item.file);
    const isGame = item.type==="game";
    const number = String(item.number || 0).padStart(2,"0");
    const desc = isGame ? (item.description || "Roblox experience") : "";
    const actions = isGame && item.url ? `<div class="project-actions"><a class="small-link" href="${escapeHTML(item.url)}" target="_blank" rel="noopener">PLAY ON ROBLOX ↗</a></div>` : "";
    return `<article class="project-card" ${image && !isGame ? `data-preview="${escapeHTML(image)}"` : ""}>
      <div class="project-image">${image ? `<img src="${escapeHTML(image)}" alt="${escapeHTML(item.title)}" loading="lazy" decoding="async">` : '<div class="empty-state">PREVIEW NOT AVAILABLE</div>'}</div>
      <div class="project-info"><div class="project-meta">${category} / ${number}</div><h4>${escapeHTML(item.title)}</h4>${isGame && options.description ? `<p>${escapeHTML(desc.slice(0,180))}${desc.length>180?"…":""}</p>` : ""}${actions}</div>
    </article>`;
  }
  function renderCollection(container, items, category, options={}) {
    if(!container) return;
    container.innerHTML = items.length ? items.map(item=>projectCard(item,category,options)).join("") : '<div class="empty-state">Nothing here yet — check back soon.</div>';
    container.querySelectorAll("[data-preview]").forEach(card => card.addEventListener("click", () => openLightbox(card.dataset.preview)));
    container.querySelectorAll("a").forEach(link => link.addEventListener("click", event => event.stopPropagation()));
  }
  async function renderHome() {
    const all = await loadManifest();
    renderCollection($("#homeGames"), all.filter(x=>x.type==="game").slice(0,3), "ROBLOX", {description:true});
    renderCollection($("#homeGfx"), all.filter(x=>x.type==="gfx").slice(0,3), "GFX");
    renderCollection($("#homeModels"), all.filter(x=>x.type==="model").slice(0,3), "3D");
  }
  async function renderGamesPage() {
    const grid=$("#gamesGrid"), search=$("#gameSearch"), count=$("#archiveCount");
    const all=await loadManifest(), games=all.filter(x=>x.type==="game");
    const draw=()=>{
      const q=search.value.trim().toLowerCase();
      const matches=games.filter(game=>(game.title||"").toLowerCase().includes(q));
      count.innerHTML=`${String(matches.length).padStart(2,"0")}<br>PROJECTS`;
      renderCollection(grid,matches,"ROBLOX",{description:true});
    };
    search.addEventListener("input",draw);draw();
  }
  async function renderAssetsPage(type, containerId, countId, category) {
    const all=await loadManifest(), items=all.filter(x=>x.type===type);
    renderCollection($(containerId),items,category);
    const count=$(countId);
    if(count) count.textContent=`${String(items.length).padStart(2,"0")} ITEMS`;
  }
  function renderAudio() {
    const entries=[{url:"https://youtu.be/IAONd2d_PDU?si=-XdG9hDSDfnKqTgM"}];
    const idFromURL=url=>url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{6,})/)?.[1];
    const grid=$("#audioGrid");
    grid.innerHTML=entries.map((entry,index)=>{
      const id=idFromURL(entry.url);
      return id ? `<article class="audio-card"><div class="audio-player"><iframe loading="lazy" src="https://www.youtube.com/embed/${id}?rel=0&modestbranding=1" title="YouTube video" allow="encrypted-media; picture-in-picture" allowfullscreen></iframe></div><div class="audio-info"><div class="project-meta">VIDEO / ${String(index+1).padStart(2,"0")}</div><h3>Loading video title…</h3><p>Watch the original on YouTube.</p><a class="small-link" href="${escapeHTML(entry.url)}" target="_blank" rel="noopener">OPEN ON YOUTUBE ↗</a></div></article>` : "";
    }).join("") || '<div class="empty-state">No audio or video added yet.</div>';
    grid.querySelectorAll("iframe").forEach(async frame=>{
      const videoId=frame.src.split("/embed/")[1]?.split("?")[0];
      const title=$("h3",frame.closest(".audio-card"));
      try{const response=await fetch("https://www.youtube.com/oembed?url="+encodeURIComponent("https://www.youtube.com/watch?v="+videoId)+"&format=json");if(response.ok){const data=await response.json();title.textContent=data.title||"YouTube video";}}catch{title.textContent="YouTube video";}
    });
  }
  function openLightbox(src){const box=$("#lightbox");$("#lightboxImage").src=src;box.classList.add("open");document.body.style.overflow="hidden";}
  function closeLightbox(){const box=$("#lightbox");if(!box)return;box.classList.remove("open");document.body.style.overflow="";}
  function openFeedback(){const box=$("#feedbackOverlay");box.classList.add("open");box.setAttribute("aria-hidden","false");document.body.style.overflow="hidden";}
  function closeFeedback(){const box=$("#feedbackOverlay");if(!box)return;box.classList.remove("open");box.setAttribute("aria-hidden","true");document.body.style.overflow="";}
  function toast(message){const box=$("#feedbackToast");box.textContent=message;box.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>box.classList.remove("show"),3500);}
  async function sendFeedback(event) {
    event.preventDefault();
    const form=event.currentTarget, data=new FormData(form);
    const payload={discordUsername:String(data.get("discord")||"").trim(),robloxUsername:String(data.get("roblox")||"").trim(),message:String(data.get("message")||"").trim()};
    if(!payload.discordUsername||!payload.robloxUsername||!payload.message)return toast("Please complete every field.");
    const last=Number(localStorage.getItem("zyrex_feedback_last")||0);
    if(Date.now()-last<30000)return toast("Please wait before sending another message.");
    const submit=$('button[type="submit"]',form);submit.disabled=true;submit.textContent="Sending…";
    try {
      const response=await fetch(CONFIG.feedbackEndpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      if(!response.ok)throw new Error("Request failed");
      localStorage.setItem("zyrex_feedback_last",String(Date.now()));form.reset();closeFeedback();toast("Feedback sent. Thank you!");
    } catch {toast("Could not send feedback. Please try again later.");}
    finally {submit.disabled=false;submit.textContent="Send message ↗";}
  }
  async function start() {
    setupShell();
    try {
      if(page==="home") await renderHome();
      if(page==="games") await renderGamesPage();
      if(page==="gfx") await renderAssetsPage("gfx","#gfxGrid","#gfxCount","GFX");
      if(page==="models") await renderAssetsPage("model","#modelsGrid","#modelsCount","3D");
      if(page==="audio") renderAudio();
    } catch(error) {
      const target=$("#homeGames, #gamesGrid, #gfxGrid, #modelsGrid, #audioGrid");
      if(target) target.innerHTML=`<div class="empty-state">${escapeHTML(error.message)}</div>`;
    }
  }
  document.addEventListener("DOMContentLoaded",start);
})();