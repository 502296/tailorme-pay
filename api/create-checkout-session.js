import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);



export default async function handler(req, res) {

  res.setHeader("Content-Type", "application/json");



  if (req.method !== "POST") {

    res.setHeader("Allow", "POST");

    return res.status(405).end(JSON.stringify({ error: "Method not allowed" }));

  }



  try {

    const { amountUsd, description, customerEmail } = req.body || {};



    if (!amountUsd || Number(amountUsd) <= 0) {

      return res.status(400).end(JSON.stringify({ error: "amountUsd must be > 0" }));

    }



    const session = await stripe.checkout.sessions.create({

      mode: "payment",

      payment_method_types: ["card"],

      line_items: [{

        price_data: {

          currency: "usd",

          product_data: { name: description || "TailorMe Payment" },

          unit_amount: Math.round(Number(amountUsd) * 100)

        },

        quantity: 1

      }],

      customer_email: customerEmail || undefined,

      success_url: "https://tailorme.me/thank-you?session_id={CHECKOUT_SESSION_ID}",

      cancel_url: "https://tailorme.me/payment-canceled",

      payment_intent_data: { receipt_email: customerEmail || undefined }

    });



    return res.status(200).end(JSON.stringify({ url: session.url }));

  } catch (err) {

    console.error(err);

    return res.status(500).end(JSON.stringify({ error: "Failed to create session" }));

  }

}
