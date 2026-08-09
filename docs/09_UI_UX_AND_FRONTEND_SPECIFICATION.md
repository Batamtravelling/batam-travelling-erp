# BATAM TRAVELLING ERP
# UI/UX & FRONTEND SPECIFICATION

**File Name:** `09_UI_UX_AND_FRONTEND_SPECIFICATION.md`  
**Document Number:** 09  
**Version:** 1.0  
**Status:** FRONTEND BASELINE  
**Project:** Batam Travelling ERP  
**Last Updated:** 2026-08-08

---

# 1. PURPOSE

Dokumen ini mendefinisikan standar UI, UX, frontend architecture, navigation, page structure, component behavior, responsive design, form behavior, status display, customer-facing interface, internal ERP interface, dan prinsip implementasi frontend.

Tujuan utamanya:

```text
Business Requirement
        ↓
Business Workflow
        ↓
User Action
        ↓
UI
        ↓
Backend Action
        ↓
State Change
        ↓
Notification / Automation
```

Frontend tidak boleh membuat business rule sendiri yang bertentangan dengan backend.

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
- State-aware
- Error-aware
- Accessible
- Scalable

Prinsip utama:

> UI harus membantu user menyelesaikan pekerjaan, bukan membuat user memahami cara kerja database.

---

# 3. USER INTERFACE CATEGORIES

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
- User management

---

# 5. CUSTOMER PORTAL

Customer dapat:

- Melihat quotation
- Accept quotation
- Melihat booking
- Melihat payment status
- Upload payment proof
- Melihat invoice
- Melihat itinerary
- Melihat trip information
- Mengirim request
- Melihat notification
- Memberikan feedback

Customer tidak boleh melihat data internal.

---

# 6. PUBLIC WEBSITE

Website publik berfungsi untuk:

- Menampilkan package
- Menampilkan destination
- Menampilkan itinerary
- Menampilkan service
- Menampilkan promotion
- Menampilkan company information
- Lead generation
- Contact / inquiry
- Booking request

Website harus dapat mengambil konten yang telah dipublikasikan dari system.

---

# 7. FRONTEND ARCHITECTURE PRINCIPLE

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
Settings
```

---

# 8. APPLICATION SHELL

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

# 9. GLOBAL HEADER

Header minimal memiliki:

- Company/logo
- Search
- Notification
- User profile
- Role/context
- Optional quick action

Contoh:

```text
[Logo] [Search...]              [🔔] [User]
```

---

# 10. GLOBAL SIDEBAR

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

Reports

Content / Website

Settings
```

Menu yang tampil harus berdasarkan permission.

---

# 11. ROLE-BASED NAVIGATION

User tidak boleh melihat menu yang tidak relevan dengan permission.

Contoh:

Sales:

```text
CRM
Sales
Bookings
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

# 12. DASHBOARD

Dashboard harus berbeda berdasarkan role.

---

# 13. OWNER / MANAGEMENT DASHBOARD

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

---

# 14. SALES DASHBOARD

Menampilkan:

- New leads
- Follow-up due
- Open quotations
- Negotiations
- Won deals
- Upcoming customer requests
- Unpaid customer invoices

---

# 15. FINANCE DASHBOARD

Menampilkan:

- Invoice outstanding
- Overdue
- Payment proof awaiting verification
- Verified payments
- Refund requests
- Expenses pending approval
- Cash/payment summary

---

# 16. OPERATIONS DASHBOARD

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

# 17. CUSTOMER DASHBOARD

Customer melihat:

```text
Upcoming Trip
Payment Status
Quotation
Invoice
Itinerary
Notifications
```

Tidak menampilkan:

- Internal margin
- Supplier cost
- Internal notes
- Commission
- Internal staff comments

---

# 18. PAGE STRUCTURE

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

# 19. PAGE HEADER

Contoh:

```text
Quotations

Manage customer quotations and sales proposals.

