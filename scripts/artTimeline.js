// DATA

const CENTURIES = [
  {
    label: "Renaissance",
    dates: "1400 - 1600",
    startYear: 1400,
    endYear: 1499,
    url: "https://api.artic.edu/api/v1/artworks/search?params=%7B%22query%22%3A%7B%22range%22%3A%7B%22date_start%22%3A%7B%22gte%22%3A1400%2C%22lte%22%3A1499%7D%7D%7D%7D&fields=id,title,date_start,artist_title,image_id&limit=20"
  },
  {
    label: "Baroque",
    dates: "1600 - 1700",
    startYear: 1600,
    endYear: 1699,
    url: "https://api.artic.edu/api/v1/artworks/search?params=%7B%22query%22%3A%7B%22range%22%3A%7B%22date_start%22%3A%7B%22gte%22%3A1600%2C%22lte%22%3A1699%7D%7D%7D%7D&fields=id,title,date_start,artist_title,image_id&limit=20"
  },
  {
    label: "Rococo",
    dates: "1700 - 1780",
    startYear: 1700,
    endYear: 1799,
    url: "https://api.artic.edu/api/v1/artworks/search?params=%7B%22query%22%3A%7B%22range%22%3A%7B%22date_start%22%3A%7B%22gte%22%3A1700%2C%22lte%22%3A1799%7D%7D%7D%7D&fields=id,title,date_start,artist_title,image_id&limit=20"
  },
  {
    label: "Romanticism",
    dates: "1800 - 1850",
    startYear: 1800,
    endYear: 1849,
    url: "https://api.artic.edu/api/v1/artworks/search?params=%7B%22query%22%3A%7B%22range%22%3A%7B%22date_start%22%3A%7B%22gte%22%3A1800%2C%22lte%22%3A1849%7D%7D%7D%7D&fields=id,title,date_start,artist_title,image_id&limit=20"
  },
  {
    label: "Impressionism",
    dates: "1860 - 1900",
    startYear: 1860,
    endYear: 1900,
    url: "https://api.artic.edu/api/v1/artworks/search?params=%7B%22query%22%3A%7B%22range%22%3A%7B%22date_start%22%3A%7B%22gte%22%3A1860%2C%22lte%22%3A1900%7D%7D%7D%7D&fields=id,title,date_start,artist_title,image_id&limit=20"
  }
];

const IIIF = (imageId, size = "400,") =>
  `https://www.artic.edu/iiif/2/${imageId}/full/${size}/0/default.jpg`;

const COPYRIGHT_HTML = `<footer class="view-footer">&copy; 2026 rassefa All Rights Reserved.</footer>`;

// STATE

let artworksCache = {};
let lastDetailId = null;

// ELEMENTS

const container = document.getElementById("artwork-container");
const galleryOverlay = document.getElementById("gallery-overlay");
const galleryGrid = document.getElementById("gallery-grid");
const galleryTitle = document.getElementById("gallery-title");
const galleryDates = document.getElementById("gallery-dates");
const galleryCloseBtn = document.getElementById("gallery-close-btn");
const detailView = document.getElementById("detail-view");
const artistView = document.getElementById("artist-view");

// HELPERS

function hide(...els) {
  els.forEach(el => {
    el.style.display = "none";
  });
}

