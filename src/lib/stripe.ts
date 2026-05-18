import { loadStripe } from '@stripe/stripe-js'

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
const proPriceId = import.meta.env.VITE_STRIPE_PRO_PRICE_ID
const appUrl = import.meta.env.VITE_APP_URL || window.location.origin

if (!stripePublishableKey) {
  console.warn('Missing Stripe publishable key. Payments will not work.')
}

export const stripePromise = loadStripe(stripePublishableKey || '')

// ─── Checkout ─────────────────────────────────────────────────────────────────

/**
 * Redirects to Stripe Checkout for the Pro monthly subscription.
 *
 * In production you should create the Checkout Session on your backend
 * (Supabase Edge Function) and return the URL — this keeps your price IDs
 * and customer metadata server-side.
 *
 * The example below uses Stripe's client-only Checkout which is simpler
 * for prototyping but has limitations (no customer pre-fill, no metadata).
 */
export async function redirectToCheckout(userEmail?: string) {
  const stripe = await stripePromise
  if (!stripe) throw new Error('Stripe failed to initialize')

  const { error } = await stripe.redirectToCheckout({
    lineItems: [{ price: proPriceId, quantity: 1 }],
    mode: 'subscription',
    successUrl: `${appUrl}/dashboard?upgrade=success`,
    cancelUrl: `${appUrl}/dashboard?upgrade=canceled`,
    customerEmail: userEmail,
    // 7-day free trial is configured on the Price in Stripe Dashboard
    // under "Add free trial" — no code needed
  })

  if (error) throw error
}

// ─── Customer Portal ──────────────────────────────────────────────────────────

/**
 * Redirects to the Stripe Customer Portal for subscription management.
 * Requires a Supabase Edge Function (or other backend) to create the
 * portal session with the customer ID.
 *
 * See: supabase/functions/stripe-portal/index.ts
 */
export async function redirectToCustomerPortal(customerId: string) {
  // Call your backend to create a portal session
  const response = await fetch(`${appUrl}/api/stripe/portal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customerId }),
  })

  const { url } = await response.json()
  window.location.href = url
}
