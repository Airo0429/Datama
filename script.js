const supabaseUrl = 'https://vtejldsdbutlyaorivaa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0ZWpsZHNkYnV0bHlhb3JpdmFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0NjUwMzgsImV4cCI6MjA1NjA0MTAzOH0.TjP22TydWtdALDtrKJeYrBfwpbvdtkzeh0iV615wVG4';
const supabase = supabase.createClient(supabaseUrl, supabaseAnonKey);

console.log("Supabase Client:", supabase); // Check if Supabase client is created

const products = [
    {
        id: 1,
        name: "Stussy Product 1",
        price: 50,
        imageUrl: "https://www.stussy.com/cdn/shop/files/1905077_BLAC_2.jpg?v=1739819686&width=480"
    },
    {
        id: 2,
        name: "Stussy Product 2",
        price: 55,
        imageUrl: "https://www.stussy.com/cdn/shop/files/1905077_NATL_2_d124fbbe-4c1a-4160-b36f-40e6229b83f2.jpg?v=1739819682&width=480"
    },
    {
        id: 3,
        name: "Stussy Product 3",
        price: 45,
        imageUrl: "https://www.stussy.com/cdn/shop/files/1905077_GRPE_2_17cd6dcc-4f0e-49df-87ef-1f620fe001ab.jpg?v=1739819668&width=480"
    },
    {
        id: 4,
        name: "Stussy Product 4",
        price: 60,
        imageUrl: "https://www.stussy.com/cdn/shop/files/1905077_YELO_2.jpg?v=1739819673&width=480"
    },
    {
        id: 5,
        name: "Stussy Product 5",
        price: 70,
        imageUrl: "https://www.stussy.com/cdn/shop/files/1905077_NAVY_2_0c2ba580-5925-44de-bdf0-8805ea07fc0e.jpg?v=1739819678&width=480"
    }
];

const productsDiv = document.getElementById("products");

products.forEach(product => {
    const productDiv = document.createElement("div");
    productDiv.classList.add("product");
    productDiv.innerHTML = `
        <img src="${product.imageUrl}" alt="${product.name}" width="150">
        <h3>${product.name}</h3>
        <p>$${product.price}</p>
        <button onclick="addToCart(${product.id})">Add to Cart</button>
    `;
    productsDiv.appendChild(productDiv);
});

let cart = [];

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        cart.push(product);
        updateCartDisplay();
    }
}

function updateCartDisplay() {
    const cartItemsList = document.getElementById("cart-items");
    const cartTotalSpan = document.getElementById("cart-total");
    cartItemsList.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
        const li = document.createElement("li");
        li.textContent = `${item.name} - $${item.price}`;
        cartItemsList.appendChild(li);
        total += item.price;
    });

    cartTotalSpan.textContent = total;
}

const checkoutButton = document.getElementById("checkout");
checkoutButton.addEventListener("click", simulateCheckout);

async function simulateCheckout() {
    try {
        const orderData = cart.map(item => ({
            productId: item.id,
            productName: item.name,
            price: item.price
        }));

        console.log("Order Data:", orderData); // Check order data before Supabase insert

        const { error } = await supabase
            .from('orders')
            .insert(orderData);

        if (error) {
            console.error("Error saving order:", error);
            alert("Checkout failed.");
        } else {
            console.log("Checkout successful!");
            alert("Checkout successful!");
            cart = [];
            updateCartDisplay();
        }
    } catch (error) {
        console.error("Error in simulateCheckout:", error);
        alert("Checkout failed due to an unexpected error.");
    }
}