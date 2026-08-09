# BATAM TRAVELLING ERP
## PROJECT INSTRUCTIONS

### 1. PROJECT IDENTITY

You are working on the development of an integrated ERP and Travel Management System for **Batam Travelling**.

This is not merely a company profile website.

The project is intended to become an integrated business platform covering:

- CRM
- Sales
- Lead Management
- Product & Package Management
- Website Booking
- POS
- Quotation
- Order Management
- Booking Management
- Invoice
- Payment
- Receipt
- Vendor Management
- Operational Management
- Trip Management
- Itinerary
- Departure Schedule
- Employee Assignment
- Planner
- Task Management
- Workflow
- Project Management
- Finance
- Commission
- Dashboard
- Employee Management
- Reporting

The system must be designed as one integrated business system rather than a collection of disconnected applications.

---

# 2. PRIMARY OBJECTIVE

The primary objective is to build a professional, practical, scalable, maintainable, and integrated Travel ERP for Batam Travelling.

The system should support the complete business lifecycle:

```text
Marketing
↓
Lead
↓
CRM
↓
Sales
↓
Quotation
↓
Order
↓
Booking
↓
Payment
↓
Operational Planning
↓
Vendor
↓
Assignment
↓
Trip
↓
Trip Completion
↓
Finance
↓
Profit
↓
Customer Feedback
↓
Repeat Customer
```

The system must prioritize real business operations and usability.

---

# 3. SOURCE OF TRUTH

Project Knowledge is the primary source of business information.

Always read and consider relevant Knowledge documents before designing processes, modules, database structures, UI, workflows, or code.

Do not contradict approved project documents.

The expected document hierarchy is:

```text
00_PROJECT_INSTRUCTIONS.md
01_BUSINESS_FOUNDATION.md
02_BUSINESS_PROCESS_AND_SOP.md
03_BUSINESS_RULES_AND_POLICY.md
04_PRD_SYSTEM_REQUIREMENTS.md
05_MODULE_SPECIFICATIONS.md
06_ROLES_AND_PERMISSIONS.md
07_DATA_MODEL.md
08_UI_UX_SPECIFICATION.md
09_WORKFLOW_SPECIFICATION.md
10_DEVELOPMENT_ROADMAP.md
11_TESTING_QA.md
12_DEPLOYMENT_INSTALLATION.md
```

Documents with higher numbers must follow and build upon the decisions established in earlier documents.

If two documents conflict, do not silently choose one.

Clearly identify the conflict and request a business decision.

---

# 4. DO NOT INVENT BUSINESS RULES

Never invent important business rules.

Examples include:

- Minimum DP
- Payment deadline
- Cancellation policy
- Refund percentage
- Reschedule policy
- Discount authority
- Commission calculation
- Tax treatment
- Vendor payment terms
- Customer credit terms
- Approval hierarchy
- Pricing rules
- Availability rules
- Booking confirmation requirements

If a rule has not been decided, label it:

**BUSINESS DECISION REQUIRED**

You may propose reasonable options, but clearly distinguish proposals from approved decisions.

Never present an assumption as an approved business rule.

---

# 5. BUSINESS-FIRST DEVELOPMENT

Always prioritize:

```text
Business
↓
Business Process
↓
Business Rules
↓
Requirements
↓
Module Design
↓
Data Model
↓
UI/UX
↓
Workflow
↓
Implementation
↓
Testing
↓
Deployment
```

Do not rush directly into coding.

If a requirement is incomplete, identify the missing requirement before implementing a major feature.

Minor implementation assumptions are acceptable only when they do not change business behavior.

---

# 6. MODULAR SYSTEM PRINCIPLE

The ERP must be modular.

Each module must have clear:

- Purpose
- Responsibility
- Data
- User roles
- Permissions
- Workflow
- Status
- Inputs
- Outputs
- Business rules
- Exceptions
- Relationships with other modules
- Reporting requirements
- Audit requirements

Avoid unnecessary complexity.

Do not create a feature merely because it is technically possible.

Every feature should have a clear business purpose.

---

# 7. CUSTOMER-CENTRIC ARCHITECTURE

The customer is the center of the commercial process.

A customer may have:

```text
Lead
↓
Communication
↓
Quotation
↓
Order
↓
Booking
↓
Invoice
↓
Payment
↓
Trip
↓
Feedback
```

All important customer activities must remain traceable through the Customer Record.

Avoid duplicate customer records.

The system should support customer history and repeat customers.

---

# 8. OMNICHANNEL PRINCIPLE

Customers may arrive through:

- Website
- WhatsApp
- Instagram
- Facebook
- TikTok
- Phone
- Walk-in
- Sales
- Referral
- Reseller
- Advertising
- Repeat Customer

All channels should ultimately use the same underlying business data.

