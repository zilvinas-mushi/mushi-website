"use client";

import { useEffect } from "react";
import { trackPurchase } from "@/lib/meta-pixel";

/**
 * The Purchase event's browser half, from the session id in the address.
 * It grants nothing and reads nothing of Stripe's (CLAUDE.md: /thank-you
 * grants nothing); the webhook sends the same event with the same id.
 */
export function PurchasePixel() {
  useEffect(() => {
    trackPurchase();
  }, []);
  return null;
}