[+ New Quotation]
```

---

# 20. PRIMARY ACTION

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

Bookings:

```text
+ New Booking
```

---

# 21. SECONDARY ACTIONS

Secondary actions dapat berupa:

```text
Export
Import
Filter
Refresh
Print
Send
Archive
```

Action harus mengikuti permission.

---

# 22. DATA TABLE

Untuk data besar gunakan table.

Contoh quotation:

| Quotation | Customer | Date | Amount | Status | Owner | Action |
|---|---|---|---:|---|---|---|

Table harus mendukung:

- Search
- Filter
- Sort
- Pagination
- Column visibility
- Row action
- Bulk action jika diperlukan

---

# 23. MOBILE TABLE

Table tidak boleh dipaksa tampil sangat kecil di mobile.

Gunakan:

- Card layout
- Horizontal scroll jika diperlukan
- Priority columns
- Expandable detail

---

# 24. SEARCH

Global search harus dapat menemukan data sesuai permission.

Contoh:

```text
Customer
Booking
Quotation
Invoice
Payment
Lead
```

Search result harus menampilkan:

```text
Type
Name
Reference
Status
```

---

# 25. FILTER

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

---

# 26. DETAIL PAGE

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

# 27. STATUS BADGE

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

# 28. STATUS LANGUAGE

Internal state code:

```text
PENDING_CONFIRMATION
```

UI label:

```text
Awaiting Confirmation
```

Backend code tidak perlu ditampilkan kepada customer.

---

# 29. FORM PRINCIPLE

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

# 30. FORM SECTION

Contoh quotation:

```text
Customer Information

Trip Information

Package & Services

Itinerary

Pricing

Discount

Payment Terms

Validity

Notes

Documents
```

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
- Package

dapat menggunakan autosave draft jika architecture mendukung.

User harus tetap melihat:

```text
Saved
Saving...
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

Quotation harus dapat:

```text
Print
Generate PDF
Send
```

PDF berasal dari backend/document service atau mekanisme resmi yang ditetapkan architecture.

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

Timeline membantu user memahami history.

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

Internal user dapat melihat:

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

# 53. CUSTOMER QUOTATION PAGE

Customer melihat:

```text
Company
Quotation Number
Valid Until
Trip Summary
Services
Itinerary
Price
Terms
Payment Information
```

Action:

```text
Accept
Request Changes
Ask Question
```

---

# 54. CUSTOMER ACCEPTANCE

Acceptance harus jelas.

Contoh:

```text
I have reviewed this quotation and agree to the stated terms.
```

Button:

```text
Accept Quotation
```

Jika acceptance membutuhkan confirmation:

```text
Are you sure you want to accept this quotation?
```

---

# 55. CUSTOMER PAYMENT PAGE

Customer dapat melihat:

```text
Invoice Total
Amount Due
Due Date
Payment Method
Payment Instructions
Upload Proof
```

---

# 56. CUSTOMER ITINERARY PAGE

Harus mobile-first.

Customer kemungkinan melihat itinerary melalui smartphone.

Gunakan:

```text
Day cards
Timeline
Location
Time
Activity
Map/Location link if available
Hotel
Transport
Important notes
```

---

# 57. CUSTOMER DOCUMENT CENTER

Customer dapat melihat:

```text
Quotation
Invoice
Receipt
Itinerary
Booking Confirmation
Other Documents
```

---

# 58. DOCUMENT ACTIONS

Customer dapat:

```text
View
Download
Print
```

Sesuai permission.

---

# 59. CRM UI

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

# 60. CRM TIMELINE

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

# 61. FOLLOW-UP UI

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

# 62. CALENDAR UI

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

# 63. AVAILABILITY CALENDAR

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

# 64. OPERATIONS BOARD

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

# 65. DRAG AND DROP

Drag-and-drop hanya boleh digunakan jika:

- Transition valid
- User memiliki permission
- Backend menerima transition
- Conflict validation berjalan

Frontend tidak boleh mengubah state hanya karena card dipindahkan.

---

# 66. MODAL

Gunakan modal untuk:

- Confirmation
- Short form
- Quick action
- Approval
- Reject reason

Jangan gunakan modal untuk form yang sangat panjang.

---

# 67. DRAWER

Gunakan drawer untuk:

- Quick preview
- Activity
- Related information
- Small edit

---

# 68. CONFIRMATION DIALOG

Action berisiko harus meminta confirmation.

Contoh:

```text
Cancel Booking
Void Invoice
Reject Payment
Approve Refund
Delete Draft
```

---

# 69. DESTRUCTIVE ACTION

Destructive action harus:

