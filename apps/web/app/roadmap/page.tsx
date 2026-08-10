import Link from 'next/link';

const review = [
  {
    title: 'Core flow yang sudah kuat',
    notes: ['CRM → Booking → Invoice → Payment sudah nyambung.', 'Task / Project sudah bisa dipakai untuk operasional internal.', 'Public website sudah bisa menjadi kanal booking dan preview paket.'],
    score: '8.8/10',
  },
  {
    title: 'Area paling berdampak untuk dipoles',
    notes: ['Dashboard owner perlu lebih analitis dan ringkas.', 'Dokumen print/download butuh format yang seragam.', 'Search, filter, dan pagination sebaiknya konsisten di semua modul besar.'],
    score: '8.4/10',
  },
  {
    title: 'Lapisan yang masih bisa ditingkatkan',
    notes: ['Approval flow yang lebih formal.', 'Activity timeline lintas modul.', 'Role dashboard khusus per jabatan.'],
    score: '8.1/10',
  },
];

const templates = [
  {
    title: 'Pelanggan Demo',
    tag: 'CRM',
    body: 'Rina Wijaya, customer keluarga, booking Singapore 3D2N, follow-up via WhatsApp.',
  },
  {
    title: 'Trip Sheet PIC',
    tag: 'Operations',
    body: 'Berisi PIC utama, petugas tambahan, progress, last update, dan status selesai.',
  },
  {
    title: 'Itinerary Paket',
    tag: 'Public Web',
    body: 'Rundown hari per hari, destinasi, meeting point, fasilitas, dan info penting.',
  },
  {
    title: 'Invoice Filter',
    tag: 'Finance',
    body: 'Pencarian invoice berdasarkan tanggal, status, sort, dan export CSV hasil filter.',
  },
  {
    title: 'Cashflow Template',
    tag: 'Finance',
    body: 'Pencatatan uang masuk / keluar, biaya tetap, biaya trip, dan operasional.',
  },
  {
    title: 'Project Sprint',
    tag: 'Work',
    body: 'Proyek berjalan dengan milestone, target bulanan, task, dan progress rata-rata.',
  },
];

const priorities = [
  'Satukan tone UI agar semua modul terasa satu keluarga.',
  'Tambahkan print/PDF profesional untuk booking, trip sheet, quotation, dan invoice.',
  'Buat role dashboard: Owner, Sales, Operations, Finance, PIC Trip.',
  'Tambahkan timeline aktivitas lintas CRM, booking, task, dan finance.',
  'Rapikan preset template dummy agar onboarding user baru lebih cepat.',
];

const moduleMap = [
  ['Dashboard', '/dashboard', 'Ringkasan bisnis dan prioritas harian.'],
  ['CRM Customers', '/crm/customers', 'Lead, customer, pipeline, follow-up.'],
  ['Bookings', '/bookings', 'Booking satu trip dengan variasi peserta.'],
  ['Trips', '/operations/trips', 'Trip operasional dan assignment.'],
  ['Tasks', '/tasks', 'Task planner, PIC, komentar, print sheet.'],
  ['Projects', '/projects', 'Milestone, target, dan progress proyek.'],
  ['Finance', '/finance/invoices', 'Invoice, payment, cashflow.'],
  ['Reports', '/reports', 'Rekap bulanan dan export data.'],
  ['Settings', '/settings', 'Branding, kontak, logo, sosial media.'],
];

export default function RoadmapPage() {
  return (
    <main className="modulePage">
      <div className="moduleHeading">
        <div>
          <p>ERP MASTER REVIEW</p>
          <h1>Review Master ERP</h1>
          <span>Rangkuman status modul, ide penyempurnaan, dan template dummy untuk mempercepat evaluasi sistem.</span>
        </div>
        <Link href="/">← Beranda</Link>
      </div>

      <section className="bookingSummary">
        <article><span>Kondisi keseluruhan</span><b>Siap dipakai</b><small>Dengan ruang penguatan di UX dan document workflow.</small></article>
        <article><span>Fokus utama</span><b>CRM + Booking</b><small>Karena ini pintu masuk pendapatan dan pelanggan.</small></article>
        <article><span>Fokus berikutnya</span><b>Work + Finance</b><small>Supaya operasional dan kontrol uang makin rapi.</small></article>
      </section>

      <section className="cardGrid" style={{ marginTop: 18 }}>
        {review.map((item) => (
          <article className="workCard" key={item.title}>
            <h2>{item.title}</h2>
            <strong>{item.score}</strong>
            <ul>
              {item.notes.map((note) => <li key={note}>{note}</li>)}
            </ul>
          </article>
        ))}
      </section>

      <section className="cardGrid" style={{ marginTop: 18 }}>
        {templates.map((item) => (
          <article className="workCard" key={item.title}>
            <span className="cardMeta">{item.tag}</span>
            <h2>{item.title}</h2>
            <p>{item.body}</p>
          </article>
        ))}
      </section>

      <section className="cardGrid" style={{ marginTop: 18 }}>
        <article className="workCard">
          <h2>Prioritas ide berikutnya</h2>
          <ul>
            {priorities.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </article>
        <article className="workCard">
          <h2>Daftar modul yang perlu konsisten UI</h2>
          <ul>
            {moduleMap.map(([name, href, desc]) => (
              <li key={name}>
                <Link href={href}>{name}</Link> — {desc}
              </li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}
