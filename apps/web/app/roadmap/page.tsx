import Link from 'next/link';

const sections = [
  {
    title: 'Modul inti yang wajib kuat',
    items: ['CRM', 'Booking / Sales Order', 'Task & Project', 'Finance'],
  },
  {
    title: 'Modul penunjang',
    items: ['Vendor & Procurement', 'Operations', 'Inventory / Asset', 'Report & Dashboard'],
  },
  {
    title: 'Lapisan kontrol',
    items: ['Approval & Audit Trail', 'Security', 'Template otomatis', 'Notifikasi lanjutan'],
  },
];

export default function RoadmapPage() {
  return (
    <main className="modulePage">
      <div className="moduleHeading">
        <div>
          <p>ERP ROADMAP</p>
          <h1>Peta Modul ERP</h1>
          <span>Ini adalah urutan penguatan modul yang paling masuk akal untuk sistem yang makin canggih.</span>
        </div>
        <Link href="/">← Beranda</Link>
      </div>

      <section className="bookingSummary">
        <span>Status</span>
        <strong>Fokus: CRM → Booking → Task → Finance → Audit</strong>
        <small>Urutan ini menjaga alur bisnis tetap rapi dan mudah ditumbuhkan tanpa membuat sistem kacau.</small>
      </section>

      <div className="gridView">
        {sections.map((section) => (
          <article className="card" key={section.title}>
            <h3>{section.title}</h3>
            <ul>
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <section className="card">
        <h3>Target hasil akhir</h3>
        <p>ERP harus bisa menerima lead, mengubahnya jadi booking, mengatur tugas internal, mencatat transaksi, memantau vendor, dan menyajikan dashboard yang mudah dibaca.</p>
      </section>
    </main>
  );
}
