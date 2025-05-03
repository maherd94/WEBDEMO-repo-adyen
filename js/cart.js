$(document).ready(function () {

if(sessionStorage.getItem('demoType')=='ECOM'){
$(".deposit-auth-button").addClass('hide');
}

    function generateISOTimestamp() {
        return new Date().toISOString();
    }

    function generateServiceID() {
        return `${Date.now().toString(36)}`;
    }

    function callAPI(apiUrl, raw,headersSent, callback) {

        // Convert the data object to a JSON string
        var jsonData = JSON.stringify(raw);

        // Make the POST request using jQuery
        $.ajax({
            type: 'POST',
            url: apiUrl,
            data: raw,
            headers: headersSent,
            mode: 'no-cors',
            contentType: 'application/json',
            dataType: 'json',
            success: function (response) {
                console.log('done call got response');
                callback(response); // Call the callback function with the response data
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error('Error:', textStatus, errorThrown);
                console.error('error', jqXHR);
                // You can handle error cases here
            }
        });
    }


    var selectedCurrency
    var cartItems = [];
    // Function to show the custom popup
    function showPopup(message) {
        const popup = document.getElementById('custom-popup');
        const popupMessage = document.getElementById('popup-message');
        popupMessage.textContent = message;
        popup.style.display = 'block';
    }

    // Function to close the custom popup
    function closePopup() {
        const popup = document.getElementById('custom-popup');
        popup.style.display = 'none';
    }




    $('.deposit-auth-button').click(function(){

        var authrequestbody= 
            {"SaleToPOIRequest":{
                "MessageHeader": {
                    "ProtocolVersion": "3.0",
                    "MessageClass": "Service",
                    "MessageCategory": "Payment",
                    "MessageType": "Request",
                    "SaleID": "POSSystemID12345",
                    "ServiceID": generateServiceID(),
                    "POIID": JSON.parse(sessionStorage.connectionConfig).configuration.terminalID,
                },
                "PaymentRequest": {
                    "SaleData": {
                        "SaleTransactionID": {
                            "TransactionID": generateServiceID(),
                            "TimeStamp": generateISOTimestamp()
                        },
                        "SaleToAcquirerData": "recurringProcessingModel=UnscheduledCardOnFile&shopperReference=DEMO_1234556&shopperEmail=shopper@adyen.com&authorisationType=PreAuth&manualCapture=true",
                        "TokenRequestedType": "Customer"
                    },
                    "PaymentTransaction": {
                        "AmountsReq": {
                            "Currency":`${sessionStorage.selectedCurrency.toUpperCase()}`,
                        "RequestedAmount":3000
                        }
                    }
                }}
            }

            // "PaymentResponse": {
            // "POIData": {
            //     "POIReconciliationID": "1000",
            //     "POITransactionID": {
            //         "TimeStamp": "2025-04-11T10:05:30.705Z",
            //         "TransactionID": "vuN9001744365930009.FS3G4KL8B5M9M6V5"
            //     }


            var authresponsebody;
        var apiUrl = "./../utils/payment.php";
        var raw = JSON.stringify(authrequestbody);
       
            var headersSent = {
                'X-API-Key': JSON.parse(sessionStorage.connectionConfig).configuration.apiKeyPOS
            } 
            $("#overlay, #popup").fadeIn();
           
            callAPI(apiUrl, raw,headersSent, function (response) {
                authresponsebody = JSON.parse(response);

                if (authresponsebody.SaleToPOIResponse.PaymentResponse.Response.Result == 'Success') {
                    
                    $('.spinner').addClass('hide');
                    $('.payment-result-container').removeClass('hide');
                    $('<div class="success-page adyen-checkout__status adyen-checkout__status--success"><img height="88" class="adyen-checkout__status__icon adyen-checkout__image adyen-checkout__image--loaded" src="https://checkoutshopper-test.adyen.com/checkoutshopper/images/components/success.gif" alt="Payment Successful"><span class="adyen-checkout__status__text">Deposit Succesfully Authorized</span></div>').appendTo('.payment-result-container');
                    $('<div class="success-page adyen-checkout__status adyen-checkout__status--success"><img height="88" class="adyen-checkout__status__icon adyen-checkout__image adyen-checkout__image--loaded" src="https://checkoutshopper-test.adyen.com/checkoutshopper/images/components/success.gif" alt="Payment Successful"><span class="adyen-checkout__status__text">Deposit Succesfully Authorized</span></div>').detach();
                 
                    // var additionalResponse = authresponsebody.SaleToPOIResponse.PaymentResponse.Response.AdditionalResponse;
                    // var regex = /recurringDetailReference=([^&]+)/;
                    // var match = regex.exec(additionalResponse);
    
                    // if (match) {
                    //     var result = match[1];
                    //     sessionStorage.setItem('recurringDetailReference',result);
                    //     console.log('recurringDetailReference',result);
                    // } else {
                    //     console.log("Pattern not found in the input string.");
                    // }
    
                    
                    var captureTransactionID = authresponsebody.SaleToPOIResponse.PaymentResponse.POIData.POITransactionID.TransactionID.split('.')[1]
                    console.log(captureTransactionID);
                    sessionStorage.setItem('pspToCapture',captureTransactionID);

                }

               


            });
        


    });

    $('.popup-close').click(function () {
        closePopup();
    });



    const cartButton = $('#cart-button');
    // Check if sessionStorage is available in the browser

    // Function to reset the cart
    $('#reset-cart-button').click(function () {
        // Clear cart items from sessionStorage
        sessionStorage.removeItem("cartItems");

        // Clear the cartItems array and update the cart display
        cartItems = [];
        updateCart();
        fillProducts();
        updateCurrencySymbol(selectedCurrency);
    });
    $('.checkout-button').on('click', function () {
        // Calculate the total price of the cart items
        var totalItemCount = 0;;
        if (cartItems) {
            totalItemCount = cartItems.reduce((total, item) => total + item.count, 0);
        }
        // Check if the total is 0
        if (totalItemCount === 0) {
            // Show the custom popup with the message
            showPopup('Your cart is empty. Please add items to your cart before proceeding to checkout.');
            return;
        } 
        if(sessionStorage.getItem('demoType')=='ECOM') {
            // Redirect to the checkout page or perform any other action here
            window.location.href = 'checkout.html';
            //alert('Redirecting to the checkout page...');
        }else if(sessionStorage.getItem('demoType')=='POS'){
            if(sessionStorage.pspToCapture!=null){

                var InitiateCaptureRsponseBody;
               var InitiateCaptureRequestBody = {
                "pspReference": sessionStorage.pspToCapture, 
                "request": {
                  "amount": {
                    "currency": `${sessionStorage.selectedCurrency.toUpperCase()}`,
                    "value": parseFloat(sessionStorage.total)*100
                  },
                  "merchantAccount": JSON.parse(sessionStorage.connectionConfig).configuration.posMerchantAccount,
                  "reference":  generateServiceID()
                }
              }

                var apiUrl = "./../utils/captures.php";
                var raw = JSON.stringify(InitiateCaptureRequestBody);
               
                    var headersSent = {
                        'X-API-Key': JSON.parse(sessionStorage.connectionConfig).configuration.apiKeyPOS
                    }
                    $("#overlay, #popup").fadeIn();
                    callAPI(apiUrl, raw,headersSent, function (response) {
                        console.log(response);
                        InitiateCaptureRsponseBody = response;
        
                         if (InitiateCaptureRsponseBody.status == 'received') {
                           
                            showResult(response);
                                   console.log("here");
        
        
        
                        }
        
                    });
                    sessionStorage.removeItem("pspToCapture");
                    



            }
else{
            if(sessionStorage.recurringDetailReference==null){

            var initiatePaymentRequestBody= 

	{
        "SaleToPOIRequest": {
            "MessageHeader": {
                "ProtocolVersion": "3.0",
                "MessageClass": "Service",
                "MessageCategory": "Payment",
                "MessageType": "Request",
                "SaleID": "POSSystemID12",
                "ServiceID": generateServiceID(),
                "POIID": JSON.parse(sessionStorage.connectionConfig).configuration.terminalID,
            },
            "PaymentRequest": {
                "SaleData": {
                            "SaleTransactionID": {
                                "TransactionID": generateServiceID(),
                                "TimeStamp": generateISOTimestamp()
                            },
                            "SaleToAcquirerData": "recurringProcessingModel=UnscheduledCardOnFile&shopperReference=DEMO_1234556&shopperEmail=shopper@adyen.com",
                            "TokenRequestedType": "Customer"
                        },
                "PaymentTransaction": {
                    "AmountsReq": {
                        "Currency":`${sessionStorage.selectedCurrency.toUpperCase()}`,
                        "RequestedAmount":parseFloat(sessionStorage.total)
                    }
                
                }
            }
        }
    
            };

            var showLoyaltyPointsRequestBody= {
                "SaleToPOIRequest":{
                    "MessageHeader":{
                        "ProtocolVersion":"3.0",
                        "MessageClass":"Device",
                        "MessageCategory":"Input",
                        "MessageType":"Request",
                        "ServiceID":generateServiceID(),
                        "SaleID":"POSSystemID12345",
                        "POIID":JSON.parse(sessionStorage.connectionConfig).configuration.terminalID
                    },
                    "InputRequest":{
                        "DisplayOutput":{
                            "Device":"CustomerDisplay",
                            "InfoQualify":"Display",
                            "OutputContent":{
                                "OutputFormat":"Text",
                                "PredefinedContent":{
                                    "ReferenceID":"GetConfirmation"
                                },
                                "OutputText":[
                                    {
                                        "Text":"Loyalty Points"
                                    },
                                    {
                                        "Text":`Demo Shopper, you have 10 points do you want to use them?`
                                    },
                                    {
                                        "Text":"No"
                                    },
                                    {
                                        "Text":"Yes"
                                    }
                                ]
                            }
                        },
                        "InputData":{
                            "Device":"CustomerInput",
                            "InfoQualify":"Input",
                            "InputCommand":"GetConfirmation",
                            "MaxInputTime":120
                        }
                    }
                }
            };
            // var initiatePaymentRequestBody ={
            //     "SaleToPOIRequest": {
            //       "MessageHeader": {
            //         "ProtocolVersion": "3.0",
            //         "MessageClass": "Service",
            //         "MessageCategory": "Payment",
            //         "MessageType": "Request",
            //         "SaleID": "POSSystemID12345",
            //         "ServiceID": generateServiceID(),
            //         "POIID": "S1F2-000158222752438"
            //       },
            //       "PaymentRequest": {
            //         "SaleData": {
            //           "SaleTransactionID": {
            //             "TransactionID": generateServiceID(),
            //             "TimeStamp": generateISOTimestamp()
            //           },
                     
                    
            //         "PaymentTransaction": {
            //           "AmountsReq": {
            //             "Currency": (sessionStorage.selectedCurrency).toUpperCase(),
            //             "RequestedAmount": sessionStorage.total
            //           }
            //         }
            //       }
            //     }
            //   }
            // };
            console.log(showLoyaltyPointsRequestBody);
            var apiUrl1 = "./../utils/payment.php";
            var raw1 = JSON.stringify(showLoyaltyPointsRequestBody);
            $("#overlay, #popup").fadeIn();
            var headersSent = {
                'X-API-Key': JSON.parse(sessionStorage.connectionConfig).configuration.apiKeyPOS
            }
            if(JSON.parse(sessionStorage.settingconfig).loyaltyProgram){
            callAPI(apiUrl1,raw1,headersSent,function(response){
           
            console.log(initiatePaymentRequestBody);
            var apiUrl = "./../utils/payment.php";
            var raw = JSON.stringify(initiatePaymentRequestBody);
           
           


            var initiatePaymentResponseBody;
            var headersSent = {
                'X-API-Key': JSON.parse(sessionStorage.connectionConfig).configuration.apiKeyPOS
            }
           
            callAPI(apiUrl, raw,headersSent, function (response) {
               initiatePaymentResponseBody = JSON.parse(response);

                if (initiatePaymentResponseBody.SaleToPOIResponse.PaymentResponse.Response.Result == 'Success') {
                    
                    $('.spinner').addClass('hide');
                    $('.payment-result-container').removeClass('hide');
                    $('<div class="success-page adyen-checkout__status adyen-checkout__status--success"><img height="88" class="adyen-checkout__status__icon adyen-checkout__image adyen-checkout__image--loaded" src="https://checkoutshopper-test.adyen.com/checkoutshopper/images/components/success.gif" alt="Payment Successful"><span class="adyen-checkout__status__text">Payment Successful & TOKENIZED (next payment will be MIT)</span></div>').appendTo('.payment-result-container');
                    
                    var additionalResponse = initiatePaymentResponseBody.SaleToPOIResponse.PaymentResponse.Response.AdditionalResponse;
                    var regex = /recurringDetailReference=([^&]+)/;
                    var match = regex.exec(additionalResponse);
    
                    if (match) {
                        var result = match[1];
                        sessionStorage.setItem('recurringDetailReference',result);
                        console.log('recurringDetailReference',result);
                    } else {
                        console.log("Pattern not found in the input string.");
                    }
    



                }

            });
       
        });
            }else{
        var initiatePaymentResponseBody;
        var apiUrl = "./../utils/payment.php";
        var raw = JSON.stringify(initiatePaymentRequestBody);
       
            var headersSent = {
                'X-API-Key': JSON.parse(sessionStorage.connectionConfig).configuration.apiKeyPOS
            }
           
            callAPI(apiUrl, raw,headersSent, function (response) {
               initiatePaymentResponseBody = JSON.parse(response);

                if (initiatePaymentResponseBody.SaleToPOIResponse.PaymentResponse.Response.Result == 'Success') {
                    
                    $('.spinner').addClass('hide');
                    $('.payment-result-container').removeClass('hide');
                    $('<div class="success-page adyen-checkout__status adyen-checkout__status--success"><img height="88" class="adyen-checkout__status__icon adyen-checkout__image adyen-checkout__image--loaded" src="https://checkoutshopper-test.adyen.com/checkoutshopper/images/components/success.gif" alt="Payment Successful"><span class="adyen-checkout__status__text">Payment Successful</span></div>').appendTo('.payment-result-container');
                   



                }

            });
    }
        }else{

            var paymentRequestBody = {

                "amount": {
                    "currency": `${sessionStorage.selectedCurrency.toUpperCase()}`,
                    "value": parseFloat(sessionStorage.total)*100,
                },
                "reference": generateServiceID(),
                "paymentMethod": '',
                "shopperInteraction":"ContAuth",
                "shopperReference":"DEMO_1234556",
                "recurringProcessingModel":"UnscheduledCardOnFile",
                "paymentMethod": {
                    "type": "scheme",
                    "storedPaymentMethodId":sessionStorage.recurringDetailReference
                },
                "returnUrl":  window.location.href,
                "merchantAccount": JSON.parse(sessionStorage.connectionConfig).configuration.ecomMerchantAccount,
                "shopperEmail": "shopper@demo.com",
                "shopperIP": "192.0.2.1",
                "channel": "web",
                "origin":  window.location.href,
            };

            $("#overlay, #popup").fadeIn();
            raw = JSON.stringify(paymentRequestBody);
            console.log('Payment Request Body', $.parseJSON(raw));
            var headersSent = {
                'X-API-Key': JSON.parse(sessionStorage.connectionConfig).configuration.apiKeyPOS 
            }
            callAPI('./../utils/payments.php', raw,headersSent, function (response) {

                console.log('Payment response Body',response);
                showResult(response);
            });



        }
    }}
    });

    function showResult(response) {
        console.log(response);

        $('.spinner').addClass('hide');
        $('.payment-result-container').removeClass('hide');
        $('<div class="success-page adyen-checkout__status adyen-checkout__status--success"><img height="88" class="adyen-checkout__status__icon adyen-checkout__image adyen-checkout__image--loaded" src="https://checkoutshopper-test.adyen.com/checkoutshopper/images/components/success.gif" alt="Payment Successful"><span class="adyen-checkout__status__text">Payment Successful</span></div>').appendTo('.payment-result-container');
       

    }

    fillProducts();
    function fillProducts() {
        var currencySymbols = {
            usd: '$',
            eur: '€',
            aed: 'AED',
            cny: '¥',
            gbp: '£',
        };
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
                    <p class="product-price">Price: <span class="itemCurrency">`+ currencySymbols[selectedCurrency]+ `</span>${cartItem.price}</p>
                    <p>Quantity: ${cartItem.count}</p>
                    <button class="remove-from-cart">Remove</button>
                </div>
            `);


                    cartItemsContainer.append(productItem);


                    // Calculate and update the total price
                    totalPrice += parseFloat(cartItem.price) * cartItem.count;
                });
            }
            else {
                const productItem = $('.cart-item');
                productItem.replaceWith('<div class="cart-item"></div>');
            }

            // Display the total price
            const totalContainer = $('.total');
            totalContainer.html(`Price: <span class="itemCurrency">${currencySymbols[selectedCurrency]}</span>${totalPrice.toFixed(2)}`);

            if (typeof (Storage) !== "undefined") {
                sessionStorage.setItem('total', totalPrice.toFixed(2));
            }
            updateCurrencySymbol(selectedCurrency);
        } else {
            // If sessionStorage is not available, you can handle it here
            console.error("Session storage is not supported in this browser.");
        }
    }

    $('.product-section').on('click', '.remove-from-cart', function () {

        var itemParent = $(this).parent().parent();
        var itemID = itemParent.find('h3').text();
        removeItemById(itemID);
        updateCart();
        const totalItemCount = cartItems.reduce((total, item) => total + (item.price * item.count), 0);
        // Display the total price
        const totalContainer = $('.total');
        totalContainer.text(`Price: ${currencySymbols[selectedCurrency]}${totalItemCount.toFixed(2)}`);

        updateCurrencySymbol(selectedCurrency);
        itemParent.detach();

    });

    $("#closePopupButton, #overlay").click(function () {

        $("#overlay, #popup").fadeOut();
        $('.spinner').removeClass('hide');
        $('.payment-result-container').html('');
        $('.payment-result-container').addClass('hide');
    });

    function removeItemById(id) {
        // Find the index of the item with the specified id
        const index = cartItems.findIndex(item => item.id === id);

        // If the item was found (index is not -1), remove it from the cartItems array
        if (index !== -1) {
            cartItems.splice(index, 1);
        }
        if (typeof (Storage) !== "undefined") {
            // Save the updated cartItems array back to sessionStorage
            sessionStorage.setItem("cartItems", JSON.stringify(cartItems));
        } else {
            // If sessionStorage is not available, you can handle it here
            console.error("Session storage is not supported in this browser.");
        }


    }


    // function updateCart() {
    //     const totalItemCount = cartItems.reduce((total, item) => total + item.count, 0);
    //     const totalPrice = cartItems.reduce((total, item) => total + (item.price * item.count), 0);
    //     cartButton.text(`Cart (${totalItemCount})`);
    //     if (typeof (Storage) !== "undefined") {
    //         sessionStorage.setItem('total', totalPrice.toFixed(2));
    //     }
    // }

    // // Initialize cartItems from sessionStorage on page load
    // if (typeof (Storage) !== "undefined") {
    //     const storedCartItems = sessionStorage.getItem("cartItems");
    //     if (storedCartItems) {
    //         cartItems = JSON.parse(storedCartItems);
    //         updateCart();
    //     }
    // }
});


// Function to update the selected country's flag image
// function updateSelectedCountryFlag() {
//     var selectedCountry = $('#country-dropdown').val();
//     $.getJSON('./../utils/getCountryInfo.php', function (data) {
//         var selectedCountryData = data.find(country => country.countryAbb === selectedCountry);
//         if(!selectedCountryData){
//             selectedCountry = 'AE';
//             $('#country-dropdown').val(selectedCountry);
//             selectedCountryData = data.find(country => country.countryAbb === selectedCountry);
//         }
//         if (selectedCountryData) {
//             const flagImgLink = selectedCountryData.ImgLink;
//             $('#selected-country-flag').attr('src', flagImgLink);
//             if (typeof (Storage) !== "undefined") {
//                 // Save the updated cartItems array back to sessionStorage
//                 sessionStorage.setItem("selectedCountry", selectedCountry);
                
//             } else {
//                 // If sessionStorage is not available, you can handle it here
//                 console.error("Session storage is not supported in this browser.");
//             }
//         } else {
//             // Handle the case where the selected country is not found in the data
//             console.error('Selected country not found in data.');
//         }
//     }).fail(function (error) {
       
       
//         //console.error('Error fetching countries:', error);
//     });


// }

// Script for populating countries dropdown and updating the flag
// $(document).ready(function () {
//     const countryDropdown = $('#country-dropdown');
//     var selectedCountry;
//     // Fetch data from getCountryInfo.php
//     $.getJSON('./../utils/getCountryInfo.php', function (data) {
//         data.forEach(function (country) {
//             // Create an option element for each country
//             const option = $('<option></option>');
//             option.val(country.countryAbb);
//             option.text(country.countryName);
//             countryDropdown.append(option);
//         });
//     }).done(function () {
//         if (selectedCountry) {
//             $('#country-dropdown').val(selectedCountry);
//             updateSelectedCountryFlag();
//         } else {
//             $('#country-dropdown').val('AE');
//             updateSelectedCountryFlag();
    
//         }


//     }).fail(function (error) {
//         console.error('Error fetching countries:', error);
//     });
//     selectedCountry = sessionStorage.getItem("selectedCountry");
//     console.log(selectedCountry);

//     // Update the selected country's flag when the dropdown selection changes
//     countryDropdown.on('change', function () {
//         if (typeof (Storage) !== "undefined") {
//             // Save the updated cartItems array back to sessionStorage
//             sessionStorage.setItem("selectedCountry", $(this).val());
//             selectedCountry = $(this).val();
//         } else {
//             // If sessionStorage is not available, you can handle it here
//             console.error("Session storage is not supported in this browser.");
//         }
//         updateSelectedCountryFlag();
//     });

//     // Initial flag update when the page loads
//     updateSelectedCountryFlag();

//     // Your other scripts can go here...
// });