- Jelas
- Tidak ambigu
- Meminta confirmation
- Meminta reason jika diperlukan
- Tercatat dalam audit

---

# 70. TOAST / NOTIFICATION

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

# 71. EMPTY STATE

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

# 72. LOADING STATE

Gunakan:

- Skeleton
- Spinner
- Progress indicator

Hindari blank screen.

---

# 73. NETWORK ERROR

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

# 74. ACCESS DENIED

Jika user tidak memiliki permission:

```text
You don't have permission to perform this action.
```

Jangan menampilkan sensitive information.

---

# 75. RESPONSIVE DESIGN

Target:

```text
Mobile
Tablet
Laptop
Desktop
Large Desktop
```

---

# 76. MOBILE-FIRST PRIORITY

Fungsi yang harus nyaman di mobile:

- Customer portal
- Payment proof upload
- Quotation viewing
- Itinerary
- CRM follow-up
- Booking lookup
- Notifications

---

# 77. TOUCH TARGET

Interactive elements harus cukup besar untuk touch.

Hindari button terlalu kecil dan terlalu berdekatan.

---

# 78. ACCESSIBILITY

Frontend harus mempertimbangkan:

- Keyboard navigation
- Focus state
- Semantic HTML
- Screen reader labels
- Contrast
- Error association
- Accessible form labels

---

# 79. COLOR SYSTEM

Color harus memiliki semantic purpose.

Contoh:

```text
Success
Warning
Error
Info
Neutral
```

Jangan menggunakan warna hanya sebagai dekorasi.

---

# 80. ICON SYSTEM

Icon harus konsisten.

Jangan menggunakan emoji sebagai icon utama aplikasi production kecuali memang bagian dari design system.

---

# 81. TYPOGRAPHY

Gunakan typography hierarchy:

```text
Page Title
Section Title
Subsection
Body
Caption
Helper Text
```

Text harus mudah dibaca di mobile.

---

# 82. DESIGN SYSTEM

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
```

---

# 83. BUSINESS COMPONENTS

Selain generic components, buat reusable business components:

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
```

---

# 84. CURRENCY DISPLAY

Currency display harus konsisten.

Contoh:

```text
Rp 5.000.000
```

Formatting mengikuti locale/currency configuration.

Jangan hard-code format di setiap component.

---

# 85. DATE DISPLAY

Internal date/time mengikuti configured timezone.

Customer-facing date menggunakan format yang mudah dipahami.

Contoh:

```text
8 August 2026
```

atau locale yang ditentukan system.

---

# 86. TIMEZONE

Backend menyimpan timestamp dengan standard timezone strategy.

Frontend harus melakukan display conversion sesuai configured business/customer timezone.

Jangan menggunakan browser timezone secara membabi buta untuk operational date.

---

# 87. FILE UPLOAD

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
```

---

# 88. FILE SECURITY

Frontend tidak boleh menganggap file URL sebagai public.

Sensitive document harus menggunakan authorization-aware access.

---

# 89. PRINT VIEW

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

# 90. SEO WEBSITE

Public website harus mendukung:

- Page title
- Meta description
- Canonical URL
- Open Graph
- Structured data jika diperlukan
- Sitemap
- Search engine indexing control

---

# 91. WEBSITE CONTENT MANAGEMENT

Published content dari ERP dapat digunakan website.

Contoh:

```text
Package
Destination
FAQ
Promotion
Article
```

Hanya content:

```text
APPROVED
+
PUBLISHED
```

yang boleh muncul public.

---

# 92. WEBSITE CONTENT PREVIEW

Admin dapat:

```text
Preview
```

sebelum:

```text
Publish
```

Preview tidak otomatis berarti published.

---

# 93. FRONTEND SECURITY

Frontend harus:

- Tidak menyimpan secret
- Tidak mempercayai client-side permission
- Tidak mengirim sensitive data tanpa authorization
- Tidak menampilkan data unauthorized
- Menangani session expiration

---

# 94. AUTHENTICATION UI

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

# 95. SESSION EXPIRATION

Jika session expired:

```text
Your session has expired.
Please sign in again.
```

Draft yang belum tersimpan sebaiknya dipertahankan jika memungkinkan.

---

# 96. PERMISSION-AWARE UI

UI boleh menyembunyikan action yang tidak boleh dilakukan.

Namun:

> Hidden UI bukan security boundary.

Backend tetap wajib memvalidasi permission.

---

# 97. AUDIT UI

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

# 98. ACTIVITY TIMELINE

Activity timeline digunakan pada:

- Lead
- Customer
- Quotation
- Booking
- Invoice
- Payment

---

# 99. RELATED RECORDS

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

---

# 100. QUICK ACTIONS

User dapat melakukan action umum dari detail page.

Contoh Customer:

```text
New Quotation
New Booking
Add Note
Schedule Follow-up
```

---

# 101. BULK ACTION

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
```