Do not create isolated customer or booking databases for different channels.

The following should remain integrated:

```text
Website
POS
Sales
CRM
Booking
Operational
Finance
```

---

# 9. PRODUCT & PACKAGE PRINCIPLE

Travel packages are not simple products.

A Package may contain:

- Product information
- Description
- Images
- Pricing
- Cost
- Availability
- Itinerary
- Hotel
- Ferry
- Transport
- Guide
- Driver
- Activity
- Meals
- Documentation
- Add-ons
- Terms & Conditions

Packages should be manageable from the Back Office.

Package information should be reusable by:

- Website
- Online Booking
- POS
- Quotation
- Itinerary
- Voucher
- Customer communication
- Other relevant documents

Avoid unnecessary duplicate data entry.

---

# 10. SINGLE SOURCE OF PRODUCT CONTENT

Package content should be created and maintained from one central source.

For example:

```text
Back Office Package
        ↓
 ┌──────┼────────┐
 ↓      ↓        ↓
Website POS   Quotation
 ↓      ↓        ↓
Booking Documents
```

If package information changes, the system should use the appropriate current version according to publication and business rules.

Do not require staff to manually recreate the same package information in multiple systems.

---

# 11. AVAILABILITY PRINCIPLE

Travel availability may depend on more than a simple product quantity.

Consider relevant resources such as:

- Date
- Pax
- Hotel
- Ferry
- Vehicle
- Guide
- Driver
- Activity
- Vendor
- Operational capacity

The system should prevent or warn about conflicts and unavailable resources according to approved business rules.

Do not assume all travel products use the same availability model.

---

# 12. DOCUMENT AUTOMATION

The system should support automatic generation of business documents from transaction data.

Potential documents include:

- Quotation
- Invoice
- Receipt
- Booking Confirmation
- Itinerary
- Voucher
- Manifest
- Purchase Order
- Vendor documents
- Trip Report

Documents should use system data instead of requiring staff to manually retype information.

Documents should be capable of being:

- Previewed
- Printed
- Generated as PDF
- Sent to customers
- Stored in the related CRM or transaction history

---

# 13. CRM DOCUMENT HISTORY

Important customer documents and transactions must remain connected.

Example:

```text
Customer
│
├── Quotations
├── Orders
├── Bookings
├── Invoices
├── Payments
├── Receipts
├── Trips
├── Communications
└── Feedback
```

Staff should be able to understand the customer relationship from a centralized record.

---

# 14. OPERATIONAL PRINCIPLE

A confirmed booking may create operational requirements.

Example:

```text
Booking
↓
Operational Requirements
↓
Hotel
Ferry
Transport
Guide
Driver
Activity
Documentation
↓
Planning
↓
Assignment
↓
Trip
```

Operational requirements must be traceable back to the booking or project that created them.

---

# 15. ASSIGNMENT & PLANNER

The system must support scheduling and assignment of employees and resources.

Possible assignments:

- Guide
- Driver
- Photographer
- Videographer
- Operations staff
- Sales support
- Other employees

The system should check availability and warn about scheduling conflicts.

Planner should provide visibility into:

- Trips
- Departures
- Employees
- Assignments
- Tasks
- Projects
- Deadlines
- Other important schedules

---

# 16. FINANCIAL TRACEABILITY

Revenue and cost must remain connected to their originating business transactions.

Example:

```text
Booking
↓
Revenue
↓
Customer Payment

Booking
↓
Vendor Requirement
↓
Vendor Cost

Booking
↓
Operational Expense
↓
Profit
```

The system should eventually support profitability analysis by relevant dimensions such as:

- Booking
- Trip
- Package
- Product
- Project
- Customer
- Sales
- Period

Do not finalize accounting rules without approved business requirements.

---

# 17. ROLE & PERMISSION PRINCIPLE

The system must distinguish between:

- Owner
- Manager
- Sales
- Customer Service
- Operations
- Finance
- Marketing
- Guide
- Driver
- Other employees

Actual roles and permissions must be defined in the dedicated Roles & Permissions document.

Do not assume that every employee can view or modify every record.

Sensitive actions should support appropriate authorization and approval.

---

# 18. APPROVAL PRINCIPLE

Potential approval-controlled actions include:

- Large discounts
- Refunds
- Cancellations
- Special pricing
- Vendor purchases
- Expenses
- Commission
- Project budgets
- Financial adjustments

Approval levels must follow approved business rules.

Never hard-code an approval hierarchy without confirmation.

---

# 19. AUDITABILITY

Important changes should be traceable.

Where appropriate, record:

- Who performed the action
- When it happened
- What was changed
- Previous value
- New value
- Related transaction

Do not silently overwrite important financial or operational history.

---

# 20. ERROR & EXCEPTION HANDLING

The system must consider real-world exceptions.

Examples:

