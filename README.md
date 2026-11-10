# Wedding Invitation — Adi & Anita

Website undangan digital premium, mobile-first, menggunakan HTML5, CSS3, JavaScript Vanilla, Google Sheets, dan Google Apps Script.

## 1. Struktur proyek

```text
wedding-invitation/
├── index.html
├── style.css
├── script.js
├── config.js
├── assets/
│   ├── images/
│   │   ├── couple-cover.jpg       # unggah foto utama pasangan
│   │   ├── adi.jpg                # unggah foto Adi
│   │   ├── anita.jpg              # unggah foto Anita
│   │   └── gallery-1.jpg ... gallery-12.jpg
│   └── music/
│       └── wedding-music.mp3      # MP3 milik pemilik undangan
└── google-apps-script/
    └── Code.gs
```

## 2. Aset yang perlu dilengkapi

- `assets/images/couple-cover.jpg`: foto utama untuk cover dan hero.
- `assets/images/adi.jpg` dan `assets/images/anita.jpg`: foto profil masing-masing.
- `assets/images/gallery-1.jpg` sampai `gallery-12.jpg`: 12 foto galeri (tambahkan hingga 9 melalui `config.js`).
- `assets/music/wedding-music.mp3`: musik latar. Musik hanya dimulai setelah tombol **BUKA UNDANGAN** ditekan.
- URL Web App Apps Script sudah dipasang pada `config.js` (deployment yang diberikan pemilik).
- Nomor WhatsApp keluarga (opsional) pada `config.js`. Jika belum diisi, tombol WhatsApp membuka pilihan berbagi tanpa nomor tujuan.

Sediakan gambar JPG/WebP terkompresi, idealnya lebar 1200–1600 px dan ukuran sekitar 200–400 KB per foto. Jangan unggah foto berhak cipta tanpa izin.

## 3. Konfigurasi data

Edit `config.js`. Semua data acara, profil, peta, rekening, musik, galeri, URL backend, dan WhatsApp terpusat di sana. Pastikan nama file aset sesuai huruf besar/kecil.

Personalisasi penerima:
- `?to=Keluarga+Bapak+Ahmad`
- `?guest=Ahmad`
- `?to=Keluarga+Bapak+Ahmad&guest=Ahmad`

Parameter dibaca menggunakan `URLSearchParams` dan dimasukkan sebagai teks biasa, bukan HTML.

## 4. Menyiapkan Google Sheets