function show(el, display = "block") {
  el.style.display = display;
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

// BUILD TIMELINE CARDS

async function buildTimeline() {
  const results = await Promise.all(
    CENTURIES.map(c =>
      fetch(c.url)
        .then(r => r.json())
        .then(d => ({ ...c, artworks: (d.data || []).filter(a => a.image_id) }))
        .catch(() => ({ ...c, artworks: [] }))
    )
  );

  container.innerHTML = "";

  results.forEach((century, i) => {
    artworksCache[century.label] = century.artworks;
    const previews = century.artworks.slice(0, 3);

    const section = document.createElement("div");
    section.className = "century-section";
    section.style.animationDelay = `${i * 0.1}s`;

    section.innerHTML = `
      <div class="century-year">${century.startYear}</div>
      <div class="century-card">
        <h2>${escapeHTML(century.label)}</h2>
        <div class="date-range">${escapeHTML(century.dates)}</div>
        <div class="card-images">
          ${previews.map(a => `
            <img class="preview-img skeleton"
                 src="${IIIF(a.image_id)}"
                 alt="${escapeHTML(a.title)}"
                 onload="this.classList.remove('skeleton')"
                 onerror="this.style.display='none'" />
          `).join("")}
        </div>
        <div class="card-cta">View Collection</div>
      </div>
    `;

    section.addEventListener("click", () => openGallery(century));
    container.appendChild(section);
  });
}

// GALLERY OVERLAY

function openGallery(century) {
  galleryTitle.textContent = century.label;
  galleryDates.textContent = century.dates;
  galleryGrid.innerHTML = "";

  const artworks = artworksCache[century.label] || [];
  const carousel = document.createElement("div");
  carousel.className = "gallery-carousel";
  carousel.style.setProperty("--total", Math.max(artworks.length, 1));

  artworks.forEach((artwork, i) => {
    const angle = (Math.PI * 2 * i) / Math.max(artworks.length, 1);
    const radius = 31;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    const rotation = ((i * 23) % 24) - 12;
    const scale = 0.92 + (i % 4) * 0.04;

    const orbit = document.createElement("div");
    orbit.className = "gallery-orbit-item";
    orbit.style.setProperty("--x", `${x.toFixed(2)}vmin`);
    orbit.style.setProperty("--y", `${y.toFixed(2)}vmin`);
    orbit.style.setProperty("--z", Math.round((y + 24) * 2 + i));
    orbit.style.animationDelay = `${i * 0.04}s`;

    const shell = document.createElement("div");
    shell.className = "gallery-item-shell";

    const item = document.createElement("button");
    item.className = "gallery-item";
    item.type = "button";
    item.style.setProperty("--i", i);
    item.style.setProperty("--r", `${rotation}deg`);
    item.style.setProperty("--s", scale.toFixed(2));

    item.innerHTML = `
      <img src="${IIIF(artwork.image_id, "600,")}"
           alt="${escapeHTML(artwork.title)}"
           loading="lazy"
           onerror="this.style.display='none'" />
      <span class="gallery-item-info">
        <span class="gallery-item-title">${escapeHTML(artwork.title)}</span>
        <span class="gallery-item-artist">${escapeHTML(artwork.artist_title || "Unknown")} - ${escapeHTML(artwork.date_start || "")}</span>
      </span>
    `;

    item.addEventListener("click", () => {
      showDetail(artwork.id);
    });

    shell.appendChild(item);
    orbit.appendChild(shell);
    carousel.appendChild(orbit);
  });

  galleryGrid.appendChild(carousel);
  show(galleryOverlay);
  document.body.style.overflow = "hidden";
}

function closeGallery() {
  hide(galleryOverlay);
  document.body.style.overflow = "";
}

galleryCloseBtn.addEventListener("click", closeGallery);

galleryOverlay.addEventListener("click", e => {
  if (e.target === galleryOverlay) closeGallery();
});

// DETAIL VIEW

function showDetail(id) {
  lastDetailId = id;
  detailView.innerHTML = `<div class="detail-inner"><p style="grid-column:1/-1;color:var(--text-muted)">Loading...</p></div>${COPYRIGHT_HTML}`;
  show(detailView, "flex");
  hide(artistView);
  document.body.style.overflow = "hidden";

  fetch(`https://api.artic.edu/api/v1/artworks/${id}?fields=id,title,date_start,artist_title,artist_id,image_id,medium_display,place_of_origin`)
    .then(r => r.json())
    .then(data => {
      const a = data.data;
      detailView.innerHTML = `
        <button class="detail-close" id="detail-close" aria-label="Close artwork">&times;</button>
        <div class="detail-inner">
          <button class="detail-back" id="detail-back">Back to Gallery</button>

          <div class="detail-image-col">
            <img src="${IIIF(a.image_id, "800,")}"
                 alt="${escapeHTML(a.title)}"
                 onerror="this.style.opacity=0" />
          </div>

          <div class="detail-info-col">
            <h2>${escapeHTML(a.title)}</h2>
            <div class="detail-meta">
              <div class="detail-meta-row">
                <span class="detail-meta-label">Artist</span>
                <span class="detail-meta-value" id="artist-trigger"
                  style="${a.artist_id ? "color:var(--accent);cursor:pointer;" : ""}">
                  ${escapeHTML(a.artist_title || "Unknown")}
                </span>
              </div>
              <div class="detail-meta-row">
                <span class="detail-meta-label">Date</span>
                <span class="detail-meta-value">${escapeHTML(a.date_start || "Unknown")}</span>
              </div>
              <div class="detail-meta-row">
                <span class="detail-meta-label">Medium</span>
                <span class="detail-meta-value">${escapeHTML(a.medium_display || "Unknown")}</span>
              </div>
              <div class="detail-meta-row">
                <span class="detail-meta-label">Origin</span>
                <span class="detail-meta-value">${escapeHTML(a.place_of_origin || "Unknown")}</span>
              </div>
            </div>
            ${a.artist_id
          ? `<button class="artist-btn" id="artist-btn">View Artist Profile</button>`
          : ""}
          </div>
        </div>
        ${COPYRIGHT_HTML}
      `;

      document.getElementById("detail-close").addEventListener("click", () => {
        hide(detailView);
        show(galleryOverlay);
        document.body.style.overflow = "hidden";
      });

      document.getElementById("detail-back").addEventListener("click", () => {
        hide(detailView);
        show(galleryOverlay);
        document.body.style.overflow = "hidden";
      });

      if (a.artist_id) {
        const trigger = document.getElementById("artist-trigger");
        const btn = document.getElementById("artist-btn");
        const go = () => showArtist(a.artist_id);
        trigger && trigger.addEventListener("click", go);
        btn && btn.addEventListener("click", go);
      }
    })
    .catch(() => {
      detailView.innerHTML = `
        <button class="detail-close" id="detail-close" aria-label="Close artwork">&times;</button>
        <div class="detail-inner"><p style="grid-column:1/-1;color:var(--text-muted)">Could not load artwork details.</p></div>
        ${COPYRIGHT_HTML}
      `;
      document.getElementById("detail-close").addEventListener("click", () => {
        hide(detailView);
        show(galleryOverlay);
      });
    });
}

// ARTIST VIEW

function showArtist(artistId) {
  artistView.innerHTML = `<div class="artist-inner"><p style="color:var(--text-muted)">Loading...</p></div>${COPYRIGHT_HTML}`;
  show(artistView, "flex");
  hide(detailView);

  fetch(`https://api.artic.edu/api/v1/agents/${artistId}?fields=title,birth_date,death_date,description`)
    .then(r => r.json())
    .then(data => {
      const artist = data.data;
      artistView.innerHTML = `
        <button class="detail-close" id="artist-close" aria-label="Close artist">&times;</button>
        <div class="artist-inner">
          <button class="detail-back" id="artist-back">Back to Artwork</button>
          <h2>${escapeHTML(artist.title || "Unknown Artist")}</h2>
          <div class="artist-dates">
            ${artist.birth_date ? `b. ${escapeHTML(artist.birth_date)}` : ""}
            ${artist.death_date ? ` - d. ${escapeHTML(artist.death_date)}` : ""}
          </div>
          <div class="artist-desc">${artist.description || "No description available."}</div>
        </div>
        ${COPYRIGHT_HTML}
      `;
      

      document.getElementById("artist-close").addEventListener("click", () => {
        hide(artistView);
        show(galleryOverlay);
        document.body.style.overflow = "hidden";
      });

      document.getElementById("artist-back").addEventListener("click", () => {
        hide(artistView);
        if (lastDetailId) showDetail(lastDetailId);
      });
    })
    .catch(() => {
      artistView.innerHTML = `
        <button class="detail-close" id="artist-close" aria-label="Close artist">&times;</button>
        <div class="artist-inner">
          <p style="color:var(--text-muted)">Could not load artist details.</p>
        </div>
        ${COPYRIGHT_HTML}
      `;
      document.getElementById("artist-close").addEventListener("click", () => {
        hide(artistView);
        show(galleryOverlay);
      });
    });
}

// KEYBOARD ESCAPE

document.addEventListener("keydown", e => {
  if (e.key !== "Escape") return;

  if (artistView.style.display !== "none" && artistView.style.display !== "") {
    hide(artistView);
    if (lastDetailId) showDetail(lastDetailId);
  } else if (detailView.style.display !== "none" && detailView.style.display !== "") {
    hide(detailView);
    show(galleryOverlay);
  } else if (galleryOverlay.style.display !== "none" && galleryOverlay.style.display !== "") {
    closeGallery();
  }
});

// INIT

buildTimeline().catch(err => {
  container.innerHTML = "<p style='color:var(--text-muted);padding:40px'>Could not load artwork data. Please try again later.</p>";
  console.error(err);
});


const blobSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
blobSVG.style.cssText = `
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 500px; height: 500px;
  overflow: visible;
  pointer-events: all;
`;
blobSVG.innerHTML = `
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#CF1259" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#CF1259" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <path id="blob-path" fill="url(#bg)" opacity="0.3"/>
`;
galleryOverlay.appendChild(blobSVG);

const path = document.getElementById('blob-path');
const cx = 250, cy = 250;
const POINTS = 8;
let phase = 0, intensity = 22, targetIntensity = 22, opacity = 0.3, targetOpacity = 0.3;

function blobPoint(i, t, intensity) {
  const angle = (i / POINTS) * Math.PI * 2;
  const r = 160 + Math.sin(t * 0.8 + i * 1.3) * intensity
    + Math.cos(t * 0.5 + i * 2.1) * intensity * 0.6;
  return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r];
}

function catmullRom(pts) {
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2[0]} ${p2[1]}`;
  }
  return d + ' Z';
}

function animate() {
  phase += 0.008 + (intensity - 22) * 0.001;
  intensity += (targetIntensity - intensity) * 0.05;
  opacity += (targetOpacity - opacity) * 0.08;
  const pts = Array.from({ length: POINTS }, (_, i) => blobPoint(i, phase, intensity));
  path.setAttribute('d', catmullRom(pts));
  path.setAttribute('opacity', opacity);
  requestAnimationFrame(animate);
}

path.addEventListener('mouseenter', () => { targetIntensity = 55; targetOpacity = 1; });
path.addEventListener('mouseleave', () => { targetIntensity = 22; targetOpacity = 0; });

animate();