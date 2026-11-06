/**
 * Nacademy contact form → email notification.
 *
 * POST JSON { name, email, topic, message, website, token }
 *  - `website` is a honeypot (must be empty)
 *  - `token` is the Cloudflare Turnstile response
 *
 * Email is sent with Cloudflare Email Routing's `send_email` binding, so
 * nacademy.id must use Cloudflare nameservers with Email Routing enabled,
 * and MAIL_TO must be a verified destination address there.
 */
import { EmailMessage } from 'cloudflare:email';

export interface Env {
  MAILER: SendEmail;
  TURNSTILE_SECRET?: string; // `wrangler secret put TURNSTILE_SECRET`
  ALLOWED_ORIGINS: string;   // comma separated
  MAIL_FROM: string;         // e.g. form@nacademy.id (any address on the Email Routing domain)
  MAIL_TO: string;           // verified destination address
}

type Payload = { name?: unknown; email?: unknown; topic?: unknown; message?: unknown; website?: unknown; token?: unknown };

const TOPICS = new Set(['Pertanyaan umum', 'Kolaborasi', 'Media', 'Masukan']);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const origin = req.headers.get('Origin') || '';
    const allowed = env.ALLOWED_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean);
    const cors = corsHeaders(allowed.includes(origin) ? origin : '');

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (req.method !== 'POST') return json({ ok: false, error: 'Metode tidak didukung' }, 405, cors);
    if (!allowed.includes(origin)) return json({ ok: false, error: 'Asal permintaan tidak diizinkan' }, 403, cors);

    let body: Payload;
    try {
      body = await req.json();
    } catch {
      return json({ ok: false, error: 'Format data tidak valid' }, 400, cors);
    }

    // Honeypot: pretend success so bots learn nothing
    if (typeof body.website === 'string' && body.website.trim() !== '') return json({ ok: true }, 200, cors);

    const name = clean(body.name, 120);
    const email = clean(body.email, 200);
    const topic = TOPICS.has(String(body.topic)) ? String(body.topic) : 'Pertanyaan umum';
    const message = clean(body.message, 4000, true);
    if (!name || !EMAIL_RE.test(email) || !message) {
      return json({ ok: false, error: 'Nama, email yang valid, dan pesan wajib diisi' }, 422, cors);
    }

    if (env.TURNSTILE_SECRET) {
      const ok = await verifyTurnstile(String(body.token || ''), env.TURNSTILE_SECRET, req.headers.get('CF-Connecting-IP'));
      if (!ok) return json({ ok: false, error: 'Verifikasi anti-spam gagal, muat ulang halaman lalu coba lagi' }, 403, cors);
    }

    const raw = buildMime({
      from: `Nacademy Website <${env.MAIL_FROM}>`,
      to: env.MAIL_TO,
      replyName: name.replace(/["<>]/g, ''),
      replyEmail: email,
      subject: `[nacademy.id] ${topic} dari ${name}`,
      text: [
        `Pesan baru dari formulir kontak nacademy.id`,
        ``,
        `Nama  : ${name}`,
        `Email : ${email}`,
        `Topik : ${topic}`,
        `Waktu : ${new Date().toISOString()}`,
        ``,
        `Pesan:`,
        message,
        ``,
        `--`,
        `Balas email ini untuk langsung menjawab ${name}.`,
      ].join('\r\n'),
    });

    try {
      await env.MAILER.send(new EmailMessage(env.MAIL_FROM, env.MAIL_TO, raw));
    } catch (err) {
      console.error('send_email failed', err);
      return json({ ok: false, error: 'Server email sedang bermasalah' }, 502, cors);
    }
    return json({ ok: true }, 200, cors);
  },
};

function clean(v: unknown, max: number, multiline = false): string {
  if (typeof v !== 'string') return '';
  let s = v.replace(/\r\n?/g, '\n').trim().slice(0, max);
  // Header-bound fields must never contain line breaks (header injection)
  if (!multiline) s = s.replace(/[\n\t]/g, ' ');
  return s;
}

async function verifyTurnstile(token: string, secret: string, ip: string | null): Promise<boolean> {
  if (!token) return false;
  const form = new FormData();
  form.append('secret', secret);
  form.append('response', token);
  if (ip) form.append('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form });
  const data = (await res.json()) as { success?: boolean };
  return Boolean(data.success);
}

function b64(s: string) {
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin);
}
const encodeWord = (s: string) => `=?UTF-8?B?${b64(s)}?=`;

function buildMime(m: { from: string; to: string; replyName: string; replyEmail: string; subject: string; text: string }): string {
  const domain = m.from.split('@')[1]?.replace('>', '') || 'nacademy.id';
  const body = b64(m.text).replace(/.{76}/g, '$&\r\n');
  return [
    `From: ${m.from}`,
    `To: ${m.to}`,
    `Reply-To: ${encodeWord(m.replyName)} <${m.replyEmail}>`,
    `Subject: ${encodeWord(m.subject)}`,
    `Message-ID: <${crypto.randomUUID()}@${domain}>`,
    `Date: ${new Date().toUTCString()}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/plain; charset=UTF-8`,
    `Content-Transfer-Encoding: base64`,
    ``,
    body,
  ].join('\r\n');
}

function corsHeaders(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin || 'null',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(data: unknown, status: number, headers: Record<string, string>) {
  return new Response(JSON.stringify(data), { status, headers: { ...headers, 'Content-Type': 'application/json; charset=utf-8' } });
}