1. Buat spreadsheet baru di Google Sheets.
2. Salin ID spreadsheet dari URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`.
3. Buat dua sheet bernama persis `RSVP` dan `Guestbook` (script juga dapat membuatnya otomatis).
4. Header:
   - RSVP: `Timestamp | Nama | Status Kehadiran`
   - Guestbook: `Timestamp | Nama | Ucapan atau Doa`
5. Batasi akses spreadsheet hanya kepada pemilik/pengelola tepercaya. Jangan publikasikan sheet RSVP.

## 5. Memasang Google Apps Script

1. Dari spreadsheet, pilih **Ekstensi → Apps Script**.
2. Ganti isi `Code.gs` dengan isi file `google-apps-script/Code.gs`.
3. Ganti `GANTI_DENGAN_ID_GOOGLE_SHEET` dengan ID spreadsheet.
4. Simpan proyek.
5. Pilih **Deploy → New deployment**.
6. Pilih jenis **Web app**.
7. Execute as: **Me**.
8. Who has access: **Anyone** agar tamu dapat mengirim data tanpa login (pertimbangkan implikasi endpoint publik).
9. Deploy, berikan izin akses, lalu salin URL berakhiran `/exec`.
10. URL deployment aktif yang diberikan pemilik sudah dimasukkan ke `backendUrl` dalam `config.js`. Jika membuat deployment baru, perbarui URL tersebut.

Setiap perubahan kode Apps Script setelah deployment perlu diterbitkan sebagai versi deployment baru melalui **Deploy → Manage deployments → Edit → New version**.

### Catatan penting integrasi lintas-domain

Browser dan konfigurasi akun Google dapat memengaruhi pembacaan respons `fetch()` dari Apps Script karena pengalihan lintas-domain/CORS. Uji RSVP dan Guestbook dari domain hosting publik, bukan hanya dari editor Apps Script. Jika browser menolak respons CORS, gunakan proxy backend HTTPS milik sendiri atau endpoint serverless tepercaya; jangan menganggap kiriman berhasil hanya karena tombol telah ditekan. Kode frontend menampilkan status sukses hanya setelah menerima JSON `{ "ok": true }`.

Pembatasan spam pada contoh ini bersifat dasar (honeypot + CacheService berdasarkan nama/aksi), bukan perlindungan anti-bot kuat. Untuk skala besar, tambahkan CAPTCHA atau rate limit berbasis IP melalui backend tepercaya.

## Status integrasi backend

- Spreadsheet ID sudah dipasang di `google-apps-script/Code.gs`.
- URL Web App `/exec` sudah dipasang di `config.js`.
- Integrasi siap diuji setelah situs diunggah ke hosting HTTPS. Akses langsung endpoint melalui pemeriksa web dapat gagal mengikuti redirect Google, sehingga hal tersebut bukan bukti bahwa deployment rusak.
- Uji RSVP dan Guestbook dari website publik; pastikan baris baru muncul di tab `RSVP` dan `Guestbook`. Jangan menyatakan backend aktif sebelum pengujian kirim data berhasil.

## 6. Hosting HTTPS

Anda dapat memakai hosting statis yang mendukung HTTPS (misalnya GitHub Pages, Netlify, atau Cloudflare Pages; cek kebijakan dan batas layanan masing-masing).

1. Unggah seluruh isi folder `wedding-invitation` ke repositori/folder publik hosting.
2. Pastikan `index.html`, CSS, JS, `config.js`, dan folder `assets` berada pada struktur yang sama.
3. Aktifkan HTTPS pada pengaturan hosting.
4. Buka URL publik di HP dan desktop.
5. Uji semua foto, musik, tautan Maps, tombol salin rekening, personalisasi URL, navigasi, RSVP, dan buku tamu.

## 7. Embed ke Google Sites

1. Buka Google Sites dan edit situs.
2. Pilih **Sisipkan → Sematkan**.
3. Pilih tab **Menurut URL**, masukkan URL HTTPS website undangan.
4. Klik Sisipkan.
5. Atur lebar dan tinggi frame. Beri tinggi yang cukup agar halaman tidak terasa terpotong.
6. Publikasikan Google Sites.
7. Uji hasil di HP dan desktop.

Utamakan embed melalui URL website publik. Sediakan juga tautan langsung ke website undangan untuk pengalaman layar penuh. Beberapa fitur browser (musik, clipboard, share) dapat memiliki pembatasan ketika berjalan di dalam iframe; uji dari Google Sites dan sediakan opsi buka halaman penuh.

## 8. Checklist pengujian

- [ ] Cover menampilkan foto pasangan asli.
- [ ] Buka Undangan menutup cover, membuka konten, dan mencoba memulai musik.
- [ ] Musik tidak berjalan sebelum interaksi pengguna; play/pause berfungsi.
- [ ] Nama penerima benar untuk parameter `to`, `guest`, dan keduanya.
- [ ] Profil, tanggal, jam, alamat, dan Maps benar.
- [ ] Countdown mengarah ke 28 November 2026 pukul 09.00 WIB.
- [ ] Setelah waktu acara, pesan “Alhamdulillah, acara pernikahan telah berlangsung.” tampil.
- [ ] Galeri 5–9 foto, lightbox, tombol next/previous/close berfungsi.
- [ ] RSVP menolak input kosong dan menyimpan ke sheet RSVP.
- [ ] Tidak ada endpoint publik yang membaca data RSVP.
- [ ] Guestbook menyimpan ucapan dan menampilkan entri terbaru lebih dahulu.
- [ ] Uji teks HTML/script pada ucapan; harus tampil sebagai teks biasa.
- [ ] Tombol salin rekening menyalin nomor tanpa spasi.
- [ ] Web Share API atau fallback salin tautan berfungsi.
- [ ] Tombol WhatsApp tidak memakai nomor rekaan.
- [ ] Tidak ada horizontal scrolling pada lebar 360 px.
- [ ] Navigasi bawah tidak menutupi bagian akhir konten.
- [ ] Tampilan diuji pada Android, iPhone, tablet, laptop, dan embed Google Sites.

## 9. Data acara yang telah dimasukkan

- Mempelai: Adi Sutisna & Anita Intan Lestari.
- Hari/tanggal: Sabtu, 28 November 2026.
- Akad: 09.00–11.00 WIB.
- Resepsi: 11.00 WIB sampai selesai.
- Tempat: Rumah Mempelai Wanita, Kp. Sindang Heula RT. 03 RW. 12, Desa Bayongbong, Kecamatan Bayongbong, Kabupaten Garut.
- Dress code: Tidak ada ketentuan khusus.
- Love Story dan video prewedding tidak disertakan.
