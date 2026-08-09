# RBAC Permission Matrix

**Convention:** permissions use `resource.action`; deny by default; every action remains tenant-scoped.

| Role | Core permissions | Restrictions |
|---|---|---|
| Platform Super Admin | `tenant.*`, `platform.*`, audited support read | Cross-tenant access requires reason and audit log |
| Tenant Owner | tenant, user, report, settings management | Cannot bypass financial approvals |
| Manager | CRM, quotation, booking, operations, reporting approval | No platform billing administration |
| Sales | lead/customer CRUD, quotation draft/send, booking draft | Cannot verify payment or refund |
| Finance | invoice/payment read, payment verify, refund review | Refund execution needs approval |
| Operations | booking read, vendor/schedule/assignment/trip update | Cannot change settled finance records |
| Content Editor | package/article/landing-page workflow | Cannot change pricing or customer data |
| Customer | Own quotation, booking, invoice, document, payment | Own records only |

## Minimum catalog

`lead.{create,read,update,assign,convert}`; `customer.{read,update}`; `quotation.{create,read,update,send,approve,cancel}`; `booking.{create,read,update,confirm,cancel}`; `invoice.{create,read,issue,void}`; `payment.{create,read,verify,refund_request,refund_approve}`; `vendor.{create,read,update}`; `trip.{read,update,assign}`; `content.{create,read,update,submit,publish,archive}`; `report.read`; `user.manage`; `settings.manage`; `audit.read`.

Price override, payment verification, refund approval, void invoice, and privileged impersonation require an approval/audit event. Implement this as seed data and automated authorization tests, not frontend visibility only.
