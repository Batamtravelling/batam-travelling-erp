# BATAM TRAVELLING ERP
# UI/UX, FRONTEND & WEBSITE CONTENT SPECIFICATION

**File Name:** `09_UI_UX_AND_FRONTEND_SPECIFICATION.md`  
**Document Number:** 09  
**Version:** 2.0  
**Status:** FRONTEND & CMS BASELINE  
**Project:** Batam Travelling ERP  
**Last Updated:** 2026-08-08

---

# 1. PURPOSE

Dokumen ini mendefinisikan standar:

- UI
- UX
- Frontend
- Internal ERP
- Customer Portal
- Public Website
- CMS
- Blog / Article
- Landing Page
- Product / Package publishing
- Product insertion into articles
- CRM lead capture
- Responsive design
- Component behavior
- Document display
- Form behavior
- Status display
- Frontend security
- Content publishing workflow

Dokumen ini menjadi acuan utama untuk implementasi frontend dan website.

---

# 2. FRONTEND PRINCIPLE

Frontend harus:

- Mudah digunakan
- Cepat dipahami
- Responsive
- Mobile friendly
- Konsisten
- Aman
- Role-aware
- Permission-aware
- State-aware
- Error-aware
- Accessible
- Scalable

Prinsip utama:

> UI harus membantu user menyelesaikan pekerjaan, bukan membuat user memahami cara kerja database.

---

# 3. SYSTEM INTERFACE CATEGORIES

System memiliki tiga kelompok interface utama:

```text
1. INTERNAL ERP
2. CUSTOMER PORTAL
3. PUBLIC WEBSITE
```

---

# 4. INTERNAL ERP

Digunakan oleh:

- Owner
- Management
- Sales
- Customer Service
- Finance
- Operations
- Admin
- Authorized Staff

Internal ERP berfungsi untuk:

- CRM
- Customer management
- Lead management
- Follow-up
- Quotation
- Booking
- Payment
- Invoice
- Itinerary
- Package management
- Availability
- Vendor
- Operations
- Reporting
- Content Management
- Website publishing
- User management

---

# 5. CUSTOMER PORTAL

Customer dapat:

- Melihat quotation
- Accept quotation
- Request quotation changes
- Melihat booking
- Melihat payment status
- Upload payment proof
- Melihat invoice
- Melihat itinerary
- Melihat trip information
- Melihat documents
- Mengirim request
- Melihat notification
- Memberikan feedback

Customer tidak boleh melihat:

- Internal margin
- Supplier cost
- Internal notes
- Commission
- Internal staff comments
- Internal operational information yang bersifat confidential

---

# 6. PUBLIC WEBSITE

Website publik berfungsi untuk:

- Menampilkan package
- Menampilkan destination
- Menampilkan itinerary
- Menampilkan service
- Menampilkan promotion
- Menampilkan company information
- Menampilkan blog/article
- Menampilkan landing page
- Menampilkan FAQ
- Lead generation
- Contact / inquiry
- Booking request

Website harus dapat mengambil konten yang telah dipublikasikan dari system.

---

# 7. BUSINESS WEBSITE PRINCIPLE

Website bukan hanya media informasi.

Website merupakan bagian dari business engine:

```text
CONTENT
   ↓
TRAFFIC
   ↓
PRODUCT DISCOVERY
   ↓
INQUIRY
   ↓
LEAD
   ↓
CRM
   ↓
SALES
   ↓
QUOTATION
   ↓
BOOKING
   ↓
PAYMENT
   ↓
TRIP
   ↓
FOLLOW-UP
```

---

# 8. FRONTEND ARCHITECTURE

Frontend dibagi menjadi:

```text
Application Shell
├── Navigation
├── Header
├── Sidebar
├── Main Content
├── Notification
├── Modal
└── Global Error Handling
```

Feature modules:

```text
CRM
Customers
Leads
Follow-ups
Quotations
Bookings
Payments
Invoices
Itineraries
Packages
Availability
Operations
Vendors
Reports
Content / Website
Settings
```

---

# 9. APPLICATION SHELL

Internal ERP menggunakan layout:

```text
┌─────────────────────────────────────┐
│ Header                              │
├───────────┬─────────────────────────┤
│ Sidebar   │ Main Content            │
│           │                         │
│           │                         │
│           │                         │
└───────────┴─────────────────────────┘
```

Desktop:

- Sidebar persistent
- Header persistent
- Content scrollable

Mobile:

- Sidebar menjadi drawer
- Header tetap accessible
- Content full width

---

# 10. GLOBAL HEADER

Header minimal memiliki:

- Company/logo
- Global search
- Notification
- User profile
- Role/context
- Optional quick action

Contoh:

```text
[Logo] [Search...]              [Notification] [User]
```

---

# 11. GLOBAL SIDEBAR

Menu utama:

```text
Dashboard

CRM
├── Leads
├── Customers
├── Follow-ups
└── Activities

Sales
├── Quotations
├── Packages
└── Promotions

Bookings
├── All Bookings
├── Calendar
└── Availability

Operations
├── Trips
├── Itineraries
├── Assignments
└── Vendors

Finance
├── Invoices
├── Payments
├── Refunds
├── Expenses
└── Commissions

Content / Website
├── Articles
├── Landing Pages
├── Products / Packages
├── Destinations
├── Media
└── Publishing

Reports

Settings
```

Menu yang tampil harus berdasarkan permission.

---

# 12. ROLE-BASED NAVIGATION

User tidak boleh melihat menu yang tidak relevan dengan permission.

Contoh Sales:

```text
CRM
Sales
Bookings
Content jika memiliki permission
```

Finance:

```text
Bookings
Finance
Reports
```

Operations:

```text
Bookings
Operations
Itineraries
Availability
```

Owner/Management dapat memiliki akses lebih luas.

---

# 13. DASHBOARD

Dashboard harus berbeda berdasarkan role.

---

# 14. OWNER / MANAGEMENT DASHBOARD

Menampilkan:

- Revenue
- Outstanding invoice
- Booking
- Upcoming trip
- Sales pipeline
- Conversion
- Customer growth
- Operational status
- Payment status
- Alerts
- Website lead performance jika tersedia

---

# 15. SALES DASHBOARD

Menampilkan:

- New leads
- Follow-up due
- Open quotations
- Negotiations
- Won deals
- Upcoming customer requests
- Unpaid customer invoices
- Website inquiries

---

# 16. FINANCE DASHBOARD

Menampilkan:

- Invoice outstanding
- Overdue
- Payment proof awaiting verification
- Verified payments
- Refund requests
- Expenses pending approval
- Cash/payment summary

---

# 17. OPERATIONS DASHBOARD

Menampilkan:

- Upcoming trips
- Today's trips
- Unassigned bookings
- Driver assignment
- Guide assignment
- Vendor confirmation
- Itinerary status
- Operational alerts

