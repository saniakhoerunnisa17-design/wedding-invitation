(() => {
  "use strict";
  const cfg = window.WEDDING_CONFIG;
  const $ = (id) => document.getElementById(id);
  const toast = (message) => {
    const el = $("toast"); el.textContent = message; el.classList.add("show");
    window.setTimeout(() => el.classList.remove("show"), 2800);
  };
  const cleanText = (value, max) => String(value || "").trim().slice(0, max);
  const backendReady = () => Boolean(cfg.backendUrl && /^https:\/\/script\.google\.com\/macros\/s\//.test(cfg.backendUrl));
  const api = async (payload) => {
    if (!backendReady()) throw new Error("Backend belum dikonfigurasi. Silakan hubungi keluarga mempelai.");
    const response = await fetch(cfg.backendUrl, {
      method: "POST", redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error("Server tidak dapat dihubungi. Coba kembali.");
    const result = await response.json();
    if (!result.ok) throw new Error(result.message || "Pengiriman belum berhasil.");
    return result;
  };

  // Personalisasi penerima: teks biasa melalui textContent untuk mencegah injeksi HTML.
  const params = new URLSearchParams(window.location.search);
  const to = cleanText(params.get("to"), 120);
  const guest = cleanText(params.get("guest"), 80);
  const recipient = $("recipientName");
  if (to && guest) recipient.textContent = `${to} · ${guest}`;
  else if (to || guest) recipient.textContent = to || guest;
  else recipient.textContent = "Tamu Undangan";

  $("mapsLink").href = cfg.event.mapsUrl;
  const audio = $("backgroundMusic");
  audio.src = cfg.musicFile;
  audio.volume = 0.35;
  let userPaused = false;
  $("openInvitation").addEventListener("click", async () => {
    $("opening").classList.add("is-hidden");
    $("mainContent").classList.remove("locked");
    $("mainContent").style.visibility = "visible";
    $("mainContent").style.height = "auto";
    $("mainContent").style.overflow = "visible";
    $("bottomNav").hidden = false;
    $("musicToggle").hidden = false;
    try { await audio.play(); $("musicToggle").classList.add("playing"); $("musicToggle").setAttribute("aria-label","Jeda musik"); }
    catch (_) { toast("Musik belum dapat diputar. Tekan tombol ♫ untuk mencoba kembali."); }
    setTimeout(() => $("opening").remove(), 950);
    initReveal();
  });
  $("musicToggle").addEventListener("click", async () => {
    if (audio.paused) {
      userPaused = false;
      try { await audio.play(); $("musicToggle").classList.add("playing"); $("musicToggle").setAttribute("aria-label","Jeda musik"); }
      catch (_) { toast("File musik belum tersedia atau tidak dapat diputar."); }
    } else {
      userPaused = true; audio.pause(); $("musicToggle").classList.remove("playing"); $("musicToggle").setAttribute("aria-label","Putar musik");
    }
  });
  audio.addEventListener("error", () => { if (!userPaused) toast("Tambahkan file MP3 pada assets/music/wedding-music.mp3."); });

  // Countdown menggunakan timestamp dengan offset WIB (+07:00).
  const target = new Date(cfg.event.startISO).getTime();
  function updateCountdown() {
    const diff = target - Date.now();
    if (diff <= 0) {
      $("countdown").hidden = true;
      $("countdownMessage").textContent = "Alhamdulillah, acara pernikahan telah berlangsung.";
      return;
    }
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    $("days").textContent = days; $("hours").textContent = String(hours).padStart(2,"0");
    $("minutes").textContent = String(minutes).padStart(2,"0"); $("seconds").textContent = String(seconds).padStart(2,"0");
  }
  updateCountdown(); window.setInterval(updateCountdown, 1000);

  // Profil foto menggunakan fallback placeholder sampai foto asli diunggah.
  ["adi.jpg","anita.jpg"].forEach((name) => {});
  const gallery = cfg.gallery.slice(0, 9);
  let currentPhoto = 0;
  const grid = $("galleryGrid");
  gallery.forEach((src, index) => {
    const item = document.createElement("div"); item.className = "gallery-item";
    const button = document.createElement("button"); button.type = "button"; button.setAttribute("aria-label", `Buka foto ${index + 1}`);
    const img = document.createElement("img"); img.src = src; img.alt = `Foto prewedding ${index + 1}`; img.loading = "lazy";
    img.onerror = () => { img.src = "assets/images/photo-placeholder.svg"; };
    button.append(img); button.addEventListener("click", () => openLightbox(index)); item.append(button); grid.append(item);
  });
  function showPhoto() {
    $("lightboxImage").src = gallery[currentPhoto];
    $("lightboxImage").onerror = () => { $("lightboxImage").src = "assets/images/photo-placeholder.svg"; };
    $("lightboxCount").textContent = `${currentPhoto + 1} / ${gallery.length}`;
  }
  function openLightbox(index) { currentPhoto = index; showPhoto(); $("lightbox").hidden = false; $("lightboxClose").focus(); }
  function closeLightbox() { $("lightbox").hidden = true; }
  $("lightboxClose").addEventListener("click", closeLightbox);
  $("lightboxPrev").addEventListener("click", () => { currentPhoto = (currentPhoto - 1 + gallery.length) % gallery.length; showPhoto(); });
  $("lightboxNext").addEventListener("click", () => { currentPhoto = (currentPhoto + 1) % gallery.length; showPhoto(); });
  $("lightbox").addEventListener("click", (e) => { if (e.target === $("lightbox")) closeLightbox(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); if (!$("lightbox").hidden && e.key === "ArrowRight") $("lightboxNext").click(); if (!$("lightbox").hidden && e.key === "ArrowLeft") $("lightboxPrev").click(); });

  // Kartu rekening dan aksi salin.
  cfg.accounts.forEach((account) => {
    const card = document.createElement("article"); card.className = "bank-card";
    const bank = document.createElement("p"); bank.className = "bank-name"; bank.textContent = `BANK ${account.bank}`;
    const number = document.createElement("p"); number.className = "account-number"; number.textContent = account.number;
    const owner = document.createElement("p"); owner.className = "account-owner"; owner.textContent = `A/N ${account.owner}`;
    const button = document.createElement("button"); button.className = "button button-outline"; button.type = "button"; button.textContent = "SALIN NOMOR REKENING";
    button.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(account.number.replace(/\s/g, "")); toast("Nomor rekening berhasil disalin."); }
      catch (_) { toast("Clipboard tidak tersedia. Silakan salin nomor rekening secara manual."); }
    });
    card.append(bank, number, owner, button); $("bankGrid").append(card);
  });

  $("rsvpForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget; const name = cleanText(form.elements.name.value, 80);
    const attendance = form.elements.attendance.value; const status = $("rsvpStatus");
    if (!name || !["Hadir","Tidak hadir"].includes(attendance)) { status.textContent = "Mohon lengkapi nama dan status kehadiran."; return; }
    if (form.elements.website.value) return;
    const button = form.querySelector("button"); button.disabled = true; status.textContent = "Mengirim konfirmasi…";
    try { await api({ action:"rsvp", name, attendance, website:"" }); form.reset(); status.textContent = "Terima kasih, konfirmasi Anda berhasil dikirim."; }
    catch (error) { status.textContent = error.message; }
    finally { button.disabled = false; }
  });

  $("guestbookForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget; const name = cleanText(form.elements.name.value, 80);
    const message = cleanText(form.elements.message.value, 500); const status = $("guestbookStatus");
    if (!name || !message) { status.textContent = "Nama dan ucapan wajib diisi."; return; }
    if (form.elements.website.value) return;
    const button = form.querySelector("button"); button.disabled = true; status.textContent = "Mengirim ucapan…";
    try {
      await api({ action:"guestbook", name, message, website:"" });
      form.reset(); status.textContent = "Ucapan berhasil dikirim.";
      await loadGuestbook();
    } catch (error) { status.textContent = error.message; }
    finally { button.disabled = false; }
  });

  async function loadGuestbook() {
    if (!backendReady()) return;
    try {
      const url = new URL(cfg.backendUrl); url.searchParams.set("action","guestbook");
      const response = await fetch(url.toString(), { method:"GET", redirect:"follow" });
      const result = await response.json();
      if (!result.ok) throw new Error(result.message || "Tidak dapat mengambil ucapan.");
      const list = $("guestbookList"); list.replaceChildren();
      (result.entries || []).slice(0, 50).forEach((entry) => {
        const card = document.createElement("article"); card.className = "wish-card";
        const name = document.createElement("strong"); name.textContent = entry.name || "Tamu";
        const message = document.createElement("p"); message.textContent = entry.message || "";
        const time = document.createElement("time"); time.textContent = entry.date || "";
        card.append(name, message, time); list.append(card);
      });
      if (!result.entries || !result.entries.length) list.textContent = "Belum ada ucapan. Jadilah yang pertama mengirim doa.";
    } catch (_) { $("guestbookList").textContent = "Daftar ucapan belum dapat dimuat. Silakan coba beberapa saat lagi."; }
  }
  loadGuestbook();

  $("shareButton").addEventListener("click", async () => {
    const shareData = { title:"The Wedding of Adi & Anita", text:"Undangan pernikahan Adi Sutisna & Anita Intan Lestari — 28 November 2026.", url:window.location.href };
    if (navigator.share) { try { await navigator.share(shareData); } catch (e) { if (e.name !== "AbortError") toast("Undangan belum dapat dibagikan."); } }
    else { try { await navigator.clipboard.writeText(window.location.href); toast("Tautan undangan berhasil disalin."); } catch (_) { toast("Salin tautan dari bilah alamat browser."); } }
  });
  $("whatsappButton").addEventListener("click", () => {
    const number = String(cfg.whatsappNumber || "").replace(/\D/g,"");
    const message = `Assalamu’alaikum Warahmatullahi Wabarakatuh.\nDengan penuh kebahagiaan, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri pernikahan:\nAdi Sutisna & Anita Intan Lestari\nSabtu, 28 November 2026.\nMerupakan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir.\nInformasi lengkap:\n${window.location.href}\nWassalamu’alaikum Warahmatullahi Wabarakatuh.`;
    if (number) window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`,"_blank","noopener");
    else window.open(`https://wa.me/?text=${encodeURIComponent(message)}`,"_blank","noopener");
  });

  function initReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) { items.forEach(el => el.classList.add("visible")); return; }
    const observer = new IntersectionObserver((entries) => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); } }), { threshold:.12 });
    items.forEach(el => observer.observe(el));
  }
  const navLinks = [...document.querySelectorAll(".bottom-nav a")];
  if ("IntersectionObserver" in window) {
    const sections = navLinks.map(link => document.querySelector(link.getAttribute("href"))).filter(Boolean);
    const navObserver = new IntersectionObserver((entries) => entries.forEach(entry => {
      if (entry.isIntersecting) navLinks.forEach(link => link.classList.toggle("active", link.hash === `#${entry.target.id}`));
    }), { rootMargin:"-35% 0px -55% 0px" });
    sections.forEach(section => navObserver.observe(section));
  }
})();