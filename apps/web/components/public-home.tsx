"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { apiGet, apiPost } from "../lib/api";
import { demoProfile, demoTrips, publicDemoEnabled } from "../lib/public-demo-data";
import { WebsiteHighlights } from "./website-highlights";
type BrandProfile = {
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
  instagramUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  youtubeUrl?: string;
};

type Component = {
  type: string;
  name: string;
  provider?: string;
  quantity: string;
  unit?: string;
  notes?: string;
  included: boolean;
};
type Itinerary = {
  dayNumber: number;
  time?: string;
  title: string;
  location?: string;
  description?: string;
  duration?: string;
  notes?: string;
  included: boolean;
};
type Departure = {
  id: string;
  startsAt: string;
  endsAt?: string;
  bookingCloseAt?: string;
  minPax: number;
  maxPax: number;
  meetingPoint?: string;
  notes?: string;
  reservedPax: number;
  surchargeLabel?: string;
  surchargeAmount: string;
  surchargeBasis: 'PER_PAX' | 'PER_BOOKING';
};
type Pack = {
  id: string;
  packageCode?: string;
  name: string;
  destination?: string;
  durationDays: number;
  description?: string;
  publicDescription?: string;
  importantInfo?: string;
  meetingPoint?: string;
  customizable?: boolean;
  minPax: number;
  maxPax?: number;
  prices: { sellingPrice: string }[];
  departures: Departure[];
  gallery: { imageUrl: string; caption?: string }[];
  components: Component[];
  itineraries: Itinerary[];
  visitedDestinations?: string;
  included?: string;
  excluded?: string;
  kind?: string;
};
type OrderResult = {
  customerCode: string;
  leadCode: string;
  bookingCode: string;
  invoiceNumber: string;
  totalAmount: string;
};

const money = (n?: string) =>
  n
    ? new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(Number(n))
    : "Hubungi kami";
const lines = (v?: string) =>
  v
    ?.split(/\r?\n|\s[·•]\s/)
    .map((x) => x.trim())
    .filter(Boolean) || [];