---

# 18. CONTENT / WEBSITE DASHBOARD

CMS dashboard dapat menampilkan:

- Draft articles
- Pending review
- Scheduled content
- Published content
- Recently updated content
- Product clicks
- CTA clicks
- Website leads
- Top articles
- Top products
- Campaign performance jika analytics tersedia

---

# 19. CUSTOMER DASHBOARD

Customer melihat:

```text
Upcoming Trip
Payment Status
Quotation
Invoice
Itinerary
Documents
Notifications
```

---

# 20. PAGE STRUCTURE

Setiap halaman internal mengikuti pola:

```text
Page Header
├── Title
├── Description
├── Breadcrumb
└── Primary Action

Summary / KPI

Filter / Search

Main Content

Pagination

Optional Side Panel / Detail
```

---

# 21. PAGE HEADER

Contoh:

```text
Quotations

Manage customer quotations and sales proposals.

[+ New Quotation]
```

---

# 22. PRIMARY ACTION

Setiap halaman sebaiknya memiliki satu primary action.

Contoh:

Customers:

```text
+ Add Customer
```

Quotations:

```text
+ New Quotation
```

Articles:

```text
+ New Article
```

Landing Pages:

```text
+ New Landing Page
```

---

# 23. DATA TABLE

Untuk data besar gunakan table.

Contoh quotation:

| Quotation | Customer | Date | Amount | Status | Owner | Action |
|---|---|---|---:|---|---|---|

Table harus mendukung jika diperlukan:

- Search
- Filter
- Sort
- Pagination
- Column visibility
- Row action
- Bulk action

---

# 24. MOBILE TABLE

Table tidak boleh dipaksa tampil sangat kecil di mobile.

Gunakan:

- Card layout
- Horizontal scroll jika diperlukan
- Priority columns
- Expandable detail

---

# 25. SEARCH

Global search harus dapat menemukan data sesuai permission.

Contoh:

```text
Customer
Lead
Booking
Quotation
Invoice
Payment
Article
Product
Landing Page
```

Search result harus menampilkan:

```text
Type
Name
Reference
Status
```

---

# 26. FILTER

Filter harus sesuai module.

Quotation:

```text
Status
Sales
Date
Customer
Amount
```

Booking:

```text
Status
Travel Date
Sales
Operations
Destination
```

Payment:

```text
Status
Date
Method
Amount
```

Content:

```text
Status
Author
Category
Product
Destination
Publish Date
```

---

# 27. DETAIL PAGE

Detail page menggunakan:

```text
Header
Status
Summary
Tabs
Activity
Related Records
Actions
```

Contoh Booking:

```text
Booking #BT-000123
CONFIRMED

Customer
Trip
Payment
Itinerary
Operations
Documents
Activity
```

---

# 28. STATUS BADGE

Status harus selalu mudah dikenali.

Contoh:

```text
DRAFT
SENT
PENDING
CONFIRMED
PAID
OVERDUE
CANCELLED
COMPLETED
PUBLISHED
ARCHIVED
```

Gunakan kombinasi:

```text
Label
+
Icon
+
Visual distinction
```

Jangan hanya mengandalkan warna.

---

# 29. STATUS LANGUAGE

Backend state code:

```text
PENDING_CONFIRMATION
```

UI label:

```text
Awaiting Confirmation
```

Backend code tidak perlu ditampilkan kepada customer.

---

# 30. FORM PRINCIPLE

Form harus:

- Grouped logically
- Clear labels
- Inline validation
- Required indicator
- Helpful placeholder
- Error message
- Save state
- Cancel action

---

# 31. FORM VALIDATION

Validation dilakukan:

```text
Client-side
+
Server-side
```

Client-side untuk UX.

Server-side untuk security dan business integrity.

---

# 32. REQUIRED FIELD

Required field harus terlihat jelas.

Contoh:

```text
Customer *
Travel Date *
Pax *
```

---

# 33. ERROR MESSAGE

Error harus spesifik.

Buruk:

```text
Invalid input.
```

Lebih baik:

```text
Travel date cannot be earlier than today.
```

---

# 34. UNSAVED CHANGES

Jika user meninggalkan form dengan perubahan:

```text
Unsaved changes

Are you sure you want to leave?
```

---

# 35. DRAFT AUTOSAVE

Untuk form kompleks seperti:

- Quotation
- Itinerary
- Article
- Landing Page

dapat menggunakan autosave draft jika architecture mendukung.

User harus melihat status:

```text
Saving...
Saved
Saved at 21:15
```

---

# 36. QUOTATION UI

Quotation detail:

```text
Quotation #Q-0001
Status: SENT

Customer
Trip Summary
Package
Services
Itinerary
Pricing
Payment Terms

[Send]
[Print]
[Download PDF]
[Duplicate]
[Convert to Booking]
```

Action harus state-aware.

---

# 37. QUOTATION ACTION RULE

Jika status:

```text
DRAFT
```

tampilkan:

```text
Edit
Send
Delete/Archive
```

Jika:

```text
SENT
```

tampilkan:

```text
View
Resend
Duplicate
```

Jika:

```text
ACCEPTED
```

tampilkan:

```text
Convert to Booking
```

---

# 38. QUOTATION PREVIEW

Quotation harus memiliki preview yang menyerupai dokumen final.

Customer-facing preview:

```text
Company
Customer
Trip
Services
Price
Terms
Validity
Payment Instructions
Contact
```

Internal information tidak boleh masuk.

---

# 39. PRINT / PDF

Dokumen penting harus dapat:

```text
Print
Generate PDF
Send
```

Minimal:

```text
Quotation
Invoice
Receipt
Itinerary
Booking Confirmation
```

---

# 40. INVOICE UI

Invoice detail:

```text
Invoice #INV-0001

Customer
Booking
Items
Subtotal
Discount
Tax
Total
Paid
Balance
Due Date
Status
```

Actions:

```text
Issue
Send
Print
Download
Record Payment
Void
```

Action berdasarkan state dan permission.

---

# 41. PAYMENT UI

Payment detail:

```text
Payment Reference
Customer
Booking
Invoice
Amount
Method
Date
Proof
Status
Verification
```

Jika proof tersedia:

```text
[View Proof]
```

Finance:

```text
[Verify]
[Reject]
[Request Clarification]
```

---

# 42. PAYMENT PROOF UPLOAD

Customer/Sales dapat:

```text
Upload Proof
```

Field:

```text
Amount
Payment Date
Bank/Method
Reference
Attachment
Notes
```

Setelah upload:

```text
PROOF_UPLOADED
```

---

# 43. PAYMENT REVIEW UI

Finance melihat:

```text
Expected Amount
Submitted Amount
Difference
Payment Method
Proof
Booking
Invoice
Customer
```

Action:

```text
Verify
Reject
Request Clarification
```

