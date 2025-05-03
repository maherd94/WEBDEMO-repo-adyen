$(document).ready(function () {

    
//     var countryDropdown = $('#country-dropdown');
   
//     $.getJSON('./../utils/getCountryInfo.php', function (data) {
//         data.forEach(function (country) {
//             // Create an option element for each country
//             var option = $('<option></option>');
//             option.val(country.countryAbb);
//             option.text(country.countryName);
//             countryDropdown.append(option);
//         });
//     }).done(function(){
//         if(selectedCountry){
//             $('#country-dropdown').val(selectedCountry);
//         updateSelectedCountryFlag();
//         }else{
//             $('#country-dropdown').val('AE');
//             updateSelectedCountryFlag();
           
//         }


//     }).fail(function (error) {
//         console.error('Error fetching countries:', error);
//     });

//     var selectedCountry = sessionStorage.getItem("selectedCountry");
//     console.log(selectedCountry);
   

//     // if(selectedCountry){
//     //     $('#country-dropdown').val(selectedCountry);
//     // //updateSelectedCountryFlag();
//     // }else{
//     //     $('#country-dropdown').val('AE');
//     //     //updateSelectedCountryFlag();
//     // }


//     // Update the selected country's flag when the dropdown selection changes
//     countryDropdown.on('change', function () {
//         var selectedCountry = $('#country-dropdown').val();
//         if (typeof (Storage) !== "undefined") {
//             // Save the updated cartItems array back to sessionStorage
//             sessionStorage.setItem("selectedCountry",selectedCountry);
//         } else {
//             // If sessionStorage is not available, you can handle it here
//             console.error("Session storage is not supported in this browser.");
//         }

//         updateSelectedCountryFlag();
//     });

//     // Initial flag update when the page loads
//    // updateSelectedCountryFlag();

//     // Your other scripts can go here...


//     // Mapping of currency codes to symbols
//     var currencySymbols = {
//         usd: '$',
//         eur: '€',
//         aed: 'AED',
//         cny: '¥',
//         gbp: '£',
//     };

//     // Function to update currency symbol in product prices
//     function updateCurrencySymbol(currency) {
//         $('.product-price').each(function () {
//             var priceText = $(this).text();
//             var currencyCode = currency.toLowerCase();
//             if (currencySymbols[currencyCode]) {
//                 $('.itemCurrency').text(currencySymbols[currencyCode]);
//             }
//         });
//     }

//     // Initial currency selection
//     if (typeof (Storage) !== "undefined") {
//         // Retrieve cartItems from sessionStorage
//         var selectedCurrency = sessionStorage.getItem("selectedCurrency");
      
//         // debugger;
//         if(selectedCurrency){
        
//         $('#currency-dropdown').val(selectedCurrency);
//         }else{
           
//             $('#currency-dropdown').val('aed');
//             sessionStorage.setItem('selectedCurrency','aed');
//             selectedCurrency = 'aed';

//         }
//         console.log(selectedCurrency);
//     }
   

//     // Handle currency dropdown change event
//     $('#currency-dropdown').change(function () {
        
//         selectedCurrency = $(this).val();
//         if(selectedCurrency=='null'){
//          selectedCurrency='aed';
//          $(this).val(selectedCurrency);
//         }

//         if (typeof (Storage) !== "undefined") {
//             // Save the updated cartItems array back to sessionStorage
//             sessionStorage.setItem("selectedCurrency",selectedCurrency);
//         } else {
//             // If sessionStorage is not available, you can handle it here
//             console.error("Session storage is not supported in this browser.");
//         }

//         updateCurrencySymbol(selectedCurrency);
//     });

    // Shopping Cart Functionality
    var currencySymbols = {
                usd: '$',
                eur: '€',
                aed: 'AED',
                cny: '¥',
                gbp: '£',
            };
    var cartButton = $('#cart-button');
    var addToCartButtons = $('.add-to-cart');
    let cartItems = [];

    $('.product-section').on('click', '.add-to-cart', function () {
        var product = $(this).closest('.product');
        var productId = product.attr('data-id');
        var productName = product.find('.itemName').text();
        var productPrice = product.find('.itemPrice').text();
        var productImage = product.find('.itemImage').attr('src');
        var selectedCurrency =  $('#currency-dropdown').val();
        let cartItem = cartItems.find(item => item.id === productId);
        console.log(productPrice);
        if (cartItem) {
            // If the item already exists in the cart, update the count
            cartItem.count += 1;
        } else {
            // If it's a new item, add it to the cartItems array
            cartItem = {
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage,
                count: 1, // Initialize count to 1 for new items
            };
            console.log(cartItem);
            cartItems.push(cartItem);
        }

        // Check if sessionStorage is available in the browser
        if (typeof (Storage) !== "undefined") {
            // Save the updated cartItems array back to sessionStorage
            sessionStorage.setItem("cartItems", JSON.stringify(cartItems));
        } else {
            // If sessionStorage is not available, you can handle it here
            console.error("Session storage is not supported in this browser.");
        }
        updateCart();
    });

    // function updateCart() {
    //     var totalItemCount = cartItems.reduce((total, item) => total + item.count, 0);
    //     cartButton.text(`Cart (${totalItemCount})`);
    // }
    
    // Fetch and populate products from JSON data
    $.getJSON('./../utils/getItems.php', function (data) {
        
        var productList = $('#product-list');
        console.log(data);
        $.each(data, function (index, product) {
            var productItem = $('<div class="product"></div>');
            productItem.attr('data-id', product.itemName);
            var selectedCurrency =  $('#currency-dropdown').val();
            productItem.html(`
                <img class="itemImage" src="${product.itemImg}" alt="${product.itemName}">
                <h3><span class="itemName">${product.itemName}</span></h3>
                <p>Description: ${product.itemName}</p>
                <p class="product-price">Price: <span class="itemCurrency">${currencySymbols[selectedCurrency]}</span><span class="itemPrice">${product.itemPrice}</span></p>
                <button class="add-to-cart">Add to Cart</button>
            `);

            productList.append(productItem);
        });
    }).fail(function (error) {
     
        console.error('Error fetching products:', error);
    });

    // // Initialize cartItems from sessionStorage on page load
    // if (typeof (Storage) !== "undefined") {
    //     var storedCartItems = sessionStorage.getItem("cartItems");
    //     if (storedCartItems) {
    //         cartItems = JSON.parse(storedCartItems);
    //         updateCart();
    //     }
    // }
});

// // Function to update the selected country's flag image
// function updateSelectedCountryFlag() {
//     var selectedCountry = $('#country-dropdown').val();

//     $.getJSON('./../utils/getCountryInfo.php', function (data) {
       
//         var selectedCountryData = data.find(country => country.countryAbb === selectedCountry);
//         if (selectedCountryData) {
//             var flagImgLink = selectedCountryData.ImgLink;
//             $('#selected-country-flag').attr('src', flagImgLink);
//         } else {
//             // Handle the case where the selected country is not found in the data
//             console.error('Selected country not found in data.');
//         }
//     }).fail(function (error) {
//         console.error('Error fetching countries:', error);
//     });

//     if (typeof (Storage) !== "undefined") {
//         // Save the updated cartItems array back to sessionStorage
//         sessionStorage.setItem("selectedCountry", selectedCountry);
//     } else {
//         // If sessionStorage is not available, you can handle it here
//         console.error("Session storage is not supported in this browser.");
//     }

// }

// Script for populating countries dropdown and updating the flag


