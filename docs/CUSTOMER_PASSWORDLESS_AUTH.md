# Customer passwordless authentication contract

Customer authentication is isolated from employee/Supabase ERP authentication. A customer cookie never carries ERP roles or permissions.

## Provider boundary

- `CUSTOMER_AUTH_PROVIDER=local` is accepted only outside production.
- `CUSTOMER_AUTH_PROVIDER=supabase` selects the production adapter boundary. The adapter fails closed until Supabase OTP delivery is configured.
- `CUSTOMER_AUTH_EXPOSE_LOCAL_OTP=true` may expose the generated OTP only outside production for automated local testing.
- No production fallback to the local provider exists.

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/v1/customer-auth/register/request-otp` | Normalize and validate name, email, WhatsApp, and terms consent; request registration OTP |
| POST | `/api/v1/customer-auth/login/request-otp` | Request login OTP with an enumeration-resistant response |
| POST | `/api/v1/customer-auth/verify-otp` | Consume a six-digit OTP and create an HTTP-only customer session |
| GET | `/api/v1/customer-auth/session` | Resolve the current verified customer identity from the cookie |
| POST | `/api/v1/customer-auth/logout` | Revoke the server session and expire the cookie |
| POST | `/api/v1/customer-auth/claim-booking` | Verify a legacy booking against the session customer plus matching booking email and WhatsApp |
| GET | `/api/v1/customer-auth/bookings` | List bookings scoped by server-resolved tenant and customer identity |

The `bt_customer_session` cookie is HTTP-only, SameSite=Lax, valid for 30 days, and Secure in production. Only a SHA-256 token hash is stored. OTP hashes are short-lived, one-time, and limited to five verification attempts.

## Security invariants

- Email is trimmed and lower-cased; Indonesian WhatsApp numbers are stored as `62…`.
- OTP request responses do not disclose account existence.
- Booking queries always include both the public tenant and verified account customer ID.
- Legacy claims create a tenant-scoped `CustomerBookingClaim`; they never reassign the booking, invoice, payment, or CRM customer.
- Repeating a valid claim is idempotent and produces only one account-to-booking link.
- Customer credentials/tokens are never stored in localStorage or sessionStorage.
- Existing `CustomerAccount` and `CustomerSession` tables are reused; migration `20260813210000_customer_booking_claims` adds only the non-destructive booking-link table.