---

# 44. BOOKING UI

Booking detail:

```text
Booking #B-0001
CONFIRMED

Customer
Travel Information
Package
Itinerary
Passengers
Payments
Invoices
Operations
Documents
Activity
```

---

# 45. BOOKING TIMELINE

Gunakan timeline:

```text
Quotation Accepted
      ↓
Booking Created
      ↓
Booking Confirmed
      ↓
Payment Received
      ↓
Trip Prepared
      ↓
Trip Started
      ↓
Trip Completed
```

---

# 46. ITINERARY UI

Itinerary harus mudah dibaca customer.

Format:

```text
DAY 1
Date
Location
Morning
Afternoon
Evening
Hotel
Meals
Transport
Notes
```

---

# 47. ITINERARY EDITOR

Internal editor dapat menggunakan:

```text
Day
Time
Location
Activity
Duration
Transport
Meal
Hotel
Notes
```

Item dapat:

- Add
- Edit
- Delete
- Duplicate
- Reorder

---

# 48. ITINERARY CONFLICT DETECTION

UI harus memberi warning jika:

```text
Activity A ends 14:00
Activity B starts 13:30
```

Tampilkan:

```text
Schedule conflict detected.
```

---

# 49. PACKAGE BUILDER

Package builder:

```text
Basic Information
Pricing
Included
Excluded
Itinerary Template
Availability
Terms
Media
SEO
Publishing
```

---

# 50. PACKAGE PUBLIC PREVIEW

Internal user dapat:

```text
[Preview Website]
```

sebelum publish.

---

# 51. PACKAGE PUBLISHING

Status:

```text
DRAFT
REVIEW
APPROVED
PUBLISHED
UNPUBLISHED
ARCHIVED
```

Tombol:

```text
Save Draft
Submit Review
Approve
Publish
Unpublish
```

---

# 52. PUBLIC WEBSITE PACKAGE PAGE

Package page minimal:

```text
Hero
Package Name
Short Description
Price / Starting Price
Duration
Highlights

Itinerary

Included
Excluded

Gallery

Important Information

FAQ

CTA
```

CTA:

```text
Request This Package
Ask a Question
Get Quotation
```

---

# 53. CRM UI

Lead detail:

```text
Lead Information
Contact
Source
Requirement
Pipeline
Activities
Follow-ups
Quotation
Booking
Notes
```

---

# 54. CRM TIMELINE

Timeline:

```text
Lead Created
↓
Contacted
↓
Follow-up
↓
Quotation Sent
↓
Customer Response
↓
Negotiation
↓
Won
```

---

# 55. FOLLOW-UP UI

Follow-up card:

```text
Customer
Task
Due Date
Priority
Assigned To
Related Record
Status
```

Action:

```text
Complete
Reschedule
Reassign
Add Note
```

---

# 56. CALENDAR UI

Calendar digunakan untuk:

- Follow-up
- Booking
- Trip
- Availability
- Assignment

Views:

```text
Day
Week
Month
Agenda
```

---

# 57. AVAILABILITY CALENDAR

Availability dapat dilihat berdasarkan:

```text
Vehicle
Driver
Guide
Hotel
Activity
Vendor
```

Conflict harus terlihat jelas.

---

# 58. OPERATIONS BOARD

Operations dapat menggunakan board:

```text
CONFIRMED
↓
PREPARING
↓
READY
↓
IN PROGRESS
↓
COMPLETED
```

Booking card menampilkan:

```text
Booking
Customer
Date
Pax
Destination
Assigned Team
Status
```

---

# 59. DRAG AND DROP

Drag-and-drop hanya boleh digunakan jika:

- Transition valid
- User memiliki permission
- Backend menerima transition
- Conflict validation berjalan

Frontend tidak boleh mengubah state hanya karena card dipindahkan.

---

# 60. MODAL

Gunakan modal untuk:

- Confirmation
- Short form
- Quick action
- Approval
- Reject reason

Jangan gunakan modal untuk form yang sangat panjang.

---

# 61. DRAWER

Gunakan drawer untuk:

- Quick preview
- Activity
- Related information
- Small edit

---

# 62. CONFIRMATION DIALOG

Action berisiko harus meminta confirmation.

Contoh:

```text
Cancel Booking
Void Invoice
Reject Payment
Approve Refund
Delete Draft
Unpublish Content
```

---

# 63. DESTRUCTIVE ACTION

Destructive action harus:

- Jelas
- Tidak ambigu
- Meminta confirmation
- Meminta reason jika diperlukan
- Tercatat dalam audit

---

# 64. TOAST / NOTIFICATION

Success:

```text
Quotation sent successfully.
```

Error:

```text
Payment could not be verified.
```

Warning:

```text
This booking has an outstanding balance.
```

Info:

```text
Quotation expires in 2 days.
```

---

# 65. EMPTY STATE

Jika belum ada data:

```text
No quotations yet.

Create your first quotation to start managing customer proposals.
```

Jangan hanya:

```text
No data.
```

---

# 66. LOADING STATE

Gunakan:

- Skeleton
- Spinner
- Progress indicator

Hindari blank screen.

---

# 67. NETWORK ERROR

Jika koneksi gagal:

```text
We couldn't load this data.
Please try again.
```

Action:

```text
Retry
```

---

# 68. ACCESS DENIED

Jika user tidak memiliki permission:

```text
You don't have permission to perform this action.
```

Jangan menampilkan sensitive information.

---

# 69. RESPONSIVE DESIGN

Target:

```text
Mobile
Tablet
Laptop
Desktop
Large Desktop
```

---

# 70. MOBILE-FIRST PRIORITY

Fungsi yang harus nyaman di mobile:

- Customer portal
- Payment proof upload
- Quotation viewing
- Itinerary
- CRM follow-up
- Booking lookup
- Notifications
- Blog reading
- Landing page
- Product browsing

---

# 71. ACCESSIBILITY

Frontend harus mempertimbangkan:

- Keyboard navigation
- Focus state
- Semantic HTML
- Screen reader labels
- Contrast
- Error association
- Accessible form labels

---

# 72. DESIGN SYSTEM

Frontend harus memiliki reusable components:

```text
Button
Input
Select
DatePicker
CurrencyInput
Table
Card
Badge
Modal
Drawer
Tabs
Dropdown
Toast
Tooltip
Pagination
Timeline
FileUpload
RichTextEditor
ProductCard
ArticleCard
CTA
```

---

# 73. BUSINESS COMPONENTS

Reusable business components:

```text
CustomerCard
BookingStatusBadge
PaymentStatusBadge
QuotationSummary
InvoiceSummary
ItineraryDay
FollowUpCard
AvailabilityCalendar
ActivityTimeline
ProductCard
ProductBlock
ArticleCard
LandingPageSection
ContentStatusBadge
```

---

