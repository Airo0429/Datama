const express = require('express');
const app = express();
const stripe = require('stripe')('sk_test_51QyALhGbA3It0H3gpy1h0qgaUTR4Lffg87UfXP0PFv1hfEI3Q589j3WYlvUYEs5HOFoBWb3FmB8iWEtLCeOkgoDN007cWTIfWh'); // Your actual secret key
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://vtejldsdbutlyaorivaa.supabase.co'; // Your Supabase URL
const supabaseKey = 'YOUR_SUPABASE_SERVICE_ROLE_KEY'; // Replace with your Supabase service role key
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(express.json()); // To parse JSON request bodies

// Create a checkout session route
app.post('/create-checkout-session', async (req, res) => {
  const { items } = req.body; // Assuming the client sends an array of items

  try {
    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      line_items: items.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
          },
          unit_amount: item.price * 100, // Amount in cents
        },
        quantity: 1,
      })),
      mode: 'payment',
      success_url: 'https://your-website.com/success', // Replace with your actual success URL
      cancel_url: 'https://your-website.com/cancel', // Replace with your actual cancel URL
    });

    // Insert the order into Supabase
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(items.map(item => ({
        productid: item.id,
        productname: item.name,
        price: item.price,
      })));

    if (orderError) {
      console.error('Error inserting order into Supabase:', orderError);
      return res.status(500).json({ error: 'Failed to create order' });
    }

    // Store the order ID in the session metadata
    await stripe.checkout.sessions.update(session.id, {
      metadata: {
        order_id: order[0].id, // Assuming order[0] contains the inserted order
      },
    });

    res.json({ url: session.url }); // Send the checkout URL to the client
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Webhook endpoint to handle payment events
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const payload = req.body;
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, 'whsec_ZjwpFOI3WtXI09N8yDm20zQEPHkCcjBe'); // Replace with your actual webhook secret
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Retrieve the order ID from the session metadata
    const orderId = session.metadata.order_id;

    try {
      // Insert payment data into Supabase
      const { error: paymentError } = await supabase
        .from('payments')
        .insert([
          {
            order_id: orderId,
            amount: session.amount_total,
            currency: session.currency,
            payment_method: session.payment_method_types[0],
            status: 'succeeded', // or 'failed' based on the session status
          }
        ]);

      if (paymentError) {
        console.error('Error inserting payment into Supabase:', paymentError);
      } else {
        console.log('Payment inserted into Supabase successfully!');
      }
    } catch (error) {
      console.error('Error handling webhook event:', error);
    }
  }

  res.status(200).end();
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`));