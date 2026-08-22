import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Module,
  NotFoundException,
  Param,
  Post,
  Req,
  ValidationPipe,
} from "@nestjs/common";
import { createHash } from "node:crypto";
import { Type } from "class-transformer";
import {
  Equals,
  IsArray,
  IsDateString,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Matches,
  Min,
  ValidateNested,
} from "class-validator";
import { PrismaService } from "../core/prisma.service.js";
import { BookingCodeService } from "../core/booking-code.service.js";
import { DepartureCapacityService } from "../core/departure-capacity.service.js";
import { calculateDepartureSurcharge } from "../core/surcharge.js";
function maskPhone(phone?: string | null) {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (digits.length < 6) return digits ? `${digits.slice(0, 2)}***` : undefined;
  return `${digits.slice(0, 4)}***${digits.slice(-2)}`;
}
function maskEmail(email?: string | null) {
  if (!email || !email.includes("@")) return email ?? undefined;
  const [local, domain] = email.split("@");
  return `${local.slice(0, 2)}***@${domain}`;
}
function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("62") ? `0${digits.slice(2)}` : digits;
}
function normalizeEmail(email?: string) {
  return email?.trim().toLowerCase();
}
export function isSafePublicMediaUrl(value?: string | null) {
  if (!value) return false;
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) return false;
    const sensitiveQuery = new Set(['token', 'signature', 'sig', 'expires', 'x-amz-signature']);
    return !url.pathname.includes('/storage/v1/object/sign/') &&
      !Array.from(url.searchParams.keys()).some((key) => sensitiveQuery.has(key.toLowerCase()));
  } catch {
    return false;
  }
}
const publicPackageWhere = (tenantId: string) => ({
  tenantId,
  status: 'ACTIVE' as const,
  approvalStatus: 'APPROVED' as const,
  archivedAt: null,
});
class BookingAccessDto {
  @IsString() @MaxLength(30) bookingCode!: string;
  @IsString() @MaxLength(40) @Matches(/^\+?[0-9][0-9\s().-]{7,20}$/) phone!: string;
}
class OrderItemDto {
  @IsUUID() productId!: string;
  @IsInt() @Min(1) quantity!: number;
  @IsOptional() @IsString() notes?: string;
}
class WebsiteOrderDto {
  @IsUUID() packageId!: string;
  @IsOptional() @IsUUID() departureId?: string;
  @IsString() @MaxLength(160) fullName!: string;
  @IsString() @MaxLength(40) @Matches(/^\+?[0-9][0-9\s().-]{7,20}$/) phone!: string;
  @IsOptional() @IsEmail() email?: string;
  @IsDateString() travelDate!: string;
  @IsInt() @Min(1) pax!: number;
  @Equals(true) acceptedTerms!: boolean;
  @IsOptional() @IsString() notes?: string;
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  addons?: OrderItemDto[];
}
class ProductOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];
  @IsString() @MaxLength(160) fullName!: string;
  @IsString() @MaxLength(40) phone!: string;
  @IsOptional() @IsEmail() email?: string;
  @IsDateString() serviceDate!: string;
  @IsOptional() @IsString() notes?: string;
}
@Injectable()
export class PublicService {
  constructor(
    @Inject(PrismaService) private readonly p: PrismaService,
    @Inject(BookingCodeService) private readonly codes: BookingCodeService,
    @Inject(DepartureCapacityService)
    private readonly capacity: DepartureCapacityService,
  ) {}
  private tenant() {
    return this.p.tenant.findUnique({
      where: { slug: process.env.PUBLIC_TENANT_SLUG ?? "batam-travelling" },
    });
  }
  async profile() {
    const t = await this.tenant();
    if (!t) throw new BadRequestException("Website belum terhubung ke tenant");
    const profile = await this.p.companyProfile.findUnique({
      where: { tenantId: t.id },
      select: {
        websiteLogoUrl: true,
        homepageSections: true,
        heroTitle: true,
        heroSubtitle: true,
        heroImageUrl: true,
        heroBadge: true,
        heroCtaPrimary: true,
        heroCtaSecondary: true,
        featureHeadline: true,
        featureText: true,
        howToBookTitle: true,
        howToBookText: true,
        aboutTitle: true,
        aboutText: true,
        whatsappNumber: true,
        whatsappNumberSecondary: true,
        contactEmail: true,
        contactAddress: true,
        contactHours: true,
        instagramUrl: true,
        facebookUrl: true,
        tiktokUrl: true,
        youtubeUrl: true,
        vision: true,
        mission: true,
        coreValues: true,
        customerTerms: true,
        privacyPolicy: true,
        cancellationPolicy: true,
      },
    });
    return profile ? {
      ...profile,
      websiteLogoUrl: isSafePublicMediaUrl(profile.websiteLogoUrl) ? profile.websiteLogoUrl : null,
      heroImageUrl: isSafePublicMediaUrl(profile.heroImageUrl) ? profile.heroImageUrl : null,
    } : {};
  }
  async packages(id?: string) {
    const t = await this.tenant();
    if (!t) {
      if (id) throw new NotFoundException("Paket tidak ditemukan");
      return [];
    }
    const rows = await this.p.travelPackage.findMany({
      where: {
        ...publicPackageWhere(t.id),
        ...(id ? { id } : {}),
      },
      select: {
        id: true,
        name: true,
        category: true,
        kind: true,
        serviceLevel: true,
        adultPrice: true,
        childPrice: true,
        infantPrice: true,
        childAgePolicy: true,
        infantAgePolicy: true,
        promotionalLabel: true,
        originalPrice: true,
        specialPrice: true,
        specialPriceEndsAt: true,
        destination: true,
        visitedDestinations: true,
        durationDays: true,
        publicDescription: true,
        minPax: true,
        maxPax: true,
        meetingPoint: true,
        highlights: true,
        included: true,
        excluded: true,
        importantInfo: true,
        customizable: true,
        gallery: {
          orderBy: { sortOrder: "asc" },
          select: { imageUrl: true, caption: true },
        },
        components: {
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            type: true,
            name: true,
            quantity: true,
            unit: true,
            publicNotes: true,
            included: true,
          },
        },
        itineraries: {
          orderBy: [{ dayNumber: "asc" }, { sortOrder: "asc" }],
          select: {
            dayNumber: true,
            time: true,
            title: true,
            location: true,
            description: true,
            duration: true,
            publicNotes: true,
            included: true,
          },
        },
        prices: {
          where: { active: true },
          orderBy: { priority: "desc" },
          take: 1,
          select: { sellingPrice: true },
        },
        departures: {
          where: { status: "OPEN", startsAt: { gte: new Date() } },
          orderBy: { startsAt: "asc" },
          take: 6,
          select: {
            id: true,
            startsAt: true,
            endsAt: true,
            bookingCloseAt: true,
            status: true,
            minPax: true,
            maxPax: true,
            meetingPoint: true,
            publicNotes: true,
            surchargeLabel: true,
            surchargeAmount: true,
            surchargeBasis: true,
          },
        },
      },
      orderBy: { name: "asc" },
      take: id ? 1 : 24,
    });
    const departureIds = rows.flatMap((row) =>
      row.departures.map((departure) => departure.id),
    );
    const reservations = departureIds.length
      ? await this.p.booking.groupBy({
          by: ["departureId"],
          where: {
            tenantId: t.id,
            departureId: { in: departureIds },
            status: { notIn: ["CANCELLED", "REFUNDED"] },
          },
          _sum: { pax: true },
        })
      : [];
    const reservedByDeparture = new Map(
      reservations.map((row) => [row.departureId, Number(row._sum.pax ?? 0)]),
    );
    const packages = rows.map(({ kind, serviceLevel, ...x }) => {
      const pi = [
        x.adultPrice
          ? `Dewasa: Rp ${Number(x.adultPrice).toLocaleString("id-ID")}`
          : null,
        x.childPrice
          ? `Anak (${x.childAgePolicy ?? "sesuai ketentuan"}): Rp ${Number(x.childPrice).toLocaleString("id-ID")}`
          : null,
        x.infantPrice !== null
          ? `Infant (${x.infantAgePolicy ?? "sesuai ketentuan"}): Rp ${Number(x.infantPrice).toLocaleString("id-ID")}`
          : null,
      ]
        .filter(Boolean)
        .join("\n");
      return {
        ...x,
        gallery: x.gallery.filter((image) => isSafePublicMediaUrl(image.imageUrl)),
        departures: x.departures.map((departure) => ({
          ...departure,
          remainingPax: Math.max(0, departure.maxPax - (reservedByDeparture.get(departure.id) ?? 0)),
        })),
        packageKind: kind,
        kind: serviceLevel,
        serviceLevel,
        prices: x.adultPrice ? [{ sellingPrice: x.adultPrice }] : x.prices,
        publicDescription: [
          x.publicDescription,
          null,
        ]
          .filter(Boolean)
          .join(" · "),
        importantInfo: [
          x.importantInfo,
          pi,
        ]
          .filter(Boolean)
          .join("\n\n"),
      };
    });
    if (!id) return packages;
    if (!packages[0]) throw new NotFoundException("Paket tidak ditemukan");
    return packages[0];
  }
  async products() {
    const t = await this.tenant();
    return t
      ? this.p.serviceProduct.findMany({
          where: { tenantId: t.id, active: true },
          select: {
            id: true,
            name: true,
            category: true,
            description: true,
            imageUrl: true,
            price: true,
            unit: true,
            capacity: true,
            duration: true,
            route: true,
            meetingPoint: true,
            inclusions: true,
            importantInfo: true,
            availableDays: true,
            requiresDate: true,
            featured: true,
          },
          orderBy: [{ featured: "desc" }, { category: "asc" }, { name: "asc" }],
        })
      : [];
  }
  async articles(slug?: string) {
    const t = await this.tenant();
    if (!t) return slug ? null : [];
    const where = { tenantId: t.id, status: "PUBLISHED" as const, ...(slug ? { slug } : {}) };
    const select = {
      slug: true, title: true, excerpt: true, content: true, coverImage: true,
      publishedAt: true, author: { select: { name: true } },
      packages: {
        where: { package: publicPackageWhere(t.id) },
        orderBy: { sortOrder: "asc" as const },
        select: { package: { select: { id: true, name: true, destination: true } } },
      },
    };
    if (slug) {
      const article = await this.p.article.findFirst({ where, select });
      if (!article) throw new NotFoundException("Artikel tidak ditemukan");
      return { ...article, coverImage: isSafePublicMediaUrl(article.coverImage) ? article.coverImage : null };
    }
    const rows = await this.p.article.findMany({ where, select, orderBy: { publishedAt: "desc" }, take: 24 });
    return rows.map((article) => ({ ...article, coverImage: isSafePublicMediaUrl(article.coverImage) ? article.coverImage : null }));
  }
  async promotions() {
    const t = await this.tenant();
    if (!t) return [];
    const now = new Date();
    const rows = await this.p.promotion.findMany({
      where: {
        tenantId: t.id,
        status: "PUBLISHED",
        approvalStatus: "APPROVED",
        startsAt: { lte: now },
        endsAt: { gte: now },
        packages: { some: { package: publicPackageWhere(t.id) } },
      },
      select: {
        id: true, code: true, title: true, description: true, discountType: true, discountValue: true,
        startsAt: true, endsAt: true, bannerImage: true, terms: true,
        packages: {
          where: { package: publicPackageWhere(t.id) },
          select: { package: { select: { id: true, name: true, destination: true } } },
        },
      },
      orderBy: { endsAt: "asc" },
      take: 24,
    });
    return rows.map((row) => ({
      ...row,
      bannerImage: isSafePublicMediaUrl(row.bannerImage) ? row.bannerImage : null,
    }));
  }
  private hash(d: unknown) {
    return createHash("sha256").update(JSON.stringify(d)).digest("hex");
  }
  private async replay(
    tx: any,
    tenantId: string,
    operation: string,
    key: string,
    payload: unknown,
  ) {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`${tenantId}:${operation}:${key}`},0))`;
    const requestHash = this.hash(payload),
      record = await tx.idempotencyRecord.findUnique({
        where: { tenantId_operation_key: { tenantId, operation, key } },
      });
    if (record) {
      if (record.requestHash !== requestHash)
        throw new ConflictException(
          "Idempotency-Key sudah digunakan untuk permintaan berbeda",
        );
      if (record.response) return record.response;
    }
    return null;
  }
  private async remember(
    tx: any,
    tenantId: string,
    operation: string,
    key: string,
    payload: unknown,
    response: unknown,
  ) {
    await tx.idempotencyRecord.create({
      data: {
        tenantId,
        operation,
        key,
        requestHash: this.hash(payload),
        response,
        statusCode: 201,
        expiresAt: new Date(Date.now() + 86400000),
      },
    });
    return response;
  }
  private async customer(
    tx: any,
    t: any,
    d: { fullName: string; phone: string; email?: string },
  ) {
    const phone = normalizePhone(d.phone);
    const email = normalizeEmail(d.email);
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`${t.id}:customer:${phone}`}, 0))`;
    const c = await tx.customer.findFirst({
      where: {
        tenantId: t.id,
        archivedAt: null,
        phone,
      },
    });
    if (c) return c;
    const customerCode = await this.codes.nextCustomer(tx, t.id);
    return tx.customer.create({
      data: {
        tenantId: t.id,
        customerCode,
        fullName: d.fullName.trim(),
        phone,
        email,
        leadSource: "Website",
      },
    });
  }
  async order(d: WebsiteOrderDto, key: string) {
    if (!key || key.length < 16 || key.length > 128)
      throw new BadRequestException(
        "Idempotency-Key wajib diisi (16-128 karakter)",
      );
    const t = await this.tenant();
    if (!t) throw new BadRequestException("Website belum terhubung ke tenant");
    const pack = await this.p.travelPackage.findFirst({
      where: {
        id: d.packageId,
        tenantId: t.id,
        status: "ACTIVE",
        approvalStatus: "APPROVED",
        archivedAt: null,
      },
      include: {
        prices: {
          where: { active: true },
          orderBy: { priority: "desc" },
          take: 1,
        },
        departures: {
          where: d.departureId
            ? { id: d.departureId }
            : { id: "00000000-0000-0000-0000-000000000000" },
        },
      },
    });
    if (!pack) throw new BadRequestException("Paket tidak tersedia");
    const departure = d.departureId ? pack.departures[0] : undefined;
    if (d.departureId && !departure)
      throw new BadRequestException("Jadwal Open Trip tidak tersedia");
    const unit = Number(pack.adultPrice ?? pack.prices[0]?.sellingPrice ?? 0);
    if (unit <= 0)
      throw new BadRequestException("Harga paket belum dapat dipesan online");
    const ids = [...new Set((d.addons ?? []).map((x) => x.productId))],
      products = ids.length
        ? await this.p.serviceProduct.findMany({
            where: { id: { in: ids }, tenantId: t.id, active: true },
          })
        : [];
    if (products.length !== ids.length)
      throw new BadRequestException("Layanan tambahan tidak tersedia");
    const addonTotal = (d.addons ?? []).reduce(
        (s, x) =>
          s +
          Number(products.find((p) => p.id === x.productId)!.price) *
            x.quantity,
        0,
      ),
      date = departure?.startsAt ?? new Date(d.travelDate),
      surcharge = departure ? calculateDepartureSurcharge(Number(departure.surchargeAmount), departure.surchargeBasis, d.pax) : 0,
      total = unit * d.pax + addonTotal + surcharge;
    return this.p.$transaction(async (tx) => {
      const replay = await this.replay(tx, t.id, "package-order", key, d);
      if (replay) return replay;
      if (departure)
        await this.capacity.assertAvailable(tx, t.id, departure.id, d.pax);
      const c = await this.customer(tx, t, d),
        leadCode = await this.codes.nextLead(tx, t.id),
        lead = await tx.lead.create({
          data: {
            tenantId: t.id,
            leadCode,
            customerId: c.id,
            senderName: d.fullName,
            phone: normalizePhone(d.phone),
            email: normalizeEmail(d.email),
            source: "Website",
            requirement: `Pesanan website: ${pack.name}${products.length ? ` + ${products.map((x) => x.name).join(", ")}` : ""}`,
            destination: pack.destination,
            travelDate: date,
            pax: d.pax,
            estimatedValue: total,
            priority: "HIGH",
            status: "WON",
            verifiedAt: new Date(),
            notes: d.notes,
          },
        }),
        b = await tx.booking.create({
          data: {
            tenantId: t.id,
            bookingCode: await this.codes.next(tx, t.id, date),
            customerId: c.id,
            leadId: lead.id,
            packageId: pack.id,
            departureId: departure?.id,
            source: "WEBSITE",
            status: "PENDING_PAYMENT",
            packageName: pack.name,
            travelDate: date,
            pax: d.pax,
            totalAmount: total,
            notes: `Website · ${lead.leadCode}${d.notes ? ` · ${d.notes}` : ""}`,
          },
        });
      if (d.addons?.length)
        await tx.bookingItem.createMany({
          data: d.addons.map((x) => {
            const p = products.find((y) => y.id === x.productId)!;
            return {
              tenantId: t.id,
              bookingId: b.id,
              serviceProductId: p.id,
              name: p.name,
              category: p.category,
              quantity: x.quantity,
              unit: p.unit,
              unitPrice: p.price,
              totalPrice: Number(p.price) * x.quantity,
              serviceDate: date,
              notes: x.notes,
            };
          }),
        });
      const invoiceNumber = await this.codes.nextInvoice(tx, t.id),
        inv = await tx.invoice.create({
          data: {
            tenantId: t.id,
            invoiceNumber,
            bookingId: b.id,
            customerId: c.id,
            totalAmount: total,
          },
        }),
        response = {
          bookingCode: b.bookingCode,
          invoiceNumber: inv.invoiceNumber,
          totalAmount: b.totalAmount,
        };
      await tx.auditLog.create({ data: { tenantId: t.id, actorId: null, action: 'booking.created.public', resourceType: 'Booking', resourceId: b.id, metadata: { source: 'WEBSITE', leadId: lead.id, invoiceId: inv.id, packageId: pack.id, departureId: departure?.id ?? null, totalAmount: total, pax: d.pax } } });
      await tx.auditLog.create({ data: { tenantId: t.id, actorId: null, action: 'lead.won.booking_created', resourceType: 'Lead', resourceId: lead.id, metadata: { bookingId: b.id, bookingCode: b.bookingCode } } });
      await tx.outboxEvent.create({ data: { tenantId: t.id, eventType: 'public_order.created', aggregateType: 'booking', aggregateId: b.id, payload: { event_id: crypto.randomUUID(), event_type: 'public_order.created', tenant_id: t.id, actor_id: null, aggregate_type: 'booking', aggregate_id: b.id, schema_version: 1, lead_id: lead.id, invoice_id: inv.id } } });
      return this.remember(tx, t.id, "package-order", key, d, response);
    });
  }
  async productOrder(d: ProductOrderDto, key: string) {
    if (!key || key.length < 16 || key.length > 128)
      throw new BadRequestException(
        "Idempotency-Key wajib diisi (16-128 karakter)",
      );
    const t = await this.tenant();
    if (!t) throw new BadRequestException("Website belum terhubung ke tenant");
    if (!d.items.length)
      throw new BadRequestException("Pilih minimal satu produk");
    const ids = [...new Set(d.items.map((x) => x.productId))],
      products = await this.p.serviceProduct.findMany({
        where: { id: { in: ids }, tenantId: t.id, active: true },
      });
    if (products.length !== ids.length)
      throw new BadRequestException("Produk tidak tersedia");
    const total = d.items.reduce(
        (s, x) =>
          s +
          Number(products.find((p) => p.id === x.productId)!.price) *
            x.quantity,
        0,
      ),
      date = new Date(d.serviceDate),
      pax =
        d.items
          .filter(
            (x) => products.find((p) => p.id === x.productId)?.unit === "pax",
          )
          .reduce((s, x) => s + x.quantity, 0) || 1,
      names = products.map((x) => x.name).join(", ");
    return this.p.$transaction(async (tx) => {
      const replay = await this.replay(tx, t.id, "product-order", key, d);
      if (replay) return replay;
      const c = await this.customer(tx, t, d),
        leadCode = await this.codes.nextLead(tx, t.id),
        lead = await tx.lead.create({
          data: {
            tenantId: t.id,
            leadCode,
            customerId: c.id,
            senderName: d.fullName,
            phone: normalizePhone(d.phone),
            email: normalizeEmail(d.email),
            source: "Website",
            requirement: `Pesanan produk: ${names}`,
            travelDate: date,
            pax,
            estimatedValue: total,
            priority: "HIGH",
            status: "WON",
            verifiedAt: new Date(),
            notes: d.notes,
          },
        }),
        b = await tx.booking.create({
          data: {
            tenantId: t.id,
            bookingCode: await this.codes.next(tx, t.id, date),
            customerId: c.id,
            leadId: lead.id,
            source: "WEBSITE",
            status: "PENDING_PAYMENT",
            packageName: names,
            travelDate: date,
            pax,
            totalAmount: total,
            notes: `Produk website · ${lead.leadCode}${d.notes ? ` · ${d.notes}` : ""}`,
          },
        });
      await tx.bookingItem.createMany({
        data: d.items.map((x) => {
          const p = products.find((y) => y.id === x.productId)!;
          return {
            tenantId: t.id,
            bookingId: b.id,
            serviceProductId: p.id,
            name: p.name,
            category: p.category,
            quantity: x.quantity,
            unit: p.unit,
            unitPrice: p.price,
            totalPrice: Number(p.price) * x.quantity,
            serviceDate: date,
            notes: x.notes,
          };
        }),
      });
      const invoiceNumber = await this.codes.nextInvoice(tx, t.id),
        inv = await tx.invoice.create({
          data: {
            tenantId: t.id,
            invoiceNumber,
            bookingId: b.id,
            customerId: c.id,
            totalAmount: total,
          },
        }),
        response = {
          bookingCode: b.bookingCode,
          invoiceNumber: inv.invoiceNumber,
          totalAmount: b.totalAmount,
        };
      await tx.auditLog.create({ data: { tenantId: t.id, actorId: null, action: 'booking.created.public', resourceType: 'Booking', resourceId: b.id, metadata: { source: 'WEBSITE_PRODUCT', leadId: lead.id, invoiceId: inv.id, totalAmount: total, pax } } });
      await tx.auditLog.create({ data: { tenantId: t.id, actorId: null, action: 'lead.won.booking_created', resourceType: 'Lead', resourceId: lead.id, metadata: { bookingId: b.id, bookingCode: b.bookingCode } } });
      await tx.outboxEvent.create({ data: { tenantId: t.id, eventType: 'public_order.created', aggregateType: 'booking', aggregateId: b.id, payload: { event_id: crypto.randomUUID(), event_type: 'public_order.created', tenant_id: t.id, actor_id: null, aggregate_type: 'booking', aggregate_id: b.id, schema_version: 1, lead_id: lead.id, invoice_id: inv.id } } });
      return this.remember(tx, t.id, "product-order", key, d, response);
    });
  }
  async booking(d: BookingAccessDto) {
    const t = await this.tenant(),
      phone = normalizePhone(d.phone),
      b = t
        ? await this.p.booking.findFirst({
            where: {
              tenantId: t.id,
              bookingCode: d.bookingCode.trim().toUpperCase(),
            },
            include: {
              customer: {
                select: { fullName: true, phone: true, email: true },
              },
              package: {
                select: {
                  name: true,
                  destination: true,
                  durationDays: true,
                  meetingPoint: true,
                  included: true,
                  importantInfo: true,
                },
              },
              items: true,
              departure: {
                select: {
                  startsAt: true,
                  endsAt: true,
                  meetingPoint: true,
                  status: true,
                },
              },
              invoice: {
                include: {
                  payments: {
                    where: { status: "VERIFIED" },
                    orderBy: { receivedAt: "desc" },
                    select: {
                      paymentNumber: true,
                      amount: true,
                      method: true,
                      receivedAt: true,
                      receiptNumber: true,
                    },
                  },
                },
              },
              trip: {
                include: {
                  assignments: {
                    include: {
                      employee: { select: { name: true, jobTitle: true } },
                    },
                  },
                },
              },
            },
          })
        : null;
    if (
      !b ||
      !b.customer.phone ||
      normalizePhone(b.customer.phone) !== phone
    )
      throw new BadRequestException(
        "Kode booking atau nomor telepon tidak cocok",
      );
    return {
      id: b.id,
      bookingCode: b.bookingCode,
      status: b.status,
      packageName: b.packageName,
      travelDate: b.travelDate,
      returnDate: b.returnDate,
      pax: b.pax,
      totalAmount: b.totalAmount,
      paidAmount: b.paidAmount,
      customer: {
        fullName: b.customer.fullName,
        phone: maskPhone(b.customer.phone),
        email: maskEmail(b.customer.email),
      },
      package: b.package,
      items: b.items.map((item) => ({ id: item.id, name: item.name, category: item.category, quantity: item.quantity, unit: item.unit, unitPrice: item.unitPrice, totalPrice: item.totalPrice, serviceDate: item.serviceDate })),
      departure: b.departure,
      invoice: b.invoice ? { invoiceNumber: b.invoice.invoiceNumber, status: b.invoice.status, issuedAt: b.invoice.issuedAt, dueDate: b.invoice.dueDate, totalAmount: b.invoice.totalAmount, paidAmount: b.invoice.paidAmount, payments: b.invoice.payments } : null,
      trip: b.trip ? { id: b.trip.id, tripCode: b.trip.tripCode, title: b.trip.title, status: b.trip.status, startsAt: b.trip.startsAt, endsAt: b.trip.endsAt, meetingPoint: b.trip.meetingPoint, vehicle: b.trip.vehicle, itinerary: b.trip.itinerary, assignments: b.trip.assignments.map((assignment)=>({role:assignment.role,status:assignment.status,employee:assignment.employee})) } : null,
    };
  }

  async bookingWithThrottle(d: BookingAccessDto, clientIp: string) {
    const t = await this.tenant();
    if (!t) throw new BadRequestException("Website belum terhubung ke tenant");
    const fingerprint = this.hash(`${clientIp}:${d.bookingCode.trim().toUpperCase()}:${normalizePhone(d.phone)}`);
    await this.p.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`${t.id}:portal:${fingerprint}`},0))`;
      const existing = await tx.publicAccessAttempt.findUnique({ where: { tenantId_fingerprint: { tenantId: t.id, fingerprint } } });
      const cutoff = new Date(Date.now() - 15 * 60 * 1000);
      if (!existing || existing.windowStartedAt < cutoff) {
        await tx.publicAccessAttempt.upsert({ where: { tenantId_fingerprint: { tenantId: t.id, fingerprint } }, create: { tenantId: t.id, fingerprint }, update: { attemptCount: 1, windowStartedAt: new Date() } });
      } else {
        if (existing.attemptCount >= 8) throw new HttpException("Terlalu banyak percobaan. Coba kembali dalam 15 menit.", HttpStatus.TOO_MANY_REQUESTS);
        await tx.publicAccessAttempt.update({ where: { id: existing.id }, data: { attemptCount: { increment: 1 } } });
      }
    });
    const result=await this.booking(d);
    await this.p.publicAccessAttempt.deleteMany({where:{tenantId:t.id,fingerprint}});
    return result;
  }
}
@Controller("public")
class PublicController {
  constructor(@Inject(PublicService) private readonly s: PublicService) {}
  @Get("company-profile") profile() {
    return this.s.profile();
  }
  @Get("packages") packages() {
    return this.s.packages();
  }
  @Get("packages/:id") package(@Param("id") id: string) {
    return this.s.packages(id);
  }
  @Get("service-products") products() {
    return this.s.products();
  }
  @Get("articles") articles() {
    return this.s.articles();
  }
  @Get("articles/:slug") article(@Param("slug") slug: string) {
    return this.s.articles(slug);
  }
  @Get("promotions") promotions() {
    return this.s.promotions();
  }
  @Post("orders") order(
    @Headers("idempotency-key") key: string,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true, expectedType: WebsiteOrderDto })) d: WebsiteOrderDto,
  ) {
    return this.s.order(d, key);
  }
  @Post("product-orders") productOrder(
    @Headers("idempotency-key") key: string,
    @Body() d: ProductOrderDto,
  ) {
    return this.s.productOrder(d, key);
  }
  @Post("booking-access") booking(@Body() d: BookingAccessDto, @Req() request: { ip: string }) {
    return this.s.bookingWithThrottle(d, request.ip);
  }
}
@Module({
  controllers: [PublicController],
  providers: [
    PublicService,
    PrismaService,
    BookingCodeService,
    DepartureCapacityService,
  ],
})
export class PublicModule {}
