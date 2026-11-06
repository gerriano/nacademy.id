/**
 * Copy marked "IG" is taken verbatim from Nacademy's Instagram slides
 * (Google Drive folder). Everything else is new brand copy written for
 * the website and can be edited freely.
 */

// IG slide 01
export const pillars = [
  { title: 'Guidebook Interaktif', rest: 'Premium. Bisa pakai HP / Laptop', icon: 'tap' },
  { title: 'Dikompilasi dari', rest: 'buku, saran psikolog & praktisi healing', icon: 'book' },
  { title: 'Desain Infografis,', rest: 'pasti gak bikin kamu bosan!', icon: 'chart' },
  { title: 'Cocok untuk', rest: 'semua umur dan gender', icon: 'people' },
] as const;

// IG slide 07 — "Yang akan kamu dapatkan di guidebook ini"
export const learnings = [
  'Cara mengenali & membedah stress + kecemasan',
  'Membongkar akar dari perasaan cemas yang hadir',
  'Memahami “batas kendali” & melatih fokus',
  'Menghindari coping mechanism yang salah',
  'Ragam teknik meringankan stress (reframing, safe-place, positive mantra, self-talk, mindfulness, dll)',
  'Teknik positif (Growth Mindset & Happy Chemicals)',
  '7 Days Challenge & Safety Plan',
];

// Techniques named on IG slide 07; descriptions are website copy.
export const methods = [
  {
    name: 'Reframing',
    line: 'Melihat kejadian yang sama dari sudut pandang yang lebih adil dan lebih ringan.',
    detail: 'Pikiran cemas sering memilih tafsiran terburuk. Reframing melatih kita bertanya, “Apa penjelasan lain yang juga masuk akal?” sampai beban emosinya turun.',
    shape: 'frame',
  },
  {
    name: 'Safe-place',
    line: 'Membangun tempat aman di dalam imajinasi untuk kembali saat panik datang.',
    detail: 'Kamu membayangkan sebuah tempat dengan detail suara, warna, dan aroma yang membuatmu tenang, lalu berlatih “pulang” ke sana beberapa menit setiap hari.',
    shape: 'home',
  },
  {
    name: 'Positive mantra',
    line: 'Kalimat pendek yang diulang untuk menahan arus pikiran negatif.',
    detail: 'Mantra yang baik itu realistis dan bisa kamu percaya. Bukan “semua akan sempurna”, tapi “aku bisa melewati ini satu langkah demi satu langkah.”',
    shape: 'wave',
  },
  {
    name: 'Self-talk',
    line: 'Mengganti suara kritik di kepala dengan suara sahabat yang suportif.',
    detail: 'Perhatikan cara kamu bicara pada diri sendiri. Lalu tanyakan, “Apakah aku akan bicara seperti ini pada teman yang sedang kesulitan?”',
    shape: 'bubble',
  },
  {
    name: 'Mindfulness',
    line: 'Hadir penuh di saat ini, tanpa buru-buru menghakimi.',
    detail: 'Mulai dari hal kecil: tarik napas perlahan, rasakan telapak kaki di lantai, sebutkan lima hal yang kamu lihat. Perhatian yang kembali ke sekarang menenangkan tubuh.',
    shape: 'circle',
  },
  {
    name: 'Growth Mindset',
    line: 'Percaya bahwa kemampuan mengelola emosi bisa dilatih.',
    detail: 'Kecemasan bukan identitas. Dengan pola pikir bertumbuh, setiap hari yang berat diperlakukan sebagai bahan belajar, bukan bukti kegagalan.',
    shape: 'grow',
  },
  {
    name: 'Happy Chemicals',
    line: 'Mengenal dopamin, oksitosin, serotonin, dan endorfin, serta cara memancingnya.',
    detail: 'Menyelesaikan tugas kecil, pelukan, sinar matahari pagi, dan olahraga ringan adalah cara sederhana memberi tubuh “bahan bakar” rasa bahagia.',
    shape: 'spark',
  },
] as const;

// First three come from IG slides 03 & 04 (Anxiety Clue Card); the rest are website copy in the same voice.
export const affirmations = [
  { id: 'Apa pun yang terjadi, aku mampu menanganinya, dengan bijaksana dan tenang.' },
  { id: 'Aku tidak perlu menjadi sempurna untuk merasa damai.', en: 'I am enough.' },
  { id: 'Aku berhak mendapatkan pertolongan dan bantuan, aku menerimanya dengan hati bahagia.' },
  { id: 'Perasaan ini datang, dan perasaan ini juga akan berlalu.' },
  { id: 'Aku boleh beristirahat. Istirahat juga bagian dari bertumbuh.' },
  { id: 'Aku cukup melakukan satu langkah kecil hari ini.' },
  { id: 'Napasku adalah jangkar. Aku kembali ke sini, ke saat ini.' },
  { id: 'Aku memilih fokus pada hal yang bisa aku kendalikan.' },
];

// IG slide 08 — "Fleksibel! Pilih format favoritmu"
export const formats = [
  { label: 'Smartphone', img: '/images/formats/smartphone.webp' },
  { label: 'Laptop/PC', img: '/images/formats/laptop.webp' },
  { label: 'Tablet/iPad', img: '/images/formats/tablet.webp' },
  { label: 'Print PDF', img: '/images/formats/print.webp' },
];

// Product facts from IG slides 05, 07, 09, 10, 03. No prices or purchase links in this phase.
export const works = [
  {
    slug: 'first-aid',
    cover: 'first-aid',
    kind: 'Guidebook',
    title: 'First Aid For Stress & Anxiety',
    summary: 'Guidebook ini bisa jadi alternatif pertolongan pertama.',
    body: 'Panduan utama Nacademy untuk mengenali dan membedah stres serta kecemasan, membongkar akarnya, sampai melatih teknik-teknik yang meringankan. Lengkap dengan 7 Days Challenge & Safety Plan.',
    points: ['Interaktif + Bisa diisi', 'Desain infografis', 'Smartphone, laptop, tablet, atau cetak'],
  },
  {
    slug: 'life-audit-wheel',
    cover: 'life-audit',
    kind: 'Guidebook Upgrade Dirimu',
    title: 'Life Audit Wheel',
    summary: 'Hubungan baik, dimulai dari diri kita.',
    body: 'Ukur nilai berbagai aspek dalam dirimu di sini. Di jurnal ini kamu bisa mengisi dengan detail kondisi saat ini, target dan action plannya.',
    points: ['Untuk mengukur & upgrade dirimu', '9 kategori hidup', 'Kondisi, target, action plan'],
  },
  {
    slug: 'anxiety-clue-card',
    cover: 'clue-card',
    kind: 'Deck Kartu Afirmasi',
    title: 'The Anxiety Clue Card',
    summary: 'Cukup 1x klik dan dapatkan afirmasi secara acak untuk meringankan kecemasan.',
    body: 'Buka link via browser smartphone. Sentuh tombol untuk mendapatkan afirmasi secara acak. Gunakan setiap kecemasan hadir.',
    points: ['Buka link via browser smartphone', 'Sentuh tombol untuk afirmasi acak', 'Gunakan setiap kecemasan hadir'],
  },
] as const;

// Instagram slide gallery (files in /public/images/instagram).
// Slides with prices, "GRATIS" bonuses or promo countdowns are left out on
// purpose: this phase of the site is brand-only, no selling.
export const slides = ['01', '02', '03', '05', '07', '08'].map(
  (n) => `/images/instagram/slide-${n}.webp`,
);
