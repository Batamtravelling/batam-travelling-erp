# WORKFLOWS

**Status:** working workflow summary from current implementation and approved docs
**Tanggal audit:** 12 Agustus 2026

## Commercial workflow

Lead -> customer -> quotation -> booking -> invoice -> payment -> receipt

## Operational workflow

Booking -> departure schedule -> assignments -> trip execution -> trip completion

## Finance workflow

Payment verification -> receipt issuance -> financial entry -> reconciliation or reversal when approved

## Content workflow

Back office package/content management -> website/public presentation -> quotation/booking reuse -> document generation

## Control workflow

Tenant validation -> role check -> approval where required -> audit log -> outbox/event if needed

## Open decisions

- Cancellation and reschedule workflow details remain business decisions required.
- Refund and reversal workflow details remain business decisions required.
- Alerting and reminder workflow ownership remains business decisions required.

