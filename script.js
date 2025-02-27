const supabaseUrl = 'https://vtejldsdbutlyaorivaa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0ZWpsZHNkYnV0bHlhb3JpdmFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0NjUwMzgsImV4cCI6MjA1NjA0MTAzOH0.TjP22TydWtdALDtrKJeYrBfwpbvdtkzeh0iV615wVG4';
const supabase = supabase.createClient(supabaseUrl, supabaseAnonKey); // CORRECT: Initialized at the TOP of the script

const products = [
    // ... your products array
];

const productsDiv = document.getElementById("products");

products.forEach(product => {
    // ... display products
});

let cart = [];

function addToCart(productId) {
    // ... add to cart
}

function updateCartDisplay() {
    // ... update cart display
}

const checkoutButton = document.getElementById("checkout");
checkoutButton.addEventListener("click", simulateCheckout);

async function simulateCheckout() {
    try {
        // ... rest of the code using the initialized supabase client
    } catch (error) {
        // ... error handling
    }
}