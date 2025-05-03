$(document).ready(function(){

     // Handle currency dropdown change event
     $('#currency-dropdown').change(function () {
       debugger;
        selectedCurrency = $(this).val();
        if(selectedCurrency=='null'){

         selectedCurrency='aed';
         $(this).val(selectedCurrency);
        }

        if (typeof (Storage) !== "undefined") {
            // Save the updated cartItems array back to sessionStorage
            sessionStorage.setItem("selectedCurrency",selectedCurrency);
        } else {
            // If sessionStorage is not available, you can handle it here
            console.error("Session storage is not supported in this browser.");
        }

        updateCurrencySymbol(selectedCurrency);
    });
// Initial currency selection
if (typeof (Storage) !== "undefined") {
    // Retrieve cartItems from sessionStorage
    var selectedCurrency = sessionStorage.getItem("selectedCurrency");
    
    // debugger;
  
    if(selectedCurrency){
    
    $('#currency-dropdown').val(selectedCurrency);
    }else{
       
        $('#currency-dropdown').val('aed');
        sessionStorage.setItem('selectedCurrency','aed');
        selectedCurrency = 'aed';

    }
    console.log(selectedCurrency);
}
var countryDropdown = $('#country-dropdown');
   
    $.getJSON('./../utils/getCountryInfo.php', function (data) {
        data.forEach(function (country) {
            // Create an option element for each country
            var option = $('<option></option>');
            option.val(country.countryAbb);
            option.text(country.countryName);
            countryDropdown.append(option);
        });
    }).done(function(){
        var selectedCountry  = sessionStorage.getItem("selectedCountry");
       
        if(selectedCountry){
            $('#country-dropdown').val(selectedCountry);
        updateSelectedCountryFlag();
        }else{
            sessionStorage.setItem('selectedCountry','aed');
            $('#country-dropdown').val('AE');
            updateSelectedCountryFlag();
           
        }


    }).fail(function (error) {
        console.error('Error fetching countries:', error);
    });

    var selectedCountry = sessionStorage.getItem("selectedCountry");
    console.log(selectedCountry);
   

    // if(selectedCountry){
    //     $('#country-dropdown').val(selectedCountry);
    // //updateSelectedCountryFlag();
    // }else{
    //     $('#country-dropdown').val('AE');
    //     //updateSelectedCountryFlag();
    // }


    // Update the selected country's flag when the dropdown selection changes
    countryDropdown.on('change', function () {
        var selectedCountry = $('#country-dropdown').val();
        if (typeof (Storage) !== "undefined") {
            // Save the updated cartItems array back to sessionStorage
            sessionStorage.setItem("selectedCountry",selectedCountry);
        } else {
            // If sessionStorage is not available, you can handle it here
            console.error("Session storage is not supported in this browser.");
        }

        updateSelectedCountryFlag();
    });

    // Initial flag update when the page loads
   // updateSelectedCountryFlag();

    // Your other scripts can go here...


    
   

 

    
 // Initialize cartItems from sessionStorage on page load
 if (typeof (Storage) !== "undefined") {
    var storedCartItems = sessionStorage.getItem("cartItems");
    if (storedCartItems) {
        cartItems = JSON.parse(storedCartItems);
        updateCart();
    }
}
});

function updateCart() {
    var cartButton = $('#cart-button');
    var addToCartButtons = $('.add-to-cart');
    let cartItems = [];
    
    if (typeof (Storage) !== "undefined") {
        var storedCartItems = sessionStorage.getItem("cartItems");
        if (storedCartItems) {
            cartItems = JSON.parse(storedCartItems);
          
        }
    }
    var totalItemCount = cartItems.reduce((total, item) => total + item.count, 0);
    cartButton.text(`Cart (${totalItemCount})`);
}










// Mapping of currency codes to symbols
var currencySymbols = {
    usd: '$',
    eur: '€',
    aed: 'AED',
    cny: '¥',
    gbp: '£',
};

// Function to update currency symbol in product prices
function updateCurrencySymbol(currency) {
  
    $('.product-price').each(function () {
        var priceText = $(this).text();
        var currencyCode = currency.toLowerCase();
        if (currencySymbols[currencyCode]) {
            $('.itemCurrency').text(currencySymbols[currencyCode]);
        }
    });
}




// Function to update the selected country's flag image
function updateSelectedCountryFlag() {
    var selectedCountry = $('#country-dropdown').val();

    $.getJSON('./../utils/getCountryInfo.php', function (data) {
       
        var selectedCountryData = data.find(country => country.countryAbb === selectedCountry);
        if (selectedCountryData) {
            var flagImgLink = selectedCountryData.ImgLink;
            $('#selected-country-flag').attr('src', flagImgLink);
        } else {
            // Handle the case where the selected country is not found in the data
            console.error('Selected country not found in data.');
        }
    }).fail(function (error) {
        console.error('Error fetching countries:', error);
    });

    if (typeof (Storage) !== "undefined") {
        // Save the updated cartItems array back to sessionStorage
        sessionStorage.setItem("selectedCountry", selectedCountry);
    } else {
        // If sessionStorage is not available, you can handle it here
        console.error("Session storage is not supported in this browser.");
    }

}

// Script for populating countries dropdown and updating the flag