# 74. CURRENCY DISPLAY

Currency display harus konsisten.

Contoh:

```text
Rp 5.000.000
```

Formatting mengikuti locale/currency configuration.

Jangan hard-code format di setiap component.

---

# 75. DATE DISPLAY

Internal date/time mengikuti configured timezone.

Customer-facing date menggunakan format yang mudah dipahami.

---

# 76. TIMEZONE

Backend menyimpan timestamp dengan standard timezone strategy.

Frontend harus melakukan display conversion sesuai configured business/customer timezone.

Jangan menggunakan browser timezone secara membabi buta untuk operational date.

---

# 77. FILE UPLOAD

Upload component harus mendukung:

- File type validation
- File size validation
- Upload progress
- Preview jika memungkinkan
- Error handling
- Secure storage reference

Digunakan untuk:

```text
Payment Proof
Customer Documents
Trip Documents
Vendor Documents
Content Media
```

---

# 78. FILE SECURITY

Frontend tidak boleh menganggap file URL sebagai public.

Sensitive document harus menggunakan authorization-aware access.

---

# 79. PRINT VIEW

Untuk dokumen penting:

```text
Quotation
Invoice
Receipt
Itinerary
Booking Confirmation
```

sediakan print-friendly layout.

---

# 80. PUBLIC WEBSITE SEO

Public website harus mendukung:

- Page title
- Meta description
- Canonical URL
- Open Graph
- Structured data jika diperlukan
- Sitemap
- Search engine indexing control

---

# 81. CMS — CONTENT MANAGEMENT SYSTEM

Website harus memiliki CMS internal yang memungkinkan authorized staff membuat, mengedit, mengatur, dan menerbitkan konten website tanpa mengubah source code.

Jenis content utama:

```text
Articles / Blog
Landing Pages
Products / Packages
Destinations
Promotions
FAQ
Media
```

CMS harus terintegrasi dengan data bisnis yang relevan.

---

# 82. ARTICLE / BLOG MANAGEMENT

Admin atau authorized content staff dapat membuat artikel:

```text
Title
Slug
Excerpt
Featured Image
Content
Category
Tags
Author
Publish Date
SEO Metadata
Related Products
Related Destinations
Related Articles
Status
```

Status:

```text
DRAFT
REVIEW
APPROVED
PUBLISHED
ARCHIVED
```

---

# 83. ARTICLE EDITOR

Article editor harus mendukung:

- Rich text
- Heading
- Paragraph
- Bold
- Italic
- Lists
- Quote
- Links
- Images
- Video/embed jika diizinkan
- Tables jika diperlukan
- Product blocks
- CTA blocks
- Related content

Editor harus menghasilkan content yang responsive.

---

# 84. ARTICLE STRUCTURE

Artikel dapat memiliki struktur:

```text
Title

Introduction

Content Section

Image

Content Section

Product Recommendation

Content Section

CTA

Related Articles
```

---

# 85. PRODUCT IN ARTICLE

Artikel harus dapat mencantumkan product/package yang berasal dari database system.

Product yang dapat ditampilkan:

```text
Tour Package
Hotel Package
Transport Package
Activity
Service
Promotion
```

Jika product sudah tersedia di database, artikel harus menggunakan reference ke product tersebut.

Jangan membuat duplicate product record hanya untuk kebutuhan artikel.

---

# 86. PRODUCT BLOCK

Editor menyediakan:

```text
[+ Add Product]
```

User dapat mencari:

```text
Search package...
```

Kemudian memilih product.

Product block dapat menampilkan:

```text
Image
Product Name
Short Description
Duration
Starting Price
Highlights
CTA
```

Contoh:

```text
┌──────────────────────────────┐
│       Package Image          │
│                              │
│ Batam City Tour              │
│ 1 Day                        │
│ Starting from Rp xxx         │
│                              │
│ [View Package] [Ask Quote]   │
└──────────────────────────────┘
```

---

# 87. PRODUCT REFERENCE

Product yang disisipkan ke artikel harus menggunakan:

```text
product_id
```

atau reference identifier yang ditentukan backend.

Struktur:

```text
Product Database
      ↓
Product Reference
      ↓
Article
      ↓
Website
```

---

# 88. PRODUCT DATA DISPLAY

Ketika artikel ditampilkan di website, product block mengambil data product yang diizinkan untuk public display.

Public data:

```text
Product Name
Public Description
Public Price
Duration
Featured Image
Public URL
Availability information
CTA
```

Data internal tidak boleh ditampilkan:

```text
Supplier Cost
Internal Margin
Commission
Internal Notes
Purchase Cost
```

---

# 89. PRODUCT STATUS RULE

Product hanya boleh muncul secara public jika:

```text
Product Status = PUBLISHED
```

Jika:

```text
DRAFT
UNPUBLISHED
ARCHIVED
```

maka frontend tidak boleh menampilkan product kepada public.

---

# 90. PRODUCT REMOVAL FROM ARTICLE

Jika product yang direferensikan kemudian:

```text
Unpublished
Archived
Deleted
```

system harus menangani reference tersebut dengan aman.

Jangan menyebabkan halaman artikel error.

Frontend dapat:

```text
Hide product block
```

atau:

```text
This product is currently unavailable.
```

sesuai business rule.

Admin harus mendapatkan warning di CMS.

---

# 91. LANDING PAGE BUILDER

System harus menyediakan landing page builder.

Landing page digunakan untuk:

- Campaign
- Product promotion
- Destination promotion
- Seasonal promotion
- Lead generation
- Advertisement campaign
- Special offer

---

# 92. LANDING PAGE STRUCTURE

Landing page dapat terdiri dari:

```text
Hero
Headline
Subheadline
Image / Video
CTA

Benefits
Features

Product / Package

Itinerary / Experience

Gallery

Testimonials

FAQ

Promotion

Contact / Inquiry Form

Final CTA
```

Tidak semua section wajib digunakan.

---

# 93. LANDING PAGE BUILDER

Landing page builder menggunakan reusable sections.

Contoh:

```text
Hero Section
Text Section
Image Section
Two Column Section
Product Section
Gallery Section
Testimonial Section
FAQ Section
CTA Section
Contact Form
```

User dapat:

```text
Add Section
Edit Section
Delete Section
Reorder Section
Duplicate Section
Preview
Publish
```

---

# 94. LANDING PAGE PRODUCT BLOCK

Landing page juga dapat mengambil product dari database.

Contoh:

```text
Special Offer

[Product A]
[Product B]
[Product C]
```

Product tidak perlu dibuat ulang secara manual.

---

# 95. LANDING PAGE CTA

CTA dapat diarahkan ke:

```text
Product Detail
Quotation Request
Booking Request
Contact Form
WhatsApp
Customer Portal
External URL
```

CTA target harus configurable.

---

# 96. LEAD CAPTURE