hindari bulk action kecuali ada business rule dan confirmation yang kuat.

---

# 102. TABLE EXPORT

Export harus mengikuti permission.

Data export harus:

- Audit
- Filter-aware
- Permission-aware

---

# 103. FILTER PERSISTENCE

System dapat menyimpan filter terakhir per user.

Contoh:

Sales terakhir melihat:

```text
Open Quotations
My Customers
```

---

# 104. USER PREFERENCES

Jika diperlukan:

```text
Language
Timezone
Date format
Table columns
Dashboard widgets
Notification preferences
```

---

# 105. NOTIFICATION CENTER

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
```

---

# 106. CUSTOMER NOTIFICATION

Customer hanya menerima informasi yang relevan.

Contoh:

```text
Your quotation is ready.
Your booking has been confirmed.
Your payment is being verified.
Your itinerary has been updated.
```

---

# 107. FRONTEND STATE MANAGEMENT

Global state hanya digunakan untuk data yang memang membutuhkan shared state.

Jangan menyimpan seluruh database di global client state.

---

# 108. SERVER STATE

Data seperti:

```text
Customers
Bookings
Invoices
Payments
Quotations
```

sebaiknya dianggap server state dan memiliki:

- Loading
- Error
- Cache
- Refresh
- Invalidation

---

# 109. FORM STATE

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

# 110. OPTIMISTIC UI

Optimistic update hanya digunakan untuk action yang aman.

Untuk transaksi finansial:

```text
Payment Verification
Refund
Invoice Issue
```

gunakan confirmation dari backend sebelum UI menganggap sukses.

---

# 111. API ERROR HANDLING

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

# 112. CONFLICT UI

Jika terjadi concurrency conflict:

```text
This record has been changed by another user.
Please refresh and review the latest version.
```

---

# 113. NOT FOUND UI

Jika record tidak ditemukan:

```text
This record may have been deleted, archived, or you may not have access.
```

---

# 114. FRONTEND ROUTING

Route harus mengikuti domain.

Contoh:

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

/reports

/settings
```

---

# 115. CUSTOMER ROUTING

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

# 116. PUBLIC WEBSITE ROUTING

Contoh:

```text
/
/packages
/packages/{slug}
/destinations
/destinations/{slug}
/contact
/about
/faq
```

---

# 117. DEEP LINKING

User harus dapat membuka detail page melalui URL secara aman.

Contoh:

```text
/bookings/B-000123
```

Permission tetap diperiksa server-side.

---

# 118. BREADCRUMB

Contoh:

```text
Bookings / B-000123
```

Untuk nested page:

```text
Bookings / B-000123 / Itinerary
```

---

# 119. BACK NAVIGATION

Browser back button harus bekerja secara wajar.

Jangan merusak browser history dengan routing yang tidak diperlukan.

---

# 120. CONFIRMATION BEFORE STATE CHANGE

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

# 121. STATE-AWARE ACTION BAR

Action bar berubah sesuai state.

Contoh:

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

---

# 122. READ-ONLY MODE

Record menjadi read-only ketika business rule mengharuskan.

Contoh:

```text
Issued Invoice
Verified Payment
Completed Booking
```

Correction dilakukan melalui workflow khusus.

---

# 123. DATA SNAPSHOT UI

Jika booking menggunakan package snapshot, UI harus menunjukkan bahwa data tersebut merupakan snapshot.

Contoh:

```text
Package used for this booking
Snapshot from package version 3
```

---

# 124. CUSTOMER DATA PRIVACY

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

# 125. INTERNAL NOTES

Internal notes harus jelas ditandai:

