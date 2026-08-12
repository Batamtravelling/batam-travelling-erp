"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiGet } from "../../../../lib/api";
type Pack = {
  id: string;
  packageCode: string;
  name: string;
  destination?: string;
  durationDays: number;
  publicDescription?: string;
  description?: string;
  adultPrice?: string;
  childPrice?: string;
  infantPrice?: string;
  meetingPoint?: string;
  included?: string;
  excluded?: string;
  importantInfo?: string;
  gallery: { imageUrl: string; caption?: string }[];
  itineraries: {
    dayNumber: number;
    time?: string;
    title: string;
    location?: string;
    description?: string;
  }[];
};
const money = (v?: string) =>
  v
    ? new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(Number(v))
    : "Hubungi kami";
const lines = (v?: string) => v?.split(/\r?\n/).filter(Boolean) || [];
export default function PrintPackage() {
  const { id } = useParams<{ id: string }>(),
    [p, setP] = useState<Pack>(),
    [brand, setBrand] = useState<any>({}),
    [error, setError] = useState("");
  useEffect(() => {
    Promise.all([
      apiGet<Pack>(`/public/packages/${id}`),
      apiGet<any>("/public/company-profile"),
    ])
      .then(([found, b]) => {
        setP(found);
        setBrand(b);
      })
      .catch((e) => setError((e as Error).message));
  }, [id]);
  if (error)
    return (
      <main className="printPackage">
        <p>{error}</p>
      </main>
    );
  if (!p)
    return (
      <main className="printPackage">
        <p>Memuat dokumen...</p>
      </main>
    );
  const days = [...new Set(p.itineraries.map((x) => x.dayNumber))];
  return (
    <main className="printPackage">
      <div className="printToolbar">
        <button onClick={() => window.print()}>Print / Simpan PDF</button>
        <button onClick={() => history.back()}>Kembali</button>
      </div>
      <header>
        {brand.documentLogoUrl ? (
          <img src={brand.documentLogoUrl} alt="Batam Travelling" />
        ) : (
          <strong>BATAM TRAVELLING</strong>
        )}
        <div>
          <small>PAKET PERJALANAN</small>
          <span>{p.packageCode}</span>
        </div>
      </header>
      {p.gallery[0] && (
        <img
          className="printCover"
          src={p.gallery[0].imageUrl}
          alt={p.gallery[0].caption || p.name}
        />
      )}
      <section className="printIntro">
        <p>
          {p.destination} · {p.durationDays} hari
        </p>
        <h1>{p.name}</h1>
        <span>{p.publicDescription || p.description}</span>
      </section>
      <section className="printFacts">
        <div>
          <small>Dewasa</small>
          <b>{money(p.adultPrice)}</b>
        </div>
        <div>
          <small>Anak</small>
          <b>{money(p.childPrice)}</b>
        </div>
        <div>
          <small>Infant</small>
          <b>{money(p.infantPrice)}</b>
        </div>
        <div>
          <small>Meeting point</small>
          <b>{p.meetingPoint || "Sesuai konfirmasi"}</b>
        </div>
      </section>
      <div className="printColumns">
        <section>
          <h2>Termasuk</h2>
          <ul>
            {lines(p.included).map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </section>
        <section>
          <h2>Belum termasuk</h2>
          <ul>
            {lines(p.excluded).map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </section>
      </div>
      <section>
        <h2>Itinerary</h2>
        {days.length ? (
          days.map((day) => (
            <div className="printDay" key={day}>
              <h3>Hari {day}</h3>
              {p.itineraries
                .filter((x) => x.dayNumber === day)
                .map((x, n) => (
                  <article key={n}>
                    <time>{x.time || "Fleksibel"}</time>
                    <div>
                      <b>{x.title}</b>
                      <p>
                        {[x.location, x.description]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                  </article>
                ))}
            </div>
          ))
        ) : (
          <p>Itinerary akan dikonfirmasi oleh tim.</p>
        )}
      </section>
      <section className="printImportant">
        <h2>Informasi penting</h2>
        <p>
          {p.importantInfo ||
            "Pastikan data peserta sesuai dokumen perjalanan dan konfirmasi ulang sebelum keberangkatan."}
        </p>
      </section>
      <footer>
        <span>Batam Travelling</span>
        <span>
          {brand.contactEmail || ""}{" "}
          {brand.whatsappNumber ? "· " + brand.whatsappNumber : ""}
        </span>
      </footer>
    </main>
  );
}