Landing page dapat memiliki lead form.

Minimal:

```text
Name
Phone
Email
Travel Date
Number of Travelers
Interested Product
Message
```

Field dapat configurable berdasarkan campaign.

---

# 97. LANDING PAGE LEAD INTEGRATION

Lead dari website harus dapat masuk ke CRM.

Flow:

```text
Visitor
   ↓
Landing Page
   ↓
Lead Form
   ↓
Lead Created
   ↓
CRM
   ↓
Sales Assignment
   ↓
Follow-up
```

Lead source harus tercatat.

Contoh:

```text
Website
Landing Page
Blog
Campaign
Product Page
```

---

# 98. BLOG → PRODUCT → CRM

Website harus mendukung alur:

```text
Visitor reads article
        ↓
Sees related product
        ↓
Clicks product
        ↓
Views package
        ↓
Clicks CTA
        ↓
Submits inquiry
        ↓
Lead created in CRM
        ↓
Sales follow-up
```

Source attribution harus dipertahankan jika memungkinkan.

---

# 99. ARTICLE CTA

Artikel dapat memiliki CTA:

```text
Request This Package
Get a Quote
Plan Your Trip
Ask Our Travel Consultant
View Package
Contact Us
```

CTA dapat berada:

```text
Inside article
End of article
Product block
Sidebar
Sticky mobile CTA
```

---

# 100. RELATED PRODUCTS

Article dapat memiliki:

```text
Related Products
```

Contoh:

```text
Artikel:
Panduan Liburan 3 Hari di Batam

Related Products:
- Batam 3D2N Package
- Batam City Tour
- Barelang Tour
```

---

# 101. RELATED ARTICLES

Product page juga dapat menampilkan:

```text
Related Articles
```

Contoh:

```text
Batam City Tour

Related Articles:
- 10 Tempat Wisata Batam
- Panduan Liburan ke Batam
- Waktu Terbaik Mengunjungi Batam
```

Tujuan:

```text
Content
↔
Product
↔
Destination
```

---

# 102. DESTINATION CONTENT

Destination dapat menjadi entity yang digunakan bersama:

```text
Articles
Products
Landing Pages
SEO
```

Contoh:

```text
Destination:
Batam

Articles:
Things to do in Batam

Products:
Batam City Tour

Landing Page:
Explore Batam
```

---

# 103. CONTENT TAXONOMY

CMS menggunakan taxonomy:

```text
Category
Tag
Destination
Product
Campaign
```

Contoh category:

```text
Travel Guide
Things To Do
Food
Family Travel
Business Travel
Travel Tips
```

---

# 104. CONTENT SEARCH

Admin dapat mencari content berdasarkan:

```text
Title
Author
Category
Tag
Status
Product
Destination
Publish Date
```

---

# 105. CONTENT FILTER

Filter minimal:

```text
Draft
Review
Published
Archived
```

dan:

```text
Author
Category
Date
Product
Destination
```

---

# 106. CONTENT PREVIEW

Sebelum publish, admin dapat memilih:

```text
Preview Desktop
Preview Tablet
Preview Mobile
```

Preview harus menyerupai tampilan public website.

---

# 107. CONTENT SCHEDULING

Admin dapat menentukan:

```text
Publish Date
Publish Time
Unpublish Date
```

Scheduling menggunakan timezone bisnis yang ditentukan system.

---

# 108. CONTENT VERSIONING

Content penting harus mendukung versioning jika architecture memungkinkan.

Contoh:

```text
Version 1
Version 2
Version 3
```

Admin dapat melihat:

```text
Who changed
When
What changed
```

---

# 109. CONTENT APPROVAL

Jika workflow approval digunakan:

```text
DRAFT
   ↓
SUBMITTED FOR REVIEW
   ↓
APPROVED
   ↓
PUBLISHED
```

Author tidak otomatis dapat publish jika tidak memiliki permission.

---

# 110. CONTENT OWNERSHIP

Setiap content dapat memiliki:

```text
Author
Editor
Reviewer
Publisher
```

Tidak semua role harus memiliki semua permission.

---

# 111. SEO CONTENT FIELDS

Artikel dan landing page minimal mendukung:

```text
SEO Title
Meta Description
Slug
Canonical URL
OG Title
OG Description
OG Image
```

Jika diperlukan:

```text
Schema Type
```

---

# 112. SLUG

Slug harus:

- URL-safe
- Unique
- Stable jika sudah published
- Tidak menggunakan karakter yang tidak diperlukan

Contoh:

```text
/blog/batam-travel-guide

/packages/batam-city-tour

/paket-liburan-batam-3d2n

/landing/explore-batam
```

---

# 113. PUBLISHED URL

Public content harus memiliki URL yang jelas.

Contoh:

```text
/blog/{slug}

/packages/{slug}

/destinations/{slug}

/landing/{slug}
```

Struktur final dapat disesuaikan dengan SEO architecture.

---

# 114. REDIRECT

Jika slug published berubah, system sebaiknya mendukung redirect dari URL lama ke URL baru.

Tujuannya:

- Mencegah broken links
- Menjaga SEO
- Mempertahankan traffic

---

# 115. MEDIA LIBRARY

CMS memiliki media library untuk:

```text
Images
Documents
Videos / Embeds
```

Media memiliki metadata:

```text
Filename
Title
Alt Text
Caption
Uploader
Created Date
```

---

# 116. IMAGE ALT TEXT

Setiap public image yang relevan harus memiliki alt text.

Alt text harus menjelaskan gambar secara natural.

Jangan menggunakan keyword stuffing.

---

# 117. CONTENT BLOCK SECURITY

Rich text editor tidak boleh mengizinkan arbitrary unsafe HTML/script.

HTML harus disanitasi.

---

# 118. EMBED SECURITY

Jika embed video atau external content didukung:

- Hanya provider yang diizinkan
- Sanitization
- CSP consideration
- Tidak boleh arbitrary script

---

# 119. PUBLIC CONTENT CACHE

Published content dapat menggunakan caching/CDN jika diperlukan.

Setelah:

```text
Publish
Update
Unpublish
```

cache harus di-invalidate sesuai architecture.

---

# 120. PRODUCT PRICE IN CONTENT

Jika product block menampilkan harga, harga harus berasal dari sumber data yang ditentukan system.

Jangan hard-code harga di artikel kecuali memang merupakan historical/editorial price yang secara eksplisit ditandai.

Jika harga product berubah, product block harus mengikuti aturan pricing system.

---

# 121. PROMOTION IN CONTENT

Artikel dan landing page dapat menampilkan promotion.

Promotion harus mengikuti:

```text
Start Date
End Date
Status
Eligibility
```

Promotion expired tidak boleh tetap tampil sebagai active offer.

---

# 122. PUBLIC CONTENT DATA VISIBILITY

CMS harus memisahkan:

```text
PUBLIC DATA
```

dan:

```text
INTERNAL DATA
```

Public API tidak boleh mengembalikan:

```text
Cost
Margin
Commission
Supplier Data
Internal Notes
Internal Customer Data
```

---

# 123. CONTENT ANALYTICS

Jika analytics digunakan, system dapat mencatat:

```text
Page Views
Product Clicks
CTA Clicks
Lead Conversion
Traffic Source
```

Analytics tidak boleh mengubah business transaction secara langsung.

---

# 124. CONTENT → CRM ATTRIBUTION

Jika visitor berasal dari:

```text
Blog Article
Landing Page
Product Page
Campaign
```

source tersebut sebaiknya ikut tersimpan ketika lead dibuat.

Contoh:

```text
Lead Source:
Website

Content:
5 Tempat Wisata di Batam

Campaign:
Liburan Batam 2026

Product:
Batam 3D2N
```

---

# 125. BLOG TO PRODUCT CTA TRACKING

Ketika user mengklik product dari artikel, system dapat mencatat:

```text
Article ID
Product ID
CTA Type
Timestamp
Session / Lead reference
```

untuk analytics dan attribution.

---

# 126. CONTENT WORKFLOW

End-to-end:

```text
Create Content
      ↓
Edit
      ↓
Save Draft
      ↓
Review
      ↓
Approve
      ↓
Schedule / Publish
      ↓
Public Website
      ↓
Visitor Engagement
      ↓
Lead
      ↓
CRM
      ↓
Sales Follow-up
```

---

# 127. CONTENT MANAGEMENT PERMISSION

Minimal permission:

```text
content.view
content.create
content.edit
content.review
content.approve
content.publish
content.unpublish
content.archive
content.delete
```

Product linking:

```text
content.link_product
```

Landing page:

```text
landing_page.create
landing_page.edit
landing_page.publish
```

---

# 128. CMS DASHBOARD

CMS dashboard dapat menampilkan:

```text
Drafts
Pending Review
Scheduled
Published
Recently Updated
Top Articles
Top Product Clicks
Leads Generated
```

---

# 129. CONTENT QUALITY CHECK

Sebelum publish, system dapat melakukan checklist:

```text
Title exists
Slug exists
Featured image exists
Content exists
SEO title exists
Meta description exists
Product references valid
Links valid
CTA exists where required
Mobile preview checked
```

---

# 130. BROKEN REFERENCE WARNING

Jika artikel memiliki:

```text
Deleted Product
Unpublished Product
Broken Link
Missing Image
```

CMS harus memberikan warning sebelum publish.

Jika policy mewajibkan, publish dapat diblokir sampai masalah diperbaiki.

---

# 131. PUBLIC WEBSITE CONTENT ARCHITECTURE

Hubungan antar content:

```text
                 ┌─────────────┐
                 │ Destination │
                 └──────┬──────┘
                        │
          ┌─────────────┼─────────────┐
          ↓             ↓             ↓
      Articles       Products     Landing Pages
          │             │             │
          └─────────────┼─────────────┘
                        ↓
                     Website
                        ↓
                      Lead
                        ↓
                       CRM
```

---

# 132. PUBLIC PRODUCT DISCOVERY

User website harus dapat menemukan product melalui:

```text
Homepage
Article
Landing Page
Destination Page
Search
Category
Related Products
Promotion
```

---

# 133. PRODUCT → ARTICLE RELATION

Product dapat memiliki related articles.

Contoh:

```text
Product:
Batam 3D2N Package

Related Articles:
- Panduan Liburan 3 Hari di Batam
- Tempat Wisata yang Wajib Dikunjungi
- Tips Liburan ke Batam
```

---

# 134. ARTICLE → PRODUCT RELATION

Article dapat memiliki related products.

Contoh:

```text
Article:
10 Aktivitas Menarik di Batam

Related Products:
- Batam City Tour
- Barelang Tour
- Batam Island Tour
```

Hubungan harus menggunakan database reference.

---

# 135. LANDING PAGE → PRODUCT RELATION

Landing page dapat menampilkan satu atau beberapa product.

Contoh:

```text
Landing Page:
Paket Liburan Batam

Products:
Batam 2D1N
Batam 3D2N
Batam Family Package
```

---

# 136. CONTENT → CRM → SALES

Semua CTA yang menghasilkan inquiry harus dapat terhubung ke CRM.

Flow:

```text
Article / Landing Page / Product
             ↓
           CTA
             ↓
       Inquiry Form
             ↓
            Lead
             ↓
       Sales Assignment
             ↓
         Follow-up
             ↓
         Quotation
```

---

# 137. SOURCE ATTRIBUTION

Lead sebaiknya menyimpan:

```text
Source
Source Detail
Landing Page
Article
Product
Campaign
Referrer
```

jika data tersebut tersedia dan sesuai privacy policy.

---

# 138. CONTENT CONVERSION

Management dapat melihat hubungan:

```text
Article Views
     ↓
Product Clicks
     ↓
Inquiries
     ↓
Leads
     ↓
Quotations
     ↓
Bookings
```

Tujuannya agar content dapat dievaluasi berdasarkan business result, bukan hanya jumlah views.

---

# 139. CONTENT QUALITY PRINCIPLE

Content harus:

- Useful
- Readable
- Mobile friendly
- Accurate
- Consistent
- SEO-aware
- Conversion-aware
- Tidak menyesatkan customer

---

# 140. FRONTEND SECURITY

Frontend harus:

- Tidak menyimpan secret
- Tidak mempercayai client-side permission
- Tidak mengirim sensitive data tanpa authorization
- Tidak menampilkan data unauthorized
- Menangani session expiration

---

# 141. AUTHENTICATION UI

Login:

```text
Email
Password
Remember me
Login
Forgot password
```

Jika MFA digunakan:

```text
Verification
```

---

# 142. SESSION EXPIRATION

Jika session expired:

```text
Your session has expired.
Please sign in again.
```

Draft yang belum tersimpan sebaiknya dipertahankan jika memungkinkan.

---

# 143. PERMISSION-AWARE UI

UI boleh menyembunyikan action yang tidak boleh dilakukan.

Namun:

> Hidden UI bukan security boundary.

Backend tetap wajib memvalidasi permission.

---

# 144. AUDIT UI

User dengan permission dapat melihat activity history:

```text
Who
Did What
When
Previous State
New State
Reason
```

---

# 145. ACTIVITY TIMELINE

Activity timeline digunakan pada:

- Lead
- Customer
- Quotation
- Booking
- Invoice
- Payment
- Content

---

# 146. RELATED RECORDS

Detail page harus menyediakan hubungan antar-record.

Contoh Booking:

```text
Customer
Quotation
Invoice
Payments
Itinerary
Vendors
Expenses
Documents
CRM Activities
```

