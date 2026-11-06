# nacademy.id

Website brand Nacademy: guidebook interaktif ala infografis untuk mengenali dan mengendalikan stres serta kecemasan.

- **Framework:** Astro (static output), GSAP + ScrollTrigger + SplitText, Lenis smooth scroll
- **Staging:** Vercel (auto-deploy setiap push)
- **Production:** Domainesia, add-on domain, upload via FTP
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

## Staging (Vercel)

Project Vercel terhubung ke repo GitHub ini. Setiap push otomatis membuat deployment.
Framework preset: **Astro**, build command `npm run build`, output `dist`.

Environment variables (Project → Settings → Environment Variables):

| Nama | Isi |
| --- | --- |
| `PUBLIC_FORM_ENDPOINT` | URL Worker, mis. `https://nacademy-contact.<akun>.workers.dev` |
| `PUBLIC_TURNSTILE_SITE_KEY` | Site key Turnstile |

## Production (Domainesia, FTP)

1. `npm run build` dengan `.env` berisi dua variabel di atas (lihat `.env.example`).
2. Di cPanel Domainesia: **Domains → Addon Domain** → `nacademy.id`, catat document root (mis. `public_html/nacademy.id`).
3. Upload **isi** folder `dist/` (termasuk `.htaccess`) ke document root tersebut via FTP (FileZilla / `lftp mirror -R dist/ <docroot>`).
4. Aktifkan SSL (AutoSSL / Let's Encrypt) di cPanel.

> Karena DNS nanti dipegang Cloudflare (untuk Email Routing), di Cloudflare buat record `A nacademy.id → IP server Domainesia` dan `CNAME www → nacademy.id`. Set SSL/TLS mode ke **Full**.

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