```text
Internal Only
```

dan tidak boleh muncul pada:

- Customer portal
- Customer PDF
- Public website
- Customer email

---

# 126. CUSTOMER NOTES

Customer-visible notes harus dipisahkan dari internal notes.

---

# 127. DOCUMENT TEMPLATE UI

Admin dapat memilih template jika system mendukung:

```text
Quotation Template
Invoice Template
Itinerary Template
Confirmation Template
```

Template selection tetap mengikuti permission.

---

# 128. FRONTEND PERFORMANCE

Target:

- Fast initial load
- Lazy loading feature modules
- Pagination
- Image optimization
- Efficient API requests
- Caching
- Avoid unnecessary rerender

---

# 129. LARGE DATASETS

Untuk data besar:

Jangan:

```text
Load 100.000 records
```

Gunakan:

```text
Server-side pagination
Filtering
Search
Sorting
```

---

# 130. IMAGE OPTIMIZATION

Public website images harus:

- Responsive
- Optimized
- Lazy-loaded jika sesuai
- Proper dimensions
- Alt text

---

# 131. FORM AUTOCOMPLETE

Customer selection harus menggunakan searchable dropdown.

Contoh:

```text
Search customer...
```

bukan dropdown dengan ribuan customer sekaligus.

---

# 132. CURRENCY INPUT

Currency input harus:

- Format readable
- Prevent invalid characters
- Preserve numeric value
- Display currency
- Validate min/max

---

# 133. DATE PICKER

Date picker harus mencegah invalid date jika business rule melarangnya.

Contoh:

```text
Travel date cannot be earlier than today.
```

---

# 134. TIME PICKER

Time input harus mendukung:

```text
Start Time
End Time
Duration
```

dan conflict detection.

---

# 135. FILE PREVIEW

Untuk payment proof:

```text
Preview
Download
Replace
Remove
```

tetap mengikuti permission dan state.

---

# 136. FRONTEND TESTING

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

# 137. CRITICAL E2E FLOWS

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

---

# 138. SECURITY TESTING

Test:

- Unauthorized route
- Unauthorized action
- IDOR
- File access
- Session expiry
- Permission bypass
- Sensitive data exposure

---

# 139. UX TESTING

Test dengan skenario nyata:

```text
Sales membuat quotation
Customer menerima quotation
Customer upload payment proof
Finance verify payment
Operations menyiapkan trip
Customer melihat itinerary
```

---

# 140. FRONTEND DEVELOPMENT RULE

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
```

---

# 141. SOURCE OF TRUTH

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

UI/UX
→ THIS DOCUMENT
```

---

# 142. FRONTEND MUST NOT INVENT BUSINESS LOGIC

Contoh:

Frontend tidak boleh menentukan sendiri:

```text
Discount > 10% = require approval
```

jika aturan sebenarnya berasal dari backend/business policy.

Frontend hanya:

```text
Display
Validate for UX
Request action
Display result
```

---

# 143. BACKEND IS AUTHORITY

Backend menentukan:

```text
Permission
Business Rule
State Transition
Financial Calculation
Availability
Approval
```

Frontend menampilkan hasilnya.

---

# 144. UI ACCEPTANCE CRITERIA

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

---

# 145. FRONTEND DEFINITION OF DONE

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

---

# 146. FINAL UX PRINCIPLE

System harus membuat user berpikir:

> "Saya tahu apa yang harus saya lakukan berikutnya."

bukan:

> "Saya harus mencari-cari tombolnya."

---

# 147. FINAL FRONTEND PRINCIPLE

Frontend Batam Travelling ERP harus menjadi:

```text
Simple for the User
Powerful for the Business
Strict for the System
Clear for the Customer
Safe for Finance
Flexible for Operations
Traceable for Management
```

---

# 148. NEXT DOCUMENT

Dokumen berikutnya:

```text
10_API_AND_INTEGRATION_SPECIFICATION.md
```

Dokumen tersebut akan mendefinisikan:

- API architecture
- Endpoint
- Request/response
- Authentication
- Authorization
- Webhook
- Email
- WhatsApp
- Payment integration
- File storage
- Website integration
- CRM integration
- External services
- Error handling
- API security
- Integration event

---

# END OF DOCUMENT