Contoh Product:

```text
Articles
Landing Pages
Bookings
Quotations
Promotions
```

---

# 147. QUICK ACTIONS

User dapat melakukan action umum dari detail page.

Customer:

```text
New Quotation
New Booking
Add Note
Schedule Follow-up
```

Article:

```text
Edit
Preview
Publish
Unpublish
Add Product
```

Product:

```text
Edit
Preview
Publish
View Related Articles
```

---

# 148. BULK ACTION

Bulk action hanya untuk action aman.

Contoh:

```text
Assign Sales
Change Owner
Export
Archive
```

Untuk action sensitif seperti:

```text
Verify Payment
Approve Refund
Cancel Booking
Publish Content
```

hindari bulk action kecuali ada business rule dan confirmation yang kuat.

---

# 149. TABLE EXPORT

Export harus mengikuti permission.

Data export harus:

- Audit
- Filter-aware
- Permission-aware

---

# 150. NOTIFICATION CENTER

Notification center:

```text
Unread
Read
All
```

Contoh:

```text
Payment proof uploaded.
Quotation accepted.
Booking requires confirmation.
Invoice overdue.
Follow-up due today.
Article submitted for review.
Landing page approved.
```

---

# 151. CUSTOMER NOTIFICATION

Customer hanya menerima informasi yang relevan.

Contoh:

```text
Your quotation is ready.
Your booking has been confirmed.
Your payment is being verified.
Your itinerary has been updated.
```

---

# 152. FRONTEND STATE MANAGEMENT

Global state hanya digunakan untuk data yang memang membutuhkan shared state.

Jangan menyimpan seluruh database di global client state.

---

# 153. SERVER STATE

Data seperti:

```text
Customers
Bookings
Invoices
Payments
Quotations
Articles
Products
Landing Pages
```

dianggap server state dan memiliki:

- Loading
- Error
- Cache
- Refresh
- Invalidation

---

# 154. FORM STATE

Form memiliki:

```text
Pristine
Dirty
Saving
Saved
Error
Submitted
```

---

# 155. OPTIMISTIC UI

Optimistic update hanya digunakan untuk action yang aman.

Untuk transaksi finansial:

```text
Payment Verification
Refund
Invoice Issue
```

gunakan confirmation dari backend sebelum UI menganggap sukses.

---

# 156. API ERROR HANDLING

Frontend harus mampu menangani:

```text
400 Validation Error
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Business Rule Error
429 Rate Limited
500 Server Error
```

---

# 157. CONFLICT UI

Jika terjadi concurrency conflict:

```text
This record has been changed by another user.
Please refresh and review the latest version.
```

---

# 158. ROUTING

Internal ERP:

```text
/dashboard

/crm/leads
/crm/customers
/crm/follow-ups

/sales/quotations
/sales/packages

/bookings
/bookings/calendar

/operations/trips
/operations/itineraries

/finance/invoices
/finance/payments
/finance/refunds

/content/articles
/content/landing-pages
/content/products
/content/destinations
/content/media

/reports

/settings
```

---

# 159. CUSTOMER ROUTING

Customer portal:

```text
/portal
/portal/quotations
/portal/bookings
/portal/invoices
/portal/payments
/portal/itineraries
/portal/documents
```

---

# 160. PUBLIC WEBSITE ROUTING

Contoh:

```text
/
/packages
/packages/{slug}
/destinations
/destinations/{slug}
/blog
/blog/{slug}
/landing/{slug}
/contact
/about
/faq
```

---

# 161. DEEP LINKING

User harus dapat membuka detail page melalui URL secara aman.

Permission tetap diperiksa server-side.

---

# 162. BREADCRUMB

Contoh:

```text
Bookings / B-000123
```

Nested:

```text
Bookings / B-000123 / Itinerary
```

CMS:

```text
Content / Articles / Article Title
```

---

# 163. BROWSER NAVIGATION

Browser back button harus bekerja secara wajar.

Jangan merusak browser history dengan routing yang tidak diperlukan.

---

# 164. CONFIRMATION BEFORE STATE CHANGE

UI harus memberikan feedback sebelum state transition yang penting.

Contoh:

```text
Confirm Booking?
```

dengan ringkasan:

```text
Customer
Date
Pax
Total
Payment Status
```

---

# 165. STATE-AWARE ACTION BAR

Action bar berubah sesuai state.

Quotation:

```text
DRAFT
[Edit] [Send]

SENT
[Resend] [Duplicate]

ACCEPTED
[Convert to Booking]

CANCELLED
[View Only]
```

Article:

```text
DRAFT
[Edit] [Submit Review]

REVIEW
[Review]

APPROVED
[Publish]

PUBLISHED
[Edit] [Unpublish]
```

---

# 166. READ-ONLY MODE

Record menjadi read-only ketika business rule mengharuskan.

Contoh:

```text
Issued Invoice
Verified Payment
Completed Booking
```

Correction dilakukan melalui workflow khusus.

---

# 167. DATA SNAPSHOT UI

Jika booking menggunakan package snapshot, UI harus menunjukkan bahwa data tersebut merupakan snapshot.

Contoh:

```text
Package used for this booking
Snapshot from package version 3
```

---

# 168. CUSTOMER DATA PRIVACY

UI harus menerapkan data minimization.

Customer A tidak boleh melihat:

```text
Customer B
Internal Notes
Vendor Cost
Margin
Commission
Internal Staff Data
```

---

# 169. INTERNAL NOTES

Internal notes harus jelas ditandai:

```text
Internal Only
```

dan tidak boleh muncul pada:

- Customer portal
- Customer PDF
- Public website
- Customer communication

---

# 170. CUSTOMER NOTES

Customer-visible notes harus dipisahkan dari internal notes.

---

# 171. DOCUMENT TEMPLATE UI

Admin dapat memilih template jika system mendukung:

```text
Quotation Template
Invoice Template
Itinerary Template
Confirmation Template
```

---

# 172. FRONTEND PERFORMANCE

Target:

- Fast initial load
- Lazy loading feature modules
- Pagination
- Image optimization
- Efficient API requests
- Caching
- Avoid unnecessary rerender

---

# 173. LARGE DATASETS

Untuk data besar gunakan:

```text
Server-side pagination
Filtering
Search
Sorting
```

Jangan load seluruh database ke browser.

---

# 174. IMAGE OPTIMIZATION

Public website images harus:

- Responsive
- Optimized
- Lazy-loaded jika sesuai
- Proper dimensions
- Alt text

---

# 175. FORM AUTOCOMPLETE

Customer selection harus menggunakan searchable dropdown.

Contoh:

```text
Search customer...
```

bukan dropdown dengan ribuan customer sekaligus.

---

# 176. CURRENCY INPUT

Currency input harus:

- Format readable
- Prevent invalid characters
- Preserve numeric value
- Display currency
- Validate min/max

