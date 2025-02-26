const products = [
    { id: 1, name: "Product 1", price: 25, imageUrl: "product1.jpg" }, // Replace with your image URLs
    { id: 2, name: "Product 2", price: 30, imageUrl: "product2.jpg" },
    { id: 3, name: "Product 3", price: 20, imageUrl: "product3.jpg" },
    { id: 4, name: "Product 4", price: 35, imageUrl: "product4.jpg" },
    { id: 5, name: "Product 5", price: 40, imageUrl: "product5.jpg" }
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
    const supabaseUrl = 'YOUR_SUPABASE_URL'; // REPLACE WITH YOUR SUPABASE URL
    const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'; // REPLACE WITH YOUR SUPABASE ANON KEY
    const supabase = supabase.createClient(supabaseUrl, supabaseAnonKey);

    const orderData = cart.map(item => ({
        productId: item.id,
        productName: item.name,
        price: item.price
    }));

    const { error } = await supabase
        .from('orders')
        .insert(orderData);

    if (error) {
        console.error("Error saving order:", error);
        alert("Checkout failed.");
    } else {
        alert("Checkout successful!");
        cart = [];
        updateCartDisplay();
    }
}