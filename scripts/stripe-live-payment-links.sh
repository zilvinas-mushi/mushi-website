#!/usr/bin/env bash
# Creates the three LIVE Stripe Payment Links — one per plan in
# src/lib/pricing.ts — and prints their URLs. Run by a person, once:
#
#   bash scripts/stripe-live-payment-links.sh
#
# A Payment Link takes real money from anyone who has its URL, so this is the
# moment checkout goes live. It refuses to run if managed links already exist.
# The test-mode links were created the same way, with the test price ids.
set -euo pipefail

ACCOUNT="acct_1Q7Da8026uErRlIm"
REDIRECT='https://mushi.agency/thank-you?session_id={CHECKOUT_SESSION_ID}'

unset STRIPE_API_KEY
stripe switch "$ACCOUNT" --live >/dev/null
trap 'stripe switch "$ACCOUNT" >/dev/null 2>&1 || echo "Run: stripe switch $ACCOUNT"' EXIT

existing=$(stripe payment_links list --live -d limit=100 | grep -c '"managed_by": "mushi-website"' || true)
if [ "$existing" != "0" ]; then
  echo "There are already $existing managed live payment links. Nothing created."
  stripe payment_links list --live -d limit=100 | grep -E '"url"|"plan_id"|"active"'
  exit 1
fi

create() { # plan-id  live-price-id
  echo "--- $1"
  stripe payment_links create --live -c \
    -d "line_items[0][price]=$2" \
    -d "line_items[0][quantity]=1" \
    -d "after_completion[type]=redirect" \
    -d "after_completion[redirect][url]=$REDIRECT" \
    -d "metadata[plan_id]=$1" \
    -d "metadata[managed_by]=mushi-website" \
    -d "subscription_data[metadata][plan_id]=$1" | grep -E '"(id|url|active|livemode)"'
}

create 1-month   price_1UMquC026uErRlImaR19zZMN
create 3-months  price_1UMquE026uErRlImsm3lfWGn
create 12-months price_1UMquG026uErRlIm5Kd2fNW6
