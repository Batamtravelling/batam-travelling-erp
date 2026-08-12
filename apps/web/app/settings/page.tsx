'use client';

import { FormEvent, useEffect, useState } from 'react';
import { apiGet, apiPatch, apiUpload } from '../../lib/api';

type Profile = {
  vision: string;
  mission: string;
  coreValues?: string;
  customerTerms?: string;
  privacyPolicy?: string;
  cancellationPolicy?: string;
  websiteLogoUrl?: string;
  erpLogoUrl?: string;
  documentLogoUrl?: string;
  homepageSections?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroImageUrl?: string;
  heroBadge?: string;
  heroCtaPrimary?: string;
  heroCtaSecondary?: string;
  featureHeadline?: string;
  featureText?: string;
  howToBookTitle?: string;
  howToBookText?: string;
  aboutTitle?: string;
  aboutText?: string;
  whatsappNumber?: string;
  whatsappNumberSecondary?: string;
  contactEmail?: string;
  contactAddress?: string;
  contactHours?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  youtubeUrl?: string;
};

const blank: Profile = { vision: '', mission: '' };

async function upload(file: File) {
  const form = new FormData();
  form.set('file', file);
  return apiUpload<{ url: string }>('/media/upload', form);
}

export default function SettingsPage() {
  const [p, setP] = useState<Profile>(blank);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    apiGet<Profile | null>('/asset-knowledge/profile').then((x) => x && setP(x)).catch((e) => setMsg((e as Error).message));
  }, []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg('Menyimpan pengaturan...');
    const f = new FormData(e.currentTarget);
    const next = { ...p };
    for (const key of ['websiteLogo', 'erpLogo', 'documentLogo'] as const) {
      const file = f.get(key) as File;
      if (file?.size) {
        const media = await upload(file);
        next[`${key}Url` as keyof Profile] = media.url;
      }
    }
    for (const key of ['vision', 'mission', 'homepageSections', 'heroTitle', 'heroSubtitle', 'heroImageUrl', 'heroBadge', 'heroCtaPrimary', 'heroCtaSecondary', 'featureHeadline', 'featureText', 'howToBookTitle', 'howToBookText', 'aboutTitle', 'aboutText', 'whatsappNumber', 'whatsappNumberSecondary', 'contactEmail', 'contactAddress', 'contactHours', 'instagramUrl', 'facebookUrl', 'tiktokUrl', 'youtubeUrl'] as const) {
      next[key] = String(f.get(key) || '');
    }
    await apiPatch('/asset-knowledge/profile', next);
    setP(next);
    setMsg('Branding, kontak, dan sosial media berhasil disimpan. Muat ulang halaman untuk melihat perubahan.');
  }

  return (
    <main className="brandSettings">
      <header>
        <span>PENGATURAN PERUSAHAAN</span>
        <h1>Branding, Logo, Kontak & Sosial</h1>
        <p>Satu pengaturan untuk website, ERP, quotation, bukti pembayaran, WhatsApp, dan media sosial.</p>
      </header>
      <form onSubmit={submit}>
        <section>
          <h2>Konten halaman Index</h2>
          <div className="contactSettings">
            <label className="full">Visi perusahaan<textarea name="vision" defaultValue={p.vision} required /></label>
            <label className="full">Misi perusahaan<textarea name="mission" defaultValue={p.mission} required /></label>
            <label className="full">
              Section aktif
              <input name="homepageSections" defaultValue={p.homepageSections} placeholder="hero,highlights,tickets,trips,how-to-book,about" />
              <small>Pisahkan dengan koma. Kosongkan untuk memakai default.</small>
            </label>
            <label className="full">
              Hero title
              <textarea name="heroTitle" defaultValue={p.heroTitle} placeholder={'Liburan terbaik\ndimulai dari Batam.'} />
            </label>
            <label className="full">
              Hero subtitle
              <textarea name="heroSubtitle" defaultValue={p.heroSubtitle} placeholder="Semua kebutuhan perjalanan tersusun rapi dalam satu pengalaman yang mudah, cepat, dan nyaman." />
            </label>
            <label>
              Badge hero
              <input name="heroBadge" defaultValue={p.heroBadge} placeholder="BERANGKAT DARI BATAM" />
            </label>
            <label>
              Label CTA utama
              <input name="heroCtaPrimary" defaultValue={p.heroCtaPrimary} placeholder="Lihat Open Trip" />
            </label>
            <label>
              Label CTA kedua
              <input name="heroCtaSecondary" defaultValue={p.heroCtaSecondary} placeholder="Cara Booking" />
            </label>
            <label className="full">
              Gambar hero body atas
              <input name="heroImageUrl" defaultValue={p.heroImageUrl} placeholder="https://..." />
            </label>
            <label className="full">
              Headline fitur
              <input name="featureHeadline" defaultValue={p.featureHeadline} placeholder="Template preview nyata" />
            </label>
            <label className="full">
              Copy fitur
              <textarea name="featureText" defaultValue={p.featureText} placeholder="Contoh tampilan siap pakai..." />
            </label>
            <label className="full">
              Judul how to book
              <input name="howToBookTitle" defaultValue={p.howToBookTitle} placeholder="Booking perjalanan dibuat lebih ringkas" />
            </label>
            <label className="full">
              Teks how to book
              <textarea name="howToBookText" defaultValue={p.howToBookText} placeholder="Lihat detail, pilih jadwal, isi data..." />
            </label>
            <label className="full">
              Judul about
              <input name="aboutTitle" defaultValue={p.aboutTitle} placeholder="Perjalanan yang tertata..." />
            </label>
            <label className="full">
              Teks about
              <textarea name="aboutText" defaultValue={p.aboutText} placeholder="Kami membantu keluarga..." />
            </label>
          </div>
        </section>

        <section>
          <h2>Logo perusahaan</h2>
          <p>Gunakan PNG atau WEBP transparan, disarankan rasio horizontal.</p>
          <div className="logoSettings">
            {[
              ['websiteLogo', 'Logo Website', p.websiteLogoUrl],
              ['erpLogo', 'Logo ERP', p.erpLogoUrl],
              ['documentLogo', 'Logo Dokumen', p.documentLogoUrl],
            ].map((x) => (
              <label key={x[0]}>
                <b>{x[1]}</b>
                <span className="logoPreview">{x[2] ? <img src={x[2]} alt={x[1]} /> : <i>BT</i>}</span>
                <input name={x[0]} type="file" accept="image/png,image/jpeg,image/webp" />
                <small>{x[2] ? 'Logo aktif tersimpan' : 'Belum ada logo khusus'}</small>
              </label>
            ))}
          </div>
        </section>

        <section>
          <h2>Kontak & WhatsApp</h2>
          <div className="contactSettings">
            <label>
              Nomor WhatsApp Utama
              <input name="whatsappNumber" defaultValue={p.whatsappNumber} placeholder="6281234567890" />
              <small>Gunakan kode negara tanpa tanda +.</small>
            </label>
            <label>
              Nomor WhatsApp Kedua
              <input name="whatsappNumberSecondary" defaultValue={p.whatsappNumberSecondary} placeholder="6281234567891" />
              <small>Nomor cadangan untuk rotasi chat.</small>
            </label>
            <label>
              Email
              <input name="contactEmail" type="email" defaultValue={p.contactEmail} placeholder="hello@batamtravelling.com" />
            </label>
            <label>
              Jam pelayanan
              <input name="contactHours" defaultValue={p.contactHours} placeholder="Senin–Sabtu, 09.00–18.00 WIB" />
            </label>
            <label className="full">
              Alamat
              <textarea name="contactAddress" defaultValue={p.contactAddress} placeholder="Alamat kantor lengkap" />
            </label>
          </div>
        </section>

        <section>
          <h2>Sosial media</h2>
          <div className="contactSettings">
            <label>
              Instagram
              <input name="instagramUrl" defaultValue={p.instagramUrl} placeholder="https://instagram.com/batamtravelling" />
            </label>
            <label>
              Facebook
              <input name="facebookUrl" defaultValue={p.facebookUrl} placeholder="https://facebook.com/batamtravelling" />
            </label>
            <label>
              TikTok
              <input name="tiktokUrl" defaultValue={p.tiktokUrl} placeholder="https://tiktok.com/@batamtravelling" />
            </label>
            <label>
              YouTube
              <input name="youtubeUrl" defaultValue={p.youtubeUrl} placeholder="https://youtube.com/@batamtravelling" />
            </label>
          </div>
        </section>

        <button className="saveBrand">Simpan Pengaturan</button>
        {msg && <p className="brandMessage">{msg}</p>}
      </form>
    </main>
  );
}