---

# 177. DATE PICKER

Date picker harus mencegah invalid date jika business rule melarangnya.

Contoh:

```text
Travel date cannot be earlier than today.
```

---

# 178. TIME PICKER

Time input harus mendukung:

```text
Start Time
End Time
Duration
```

dan conflict detection.

---

# 179. FILE PREVIEW

Untuk payment proof:

```text
Preview
Download
Replace
Remove
```

tetap mengikuti permission dan state.

---

# 180. FRONTEND TESTING

Minimal testing:

```text
Unit Test
Component Test
Integration Test
End-to-End Test
Responsive Test
Accessibility Test
```

---

# 181. CRITICAL E2E FLOWS

E2E test wajib mencakup:

```text
Lead → Quotation
Quotation → Accepted
Quotation → Booking
Booking → Confirmation
Payment Proof → Verification
Invoice → Payment
Booking → Completed
Trip → CRM Follow-up
```

Website:

```text
Article → Product → CTA → Lead → CRM
Landing Page → Lead → CRM
Product Page → Inquiry → CRM
```

---

# 182. SECURITY TESTING

Test:

- Unauthorized route
- Unauthorized action
- IDOR
- File access
- Session expiry
- Permission bypass
- Sensitive data exposure
- CMS publish permission
- Content injection
- Unsafe HTML
- Unauthorized product access

---

# 183. UX TESTING

Test dengan skenario nyata:

```text
Sales membuat quotation
Customer menerima quotation
Customer upload payment proof
Finance verify payment
Operations menyiapkan trip
Customer melihat itinerary
Content staff membuat article
Content staff memasukkan product ke article
Content staff publish article
Visitor membaca article
Visitor membuka product
Visitor submit inquiry
Lead masuk CRM
Sales melakukan follow-up
```

---

# 184. FRONTEND DEVELOPMENT RULE

Developer tidak boleh membuat halaman berdasarkan asumsi semata.

Sebelum membuat feature, cek:

```text
Business Foundation
Business Process
Business Rules
PRD
Module Specification
Data Model
Roles & Permissions
Workflow
UI/UX Specification
```

---

# 185. SOURCE OF TRUTH

Untuk masing-masing aspek:

```text
Business Direction
→ 01_BUSINESS_FOUNDATION.md

Process
→ 02_BUSINESS_PROCESS_AND_SOP.md

Rules
→ 03_BUSINESS_RULES_AND_POLICY.md

System Requirements
→ 04_PRD_SYSTEM_REQUIREMENTS.md

Modules
→ 05_MODULE_SPECIFICATIONS.md

Database
→ 06_DATA_MODEL_AND_DATABASE_SCHEMA.md

Permissions
→ 07_USER_ROLES_PERMISSIONS_MATRIX.md

Workflow
→ 08_WORKFLOW_STATE_MACHINE.md

UI/UX + Frontend + Website + CMS
→ 09_UI_UX_AND_FRONTEND_SPECIFICATION.md
```

---

# 186. FRONTEND MUST NOT INVENT BUSINESS LOGIC

Contoh:

Frontend tidak boleh menentukan sendiri:

```text
Discount > 10% = require approval
```

jika aturan tersebut berasal dari backend/business policy.

Frontend hanya:

```text
Display
Validate for UX
Request action
Display result
```

---

# 187. BACKEND IS AUTHORITY

Backend menentukan:

```text
Permission
Business Rule
State Transition
Financial Calculation
Availability
Approval
Publishing Authority
```

Frontend menampilkan hasilnya.

---

# 188. CMS IS NOT THE BUSINESS DATABASE

CMS tidak boleh membuat duplicate data untuk entity bisnis yang sudah ada.

Contoh product:

```text
Product Database
       ↓
CMS Product Reference
       ↓
Article
       ↓
Website
```

Bukan:

```text
Article
   ↓
Duplicate Product Data
```

---

# 189. PUBLIC WEBSITE DATA RULE

Public website hanya boleh menampilkan data yang:

```text
Published
+
Public
+
Authorized
```

Data internal tidak boleh bocor melalui:

- UI
- API response
- HTML
- JSON
- Metadata
- Search
- Source code
- Public file URL

---

# 190. UI ACCEPTANCE CRITERIA

UI dianggap selesai jika:

- Responsive
- Permission-aware
- State-aware
- Error-aware
- Accessible
- Loading state tersedia
- Empty state tersedia
- Confirmation tersedia untuk destructive actions
- Tidak membocorkan internal data
- Critical workflow dapat diselesaikan tanpa workaround
- CMS content dapat dibuat dan dipublish sesuai permission
- Product dapat digunakan kembali di article dan landing page
- Website lead dapat masuk CRM

---

# 191. FRONTEND DEFINITION OF DONE

Feature dianggap selesai jika:

```text
UI
+
API Integration
+
Permission
+
Validation
+
Loading
+
Error
+
Empty State
+
Responsive
+
Audit/Activity where required
+
E2E Test
```

Untuk CMS feature:

```text
Content Model
+
Editor
+
Preview
+
Permission
+
Publishing Workflow
+
SEO
+
Responsive
+
Public Rendering
+
Product Reference
+
CRM Integration where applicable
```

---

# 192. FINAL UX PRINCIPLE

System harus membuat user berpikir:

> "Saya tahu apa yang harus saya lakukan berikutnya."

bukan:

> "Saya harus mencari-cari tombolnya."

---

# 193. FINAL FRONTEND PRINCIPLE

Frontend Batam Travelling ERP harus menjadi:

```text
Simple for the User
Powerful for the Business
Strict for the System
Clear for the Customer
Safe for Finance
Flexible for Operations
Traceable for Management
Conversion-aware for Website
Easy to Manage for Content Team
```

---

# 194. FINAL WEBSITE PRINCIPLE

Website Batam Travelling harus menjadi satu kesatuan dengan ERP.

```text
PUBLIC WEBSITE
      ↓
CONTENT
      ↓
ARTICLE / BLOG
      ↓
PRODUCT
      ↓
LANDING PAGE
      ↓
CTA
      ↓
LEAD
      ↓
CRM
      ↓
FOLLOW-UP
      ↓
QUOTATION
      ↓
BOOKING
      ↓
PAYMENT
      ↓
OPERATIONS
```

---

# 195. NEXT DOCUMENT

Dokumen berikutnya:

```text
10_API_AND_INTEGRATION_SPECIFICATION.md
```

Dokumen tersebut akan mendefinisikan:

- API architecture
- Endpoint
- Request / response
- Authentication
- Authorization
- Webhook
- Email
- WhatsApp
- Payment integration
- File storage
- Website integration
- CRM integration
- CMS integration
- Product integration
- Lead capture
- Analytics integration
- External services
- Error handling
- API security
- Integration events

---

# END OF DOCUMENT