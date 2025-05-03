$(document).ready(function(){
    var selectedCurrency
    var cartItems = [];
    var currencySymbols = {
        usd: '$',
        eur: '€',
        aed: 'AED',
        cny: '¥',
        gbp: '£',
    };
    fillProducts();
    function fillProducts() {
        if (typeof (Storage) !== "undefined") {
            // Retrieve cartItems from sessionStorage
            cartItems = JSON.parse(sessionStorage.getItem("cartItems"));
            selectedCurrency = sessionStorage.getItem("selectedCurrency");

            // Get the cart items container
            const cartItemsContainer = $('#cart-items');

            // Initialize total price
            let totalPrice = 0;

            // Loop through cartItems and display each product
            if (cartItems) {
                cartItems.forEach(function (cartItem) {
                    const productItem = $('<div class="cart-item"></div>');

                    productItem.html(`
                <img src="${cartItem.image}" alt="${cartItem.name}">
                <div class="item-details">
                    <h3>${cartItem.name}</h3>
                    <p class="product-price">Price: <span class="selectedCurrency">`+ currencySymbols[selectedCurrency] + `</span>${cartItem.price}</p>
                    <p>Quantity: ${cartItem.count}</p>
                  
                </div>
            `);


                    cartItemsContainer.append(productItem);


                    // Calculate and update the total price
                
                });
            }
            else {
                const productItem = $('.cart-item');
                productItem.replaceWith('<div class="cart-item"></div>');
            }

            // Display the total price
           
        } else {
            // If sessionStorage is not available, you can handle it here
            console.error("Session storage is not supported in this browser.");
        }
    }





});