- Hotel unavailable
- Ferry unavailable
- Vendor cancellation
- Employee unavailable
- Schedule conflict
- Customer cancellation
- Customer reschedule
- Payment failure
- Refund
- Trip changes
- Operational problems

Do not design only the happy path.

---

# 21. NO AI IN CORE SYSTEM FOR INITIAL PHASE

AI is intentionally excluded from the initial core ERP scope.

Do not introduce AI features into the core architecture unless explicitly requested later.

The initial system should focus on:

- Correct business process
- Reliable data
- Clear workflow
- Usability
- Security
- Maintainability
- Performance
- Operational reliability

---

# 22. TECHNOLOGY DECISIONS

Do not prematurely lock the project into a technology stack.

Technology choices must consider:

- Business requirements
- Security
- Scalability
- Performance
- Maintenance
- Development complexity
- Hosting requirements
- Cost
- Deployment practicality

The user is familiar with traditional web hosting and cPanel.

Therefore, deployment options should consider practical hosting environments, including shared hosting or VPS where appropriate.

However, do not sacrifice the system architecture merely to force compatibility with a limited hosting environment.

Technology decisions must be documented separately before implementation.

---

# 23. CODING PRINCIPLES

When coding begins:

- Use modular architecture.
- Avoid unnecessary duplication.
- Keep code maintainable.
- Use clear naming.
- Validate user input.
- Implement appropriate authorization.
- Implement error handling.
- Protect sensitive data.
- Maintain data integrity.
- Consider audit trails.
- Avoid hard-coded business rules when those rules should be configurable.
- Avoid unnecessary dependencies.
- Keep future development in mind.

Do not generate a massive application in one uncontrolled step.

Develop module by module.

---

# 24. CODE DELIVERY PRINCIPLE

Whenever code is generated, clearly identify:

- What the code does
- Which module it belongs to
- Files created
- Files modified
- Dependencies
- Configuration required
- Database changes
- Installation steps
- Testing steps
- Known limitations

Code should be organized so another developer can understand and continue the project.

---

# 25. FILE & DOCUMENT NAMING

Use consistent numbered document names.

```text
00_PROJECT_INSTRUCTIONS.md
01_BUSINESS_FOUNDATION.md
02_BUSINESS_PROCESS_AND_SOP.md
03_BUSINESS_RULES_AND_POLICY.md
04_PRD_SYSTEM_REQUIREMENTS.md
05_MODULE_SPECIFICATIONS.md
06_ROLES_AND_PERMISSIONS.md
07_DATA_MODEL.md
08_UI_UX_SPECIFICATION.md
09_WORKFLOW_SPECIFICATION.md
10_DEVELOPMENT_ROADMAP.md
11_TESTING_QA.md
12_DEPLOYMENT_INSTALLATION.md
```

Do not create alternative names for the same official document without reason.

---

# 26. DOCUMENT CONTROL

When a document is revised:

- Preserve the document number.
- Update the version.
- Clearly describe important changes.
- Do not silently change previously approved business decisions.
- Identify conflicts with other documents.

Example:

```text
Version 1.0
Initial approved foundation

Version 1.1
Added package availability rules

Version 1.2
Updated quotation workflow
```

---

# 27. COMMUNICATION STYLE

Use Bahasa Indonesia for business explanations, requirements, SOP, and user-facing descriptions.

Technical terms may remain in English when they are standard industry terminology.

Be clear and practical.

Avoid unnecessarily complicated explanations.

When there are several possible approaches, explain the differences and recommend one.

---

# 28. WHEN REQUIREMENTS ARE UNCLEAR

Do not immediately implement a major feature if an important business requirement is unclear.

Instead:

1. Identify the missing decision.
2. Explain why it matters.
3. Offer practical options if useful.
4. Ask for the required business decision.
5. Update the appropriate document after the decision.

Use:

**BUSINESS DECISION REQUIRED**

for unresolved business rules.

---

# 29. PROJECT DEVELOPMENT METHOD

Work incrementally.

Preferred approach:

```text
Foundation
↓
Business Process
↓
Business Rules
↓
PRD
↓
Module Specification
↓
Roles & Permissions
↓
Data Model
↓
UI/UX
↓
Workflow
↓
Development
↓
Testing
↓
Deployment
```

Do not skip foundational documents simply because coding appears faster.

The objective is to build a system that can be maintained and expanded over time.

---

# 30. FINAL PRINCIPLE

The goal is not to build the largest possible ERP.

The goal is to build the **right ERP for Batam Travelling**.

Prioritize:

**Simple where possible.**

**Complete where necessary.**

**Integrated by design.**

**Modular for future growth.**

**Practical for staff.**

**Clear for management.**

**Easy for customers.**

**Reliable for operations and finance.**

Always protect the integrity of the business process before adding technical complexity.