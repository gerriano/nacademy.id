# nacademy.id

Website brand Nacademy: guidebook interaktif ala infografis untuk mengenali dan mengendalikan stres serta kecemasan.

- **Framework:** Astro (static output), GSAP + ScrollTrigger + SplitText, Lenis smooth scroll
- **Staging:** Vercel, otomatis setiap push → https://nacademy-id.vercel.app
- **Production:** Domainesia (add-on domain), dirilis manual via GitHub Actions + FTP → https://nacademy.id
- **Form kontak:** Cloudflare Worker + Turnstile + Email Routing (`worker/`)

## Menjalankan lokal

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # hasil di dist/
npm run preview
```

## Struktur

```
src/
  data/site.ts         nama, URL, Instagram, menu, endpoint form
  data/content.ts      semua copy brand (yang bertanda "IG" diambil verbatim dari slide Instagram)
  content/jurnal/*.md  artikel jurnal (tambah file .md baru = artikel baru)
  pages/               Beranda, Tentang, Pendekatan, Karya, Jurnal, Kontak, 404
  components/          Header, Footer, Logo, BookCover, AffirmationDeck, dll.
  scripts/motion.ts    mesin animasi global (data-split, data-reveal, data-scrub-text, ...)
  styles/global.css    design tokens (warna, tipografi, spacing) + light/dark
public/
  images/              aset gambar
  og/default.png       gambar Open Graph (regenerasi: node scripts/og.mjs)
  .htaccess            aturan Apache untuk production Domainesia
worker/                Cloudflare Worker untuk form kontak
scripts/build-artifact.mjs  versi website untuk Artifact review di Claude
```

Animasi menghormati `prefers-reduced-motion`; tanpa JavaScript semua konten tetap terbaca.

## Alur rilis: staging → production

```
push ke GitHub ──► Vercel build ──► https://nacademy-id.vercel.app   (STAGING, otomatis)
                                        │  cek di HP & desktop, beri komentar
                                        ▼
tag v1.x.x / tombol "Run workflow" ──► GitHub Actions build ──► FTP ──► https://nacademy.id   (PRODUCTION)
```

Production **tidak pernah** ter-update otomatis hanya karena ada push. Yang naik ke production adalah commit yang sudah dicek di staging, dan Anda sendiri yang memicunya.

| | Staging | Production |
| --- | --- | --- |
| Host | Vercel | Domainesia (cPanel add-on domain) |
| URL | nacademy-id.vercel.app | nacademy.id |
| Kapan update | setiap push | saat tag `v*` di-push atau workflow dijalankan manual |
| Google | `noindex` (header + meta), tidak bersaing dengan production | diindeks, `robots.txt` + sitemap |
| Penanda | badge "Staging · <commit>" di pojok kiri bawah | tidak ada |

### Staging (Vercel)

Project `nacademy-id` di Vercel (team Gerriano) terhubung ke repo ini; konfigurasi build ada di `vercel.json`.
Environment variables (Project → Settings → Environment Variables), isi setelah form Cloudflare siap:

| Nama | Isi |
| --- | --- |
| `PUBLIC_FORM_ENDPOINT` | URL Worker, mis. `https://nacademy-contact.<akun>.workers.dev` |
| `PUBLIC_TURNSTILE_SITE_KEY` | Site key Turnstile |

### Production (Domainesia via GitHub Actions)

Persiapan sekali saja:

1. cPanel Domainesia → **Domains / Addon Domains** → tambahkan `nacademy.id`. Catat *document root* (mis. `/public_html/nacademy.id/`).
2. cPanel → **FTP Accounts** → buat akun FTP khusus yang direktorinya dibatasi ke document root itu. Jangan pakai akun cPanel utama.
3. GitHub repo → **Settings → Secrets and variables → Actions**:
   - *Secrets*: `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`, `FTP_SERVER_DIR` (diakhiri `/`. Jika akun FTP sudah dibatasi ke document root, isi `./`)
   - *Variables* (opsional): `PUBLIC_FORM_ENDPOINT`, `PUBLIC_TURNSTILE_SITE_KEY`, `FTP_PROTOCOL` (`ftps` default; isi `ftp` hanya jika server menolak FTPS)
4. (Disarankan) **Settings → Environments → production** → aktifkan *Required reviewers* supaya setiap deploy production butuh klik persetujuan.
5. cPanel → **SSL/TLS Status** → jalankan AutoSSL untuk `nacademy.id`.

Merilis versi baru:

```bash
git tag v1.0.0
git push origin v1.0.0
```

atau GitHub → **Actions → Deploy production → Run workflow**. Workflow menjalankan `astro check`, build mode production, menolak deploy bila hasil build ternyata build staging, lalu meng-upload hanya file yang berubah.

Rollback: jalankan workflow pada tag versi sebelumnya (Run workflow → pilih tag).

> Bila DNS dipindah ke Cloudflare (untuk Email Routing): buat record `A nacademy.id → IP server Domainesia` dan `CNAME www → nacademy.id`, lalu set SSL/TLS mode ke **Full** (bukan Flexible, karena Flexible membuat redirect loop dengan `.htaccess`).

## Form kontak (Cloudflare)

Alur: browser → Worker (`worker/src/index.ts`) → verifikasi Turnstile → kirim email via binding `send_email` → kotak masuk tujuan.

Langkah setup (sekali saja):

1. **Pindahkan nameserver** `nacademy.id` ke Cloudflare (Add site di dashboard Cloudflare, lalu ganti NS di panel domain).
2. **Email Routing:** Cloudflare → nacademy.id → Email → Email Routing → Enable. Tambahkan alamat email tujuan di *Destination addresses* dan klik link verifikasi yang dikirim ke email itu.
3. **Turnstile:** Cloudflare → Turnstile → Add widget, hostname `nacademy.id` (+ domain staging Vercel). Simpan *site key* dan *secret key*.
4. **Worker:**
   ```bash
   cd worker
   npm install
   # ganti GANTI-DENGAN-EMAIL-TUJUAN@contoh.com di wrangler.toml (2 tempat) dengan email yang sudah diverifikasi
   npx wrangler login
   npx wrangler secret put TURNSTILE_SECRET
   npx wrangler deploy
   ```
5. Isi `PUBLIC_FORM_ENDPOINT` dan `PUBLIC_TURNSTILE_SITE_KEY` di Vercel / `.env`, lalu build ulang.

Uji lokal tanpa kirim email sungguhan: `cd worker && npx wrangler dev` (email disimpan sebagai file `.eml` di `.wrangler/tmp`).

Keamanan Worker: hanya menerima origin di `ALLOWED_ORIGINS`, honeypot anti-bot, validasi input, nama/subjek dibersihkan dari karakter baris baru (mencegah header injection), Turnstile wajib bila secret terpasang.

## Review UI/UX lewat Artifact

```bash
npm run build:artifact   # hasil di dist-artifact/
```

Versi ini dipublikasikan sebagai Artifact di Claude agar bisa diberi komentar per bagian.

## Catatan konten

- Copy dari slide Instagram dipakai apa adanya. Slide berisi harga/promo sengaja tidak ditampilkan (fase brand, belum jualan).
- Halaman Karya belum punya tombol beli; link produk ditambahkan di fase berikutnya.
- Sampul buku digambar dengan CSS karena file sampul asli belum ada. Ganti dengan `<BookCover img="/images/...">` bila file tersedia.
- Logo masih rekonstruksi (file asli hanya JPG 150×150). Kirim SVG/PNG resolusi tinggi untuk diganti.
