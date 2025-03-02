const express = require('express');
const path = require('path'); // Import the path module
const app = express();
const stripe = require('stripe')('sk_test_51QyALhGbA3It0H3gpy1h0qgaUTR4Lffg87UfXP0PFv1hfEI3Q589j3WYlvUYEs5HOFoBWb3FmB8iWEtLCeOkgoDN007cWTIfWh');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://vtejldsdbutlyaorivaa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0ZWpsZHNkYnV0bHlhb3JpdmFhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDQ2NTAzOCwiZXhwIjoyMDU2MDQxMDM4fQ.5IYz3TxHEVMw3n4OHUy1vbsI0JMorBxDas-KCDC_1-U';
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(express.json()); // To parse JSON request bodies
app.use(express.static(path.join(__dirname))); // Serve static files

// Create a checkout session route
app.post('/create-checkout-session', async (req, res) => {
    const { items } = req.body;

    try {
        const session = await stripe.checkout.sessions.create({
            line_items: items.map(item => ({
                price_data: {
                    currency: 'usd',
                    product_data: { name: item.name },
                    unit_amount: item.price * 100,
                },
                quantity: 1,
            })),
            mode: 'payment',
            success_url: 'https://bug-free-capybara-rvvpvrvggw9hj9v-3000.app.github.dev/',
            cancel_url: 'https://bug-free-capybara-rvvpvrvggw9hj9v-3000.app.github.dev/',
        });

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

        await stripe.checkout.sessions.update(session.id, {
            metadata: { order_id: order[0].id },
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        return res.status(500).json({ error: 'Failed to create checkout session' });
    }
});

// Webhook endpoint
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const payload = req.body;
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(payload, sig, 'whsec_ZjwpFOI3WtXI09N8yDm20zQEPHkCcjBe');
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const orderId = session.metadata.order_id;

        try {
            const { error: paymentError } = await supabase
                .from('payments')
                .insert([{
                    order_id: orderId,
                    amount: session.amount_total,
                    currency: session.currency,
                    payment_method: session.payment_method_types[0],
                    status: 'succeeded',
                }]);

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

// Serve index.html for the root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`));