export function PublicHome() {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [brand, setBrand] = useState<BrandProfile>({});
  const [selected, setSelected] = useState<Pack>();
  const [booking, setBooking] = useState(false);
  const [result, setResult] = useState<OrderResult>();
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const orderKey = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (publicDemoEnabled) {
      setPacks(demoTrips as unknown as Pack[]);
      setBrand(demoProfile);
      setLoadError("");
      return;
    }
    apiGet<Pack[]>("/public/packages")
      .then((items) => {
        setPacks(items);
        setLoadError("");
      })
      .catch(() => {
        setPacks([]);
        setLoadError(
          "Paket belum dapat dimuat. Silakan coba kembali beberapa saat lagi.",
        );
      });
    apiGet<BrandProfile>("/public/company-profile")
      .then(setBrand)
      .catch(() => undefined);
  }, []);

  const shown = packs.slice(0, 12);
  const heroLines = (
    brand.heroTitle || "Liburan terbaik\ndimulai dari Batam."
  ).split(/\r?\n/);
  const activeSections = new Set(
    (
      brand.homepageSections ||
      "hero,highlights,tickets,trips,how-to-book,about"
    )
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean),
  );
  const destinations = useMemo(() => {
    if (!selected) return [];
    const explicit = lines(selected.visitedDestinations);
    const itinerary = selected.itineraries
      .map((x) => x.location)
      .filter((x): x is string => Boolean(x));
    return Array.from(new Set([...explicit, ...itinerary]));
  }, [selected]);

  async function order(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected?.id) return;
    const f = new FormData(e.currentTarget);
    const addons = Array.from(
      e.currentTarget.querySelectorAll<HTMLInputElement>(
        'input[name="addon-product"]:checked',
      ),
    ).map((x) => ({
      productId: x.value,
      quantity: Number(f.get(`addon-qty-${x.value}`) || 1),
    }));
    try {
      const payload = {
        packageId: selected.id,
        departureId: f.get("departureId") || undefined,
        fullName: f.get("fullName"),
        phone: f.get("phone"),
        email: f.get("email") || undefined,
        travelDate: f.get("travelDate"),
        pax: Number(f.get("pax")),
        acceptedTerms: f.get("acceptedTerms") === "on",
        notes: f.get("notes") || undefined,
        addons,
      };
      orderKey.current ||= crypto.randomUUID();
      setResult(
        await apiPost<OrderResult>("/public/orders", payload, {
          "idempotency-key": orderKey.current,
        }),
      );
      setError("");
    } catch (x) {
      setError((x as Error).message);
    }
  }

  const open = (p: Pack) => {
    orderKey.current = undefined;
    setSelected(p);
    setBooking(false);
    setResult(undefined);
    setError("");
  };

  return (
    <main className="publicSite">
      {activeSections.has("hero") && (
        <section className="publicHero">
          <div>
            <p>YOUR JOURNEY, BEAUTIFULLY PLANNED</p>
            <h1>
              {heroLines.map((line, i) => (
                <span key={i}>
                  {line}
                  {i < heroLines.length - 1 ? <br /> : null}
                </span>
              ))}
            </h1>
            <span>
              {brand.heroSubtitle ||
                "Semua kebutuhan perjalanan tersusun rapi dalam satu pengalaman yang mudah, cepat, dan nyaman untuk pelanggan."}
            </span>
            <div>
              <a href="#open-trips">
                {brand.heroCtaPrimary || "Lihat Open Trip"}
              </a>
              <Link href="/#how-to-book">
                {brand.heroCtaSecondary || "Cara Booking"}
              </Link>
            </div>
            <small>
              Berbasis di Batam · Singapore · Malaysia · Kepulauan Riau
            </small>
          </div>
          <aside>
            <div
              className="heroScene"
              style={
                brand.heroImageUrl
                  ? {
                      backgroundImage: `linear-gradient(155deg,#1174df 0 34%,#0b4e98 34% 56%,#071d3a 56% 75%,#ffd524 75%), url(${brand.heroImageUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : undefined
              }
            >
              <span>{brand.heroBadge || "BERANGKAT DARI BATAM"}</span>
              <b>
                Perjalanan modern
                <br />
                yang terasa effortless
              </b>
              <i>
                {brand.featureText ||
                  "Booking lebih cepat, koordinasi lebih rapi, dan pengalaman pelanggan lebih nyaman"}
              </i>
            </div>
            <article>
              <span>Trip terencana</span>
              <b>100%</b>
              <small>Tim lokal & itinerary transparan</small>
            </article>
          </aside>
        </section>
      )}

      {activeSections.has("highlights") && (
        <WebsiteHighlights
          onSelect={(id) => {
            const p = packs.find((x) => x.id === id);
            if (p) open(p);
          }}
        />
      )}

      {activeSections.has("tickets") && (
        <section className="publicTrust" id="tickets">
          <span>⛴ Tiket Ferry</span>
          <span>🚐 Transportasi</span>
          <span>🏨 Hotel Terpilih</span>
          <span>🧑‍✈️ Tour Guide</span>
          <span>🗺 Custom Itinerary</span>
        </section>
      )}

      {activeSections.has("trips") && (
        <section className="publicTrips" id="trips">
          <header>
            <div>
              <p>CURATED JOURNEYS</p>
              <h2>Pilih perjalananmu</h2>
            </div>
            <span>
              Bandingkan destinasi, itinerary, dan harga dengan tampilan yang
              mudah dibaca.
            </span>
          </header>
          {loadError && (
            <p className="orderError" role="alert">
              {loadError}
            </p>
          )}
          {!loadError && shown.length === 0 && (
            <p className="detailEmpty">Belum ada paket aktif yang tersedia.</p>
          )}
          <div>
            {shown.map((p, i) => (
              <article key={`${p.id}-${i}`}>
                <div
                  className={`tripVisual visual${(i % 3) + 1}`}
                  style={
                    p.gallery[0]
                      ? {
                          backgroundImage: `linear-gradient(#001b3f55,#001b3faa),url(${p.gallery[0].imageUrl})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : undefined
                  }
                >
                  <small>{p.destination}</small>
                  <b>
                    {p.durationDays}D
                    {p.durationDays > 1 ? `${p.durationDays - 1}N` : ""}
                  </b>
                </div>
                <section>
                  <span>
                    {p.departures.length
                      ? "OPEN TRIP"
                      : p.kind || "PRIVATE / CUSTOM"}
                  </span>
                  <h3>{p.name}</h3>
                  <p>{p.publicDescription || p.description}</p>
                  <div>
                    <b>{money(p.prices[0]?.sellingPrice)}</b>
                    <small>
                      {p.minPax}—{p.maxPax || "∞"} peserta
                    </small>
                  </div>
                  <button disabled={!p.id} onClick={() => open(p)}>
                    {p.id ? "Lihat detail paket →" : "Segera tersedia"}
                  </button>
                </section>
              </article>
            ))}
          </div>
        </section>
      )}

      {activeSections.has("how-to-book") && (
        <section className="publicServices" id="how-to-book">
          <header>
            <p>HOW TO BOOK</p>
            <h2>
              {brand.howToBookTitle ||
                "Booking perjalanan dibuat lebih ringkas"}
            </h2>
          </header>
          <div className="publicServiceIntro">
            {brand.howToBookText ||
              "Lihat detail, pilih jadwal, isi data, lalu siap berangkat."}
          </div>
          <div>
            {[
              [
                "01",
                "Buka Detail",
                "Lihat rute, fasilitas, dan jadwal dengan jelas.",
              ],
              [
                "02",
                "Pilih Jadwal",
                "Pilih Open Trip atau tanggal private trip.",
              ],
              [
                "03",
                "Isi Data",
                "Lengkapi data singkat lalu lanjut konfirmasi.",
              ],
              [
                "04",
                "Siap Berangkat",
                "Semua detail perjalanan tersimpan di akun Anda.",
              ],
            ].map((x) => (
              <article key={x[0]}>
                <i>{x[0]}</i>
                <h3>{x[1]}</h3>
                <p>{x[2]}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {activeSections.has("about") && (
        <section className="publicAbout" id="about">
          <div>
            <p>ABOUT BATAM TRAVELLING</p>
            <h2>
              {brand.aboutTitle ||
                "Perjalanan yang tertata, pengalaman yang terasa premium."}
            </h2>
          </div>
          <div>
            <p>
              {brand.aboutText ||
                "Kami membantu keluarga, komunitas, dan perusahaan menikmati perjalanan yang lebih mudah dipahami, lebih cepat dipesan, dan lebih nyaman dijalankan."}
            </p>
            <Link href="/articles">Cerita perjalanan kami →</Link>
          </div>
        </section>
      )}

      <footer className="publicFooter" id="contact">
        <div className="publicLogo">
          <i>BT</i>
          <span>
            BATAM
            <br />
            <b>TRAVELLING</b>
          </span>
        </div>
        <p>© 2026 Batam Travelling.</p>
        <div>
          <Link href="/#how-to-book">Cara Booking</Link>
          <Link href="/articles">Artikel</Link>
          <Link href="/promotions">Promo</Link>
          <Link href="/terms">Syarat & Ketentuan</Link>
          <Link href="/contact">Kontak</Link>
        </div>
      </footer>

      {selected && (
        <div
          className="packageDetailOverlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelected(undefined);
          }}
        >
          <article className="packageDetailModal">
            <button
              className="detailClose"
              onClick={() => setSelected(undefined)}
            >
              ×
            </button>
            {result ? (
              <div className="orderSuccess">
                <i>✓</i>
                <p>PESANAN BERHASIL</p>
                <h2>{result.bookingCode}</h2>
                <span>
                  Invoice {result.invoiceNumber} · {money(result.totalAmount)}
                </span>
                <Link href="/my-trip">Buka dashboard perjalanan</Link>
              </div>
            ) : booking ? (
              <section className="detailBooking">
                <button
                  className="detailBack"
                  onClick={() => setBooking(false)}
                >
                  ← Kembali ke detail
                </button>
                <header>
                  <small>BOOK YOUR JOURNEY</small>
                  <h2>{selected.name}</h2>
                  <p>
                    {selected.destination} ·{" "}
                    {money(selected.prices[0]?.sellingPrice)} / pax
                  </p>
                </header>
                <form onSubmit={order}>
                  <input name="fullName" placeholder="Nama lengkap" required />
                  <input name="phone" placeholder="Nomor WhatsApp" required />
                  <input
                    name="email"
                    type="email"
                    placeholder="Email (opsional)"
                  />
                  {selected.departures.length ? (
                    <>
                      <select name="departureId" required>
                        <option value="">Pilih jadwal Open Trip</option>
                        {selected.departures.map((d) => (
                          <option key={d.id} value={d.id}>
                            {new Date(d.startsAt).toLocaleString("id-ID")} ·
                            sisa{" "}
                            {Math.max(0, d.maxPax - d.reservedPax)}{" "}
                            kursi{Number(d.surchargeAmount)>0 ? ` · ${d.surchargeLabel||'Surcharge'} ${money(d.surchargeAmount)} ${d.surchargeBasis==='PER_PAX'?'/ pax':'/ booking'}` : ''}
                          </option>
                        ))}
                      </select>
                      <input
                        type="hidden"
                        name="travelDate"
                        value={selected.departures[0].startsAt.slice(0, 10)}
                      />
                    </>
                  ) : (
                    <label>
                      Tanggal perjalanan
                      <input name="travelDate" type="date" required />
                    </label>
                  )}
                  <input
                    name="pax"
                    type="number"
                    min={selected.minPax}
                    max={selected.maxPax}
                    defaultValue={selected.minPax}
                    required
                  />
                  <textarea name="notes" placeholder="Permintaan khusus" />
                  <label className="bookingTermsCheck">
                    <input name="acceptedTerms" type="checkbox" required />
                    <span>
                      Saya sudah membaca detail paket dan menyetujui{" "}
                      <Link href="/terms" target="_blank">
                        Syarat & Ketentuan
                      </Link>
                      .
                    </span>
                  </label>
                  <button>Konfirmasi pesanan</button>
                </form>
                {error && <p className="orderError">{error}</p>}
              </section>
            ) : (
              <>
                <header className="detailHero">
                  {selected.gallery[0] && (
                    <img
                      src={selected.gallery[0].imageUrl}
                      alt={selected.gallery[0].caption || selected.name}
                    />
                  )}
                  <div>
                    <span>
                      {selected.packageCode} · {selected.kind}
                    </span>
                    <h2>{selected.name}</h2>
                    <p>{selected.publicDescription || selected.description}</p>
                    <strong>
                      {money(selected.prices[0]?.sellingPrice)}{" "}
                      <small>/ orang</small>
                    </strong>
                  </div>
                </header>
                <nav className="detailFacts">
                  <span>
                    <b>{selected.durationDays} hari</b>Durasi
                  </span>
                  <span>
                    <b>
                      {selected.minPax}—{selected.maxPax || "∞"} pax
                    </b>
                    Kapasitas
                  </span>
                  <span>
                    <b>{selected.departures.length || "Private"}</b>Jadwal aktif
                  </span>
                  <span>
                    <b>{selected.customizable ? "Bisa" : "Standar"}</b>
                    Kustomisasi
                  </span>
                </nav>
                <div className="detailBody">
                  <section>
                    <h3>Destinasi yang dikunjungi</h3>
                    <div className="destinationChips">
                      {(destinations.length
                        ? destinations
                        : [selected.destination || "Sesuai itinerary"]
                      ).map((x) => (
                        <span key={x}>⌖ {x}</span>
                      ))}
                    </div>
                  </section>
                  <section className="detailColumns">
                    <div>
                      <h3>✓ Sudah termasuk</h3>
                      <ul>
                        {[
                          ...lines(selected.included),
                          ...selected.components
                            .filter((x) => x.included)
                            .map(
                              (x) =>
                                `${x.name}${x.provider ? ` — ${x.provider}` : ""}`,
                            ),
                        ]
                          .filter((x, i, a) => a.indexOf(x) === i)
                          .map((x) => (
                            <li key={x}>{x}</li>
                          ))}
                      </ul>
                    </div>
                    <div className="excluded">
                      <h3>× Belum termasuk</h3>
                      <ul>
                        {lines(selected.excluded).map((x) => (
                          <li key={x}>{x}</li>
                        ))}
                      </ul>
                    </div>
                  </section>
                  <section>
                    <h3>Jadwal keberangkatan</h3>
                    {selected.departures.length ? (
                      <div className="detailSchedules">
                        {selected.departures.map((d) => (
                          <article key={d.id}>
                            <time>
                              {new Date(d.startsAt).toLocaleDateString(
                                "id-ID",
                                {
                                  weekday: "long",
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                },
                              )}
                            </time>
                            <b>
                              {new Date(d.startsAt).toLocaleTimeString(
                                "id-ID",
                                { hour: "2-digit", minute: "2-digit" },
                              )}{" "}
                              WIB
                            </b>
                            <span>
                              {d.meetingPoint || selected.meetingPoint}
                            </span>
                            <small>
                              Sisa estimasi{" "}
                              {Math.max(
                                0,
                                d.maxPax - d.reservedPax,
                              )}{" "}
                              dari {d.maxPax} kursi
                            </small>
                            {Number(d.surchargeAmount)>0&&<small>{d.surchargeLabel||'Surcharge jadwal'}: {money(d.surchargeAmount)} {d.surchargeBasis==='PER_PAX'?'/ peserta':'/ booking'}</small>}
                          </article>
                        ))}
                      </div>
                    ) : (
                      <p className="detailEmpty">
                        Paket private/custom — pelanggan dapat menentukan
                        tanggal perjalanan.
                      </p>
                    )}
                  </section>
                  <section>
                    <h3>Rundown perjalanan</h3>
                    {selected.itineraries.length ? (
                      <div className="detailItinerary">
                        {Array.from(
                          new Set(selected.itineraries.map((x) => x.dayNumber)),
                        ).map((day) => (
                          <div key={day}>
                            <b>DAY {day}</b>
                            {selected.itineraries
                              .filter((x) => x.dayNumber === day)
                              .map((x, i) => (
                                <article key={`${day}-${i}`}>
                                  <time>{x.time || "Fleksibel"}</time>
                                  <span>
                                    <strong>{x.title}</strong>
                                    <small>
                                      {x.location}
                                      {x.description
                                        ? ` · ${x.description}`
                                        : ""}
                                    </small>
                                  </span>
                                </article>
                              ))}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="detailEmpty">
                        Rundown akan dikonfirmasi oleh tim sebelum
                        keberangkatan.
                      </p>
                    )}
                  </section>
                  <section className="meetingInfo">
                    <div>
                      <h3>Meeting point</h3>
                      <p>
                        {selected.meetingPoint ||
                          selected.departures[0]?.meetingPoint ||
                          "Akan diinformasikan oleh tim."}
                      </p>
                    </div>
                    <div>
                      <h3>Informasi penting</h3>
                      <p>
                        {selected.importantInfo ||
                          "Pastikan data peserta sesuai dengan dokumen perjalanan."}
                      </p>
                    </div>
                  </section>
                </div>
                <footer className="detailAction">
                  <div>
                    <small>Mulai dari</small>
                    <b>{money(selected.prices[0]?.sellingPrice)} / orang</b>
                  </div>
                  <div className="detailButtons">
                    <Link
                      href={`/packages/${selected.id}/print`}
                      target="_blank"
                    >
                      Print Paket
                    </Link>
                    <button
                      disabled={!selected.prices.length}
                      onClick={() => setBooking(true)}
                    >
                      {selected.prices.length
                        ? "Lanjut booking"
                        : "Hubungi kami untuk harga"}
                    </button>
                  </div>
                </footer>
              </>
            )}
          </article>
        </div>
      )}
    </main>
  );
}
