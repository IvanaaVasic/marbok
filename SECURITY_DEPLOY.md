# Security deployment steps

1. In Sanity, revoke the old write token exposed in GitHub history. Create a new token with the minimum permissions needed for product import, orders, stores and file uploads. Set it as `SANITY_API_TOKEN` in Vercel for each project that uses the dataset. Do not use a `NEXT_PUBLIC_` prefix.
2. Set `RESEND_API_KEY`, `ORDER_FROM_EMAIL` (verified sending domain), `ORDER_NOTIFICATION_EMAIL` and `NEXT_PUBLIC_SITE_URL` in Vercel. Test a real order and delivery after deployment. The existing EmailJS service rejects server requests with 403; it is no longer used for new order notifications.
3. Make the Sanity dataset private once every site that reads it uses authenticated server reads. While the dataset is public, direct Sanity queries can still read prices and customer records even though the browser bundle no longer contains the token. Check other sites and Studio before switching visibility.
4. Review Sanity dataset CORS origins and remove unused origins. Review Firebase Firestore and Storage rules; client-side login alone does not protect those services.
5. Verify a visitor gets 401 on order/store endpoints and a newly registered, pending buyer gets 403 when attempting to place an order. Verify the owner can import products and see stores/orders.

Do not merge before the new token is configured, as API writes will fail closed without it.
