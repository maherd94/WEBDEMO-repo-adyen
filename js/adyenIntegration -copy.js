$(document).ready(function () {


    var dropInConfig;
    var selectedIntegration;
    var dropinComponent;
    var configuration;
    dropInConfig = { openFirstPaymentMethod: false, showStoredPaymentMethods: false }
    function generateISOTimestamp() {
        return new Date().toISOString();
    }

    function generateServiceID() {
        return `Adyen-Demo-${Date.now().toString(36)}`;
    }

    var payByLinkRequestBody = {
        "reference": "ref12333",
        "amount": {
            "value": '',
            "currency": ''
        },
        "countryCode": '',
        "merchantAccount": '',
        "shopperReference": "DEMO_1234556",
        "shopperEmail": "test@email.com"
    };
    var paymentMethodRequestBody = {

        "merchantAccount": "MaherAccountECOM",

        "shopperReference": "DEMO_1234556",
        "countryCode": "AE",
        "amount": {
            "currency": "AED",
            "value": 1000
        }

    }
    var paymentRequestBody = {

        "amount": {
            "currency": "EUR",
            "value": 1000
        },
        "reference": generateServiceID(),
        "paymentMethod": '',
        "returnUrl": "my-app://adyen",
        "merchantAccount": "YOUR_MERCHANT_ACCOUNT",
        // "authenticationData": {
        //     "threeDSRequestData": {
        //         "nativeThreeDS": "preferred"
        //     }
        // },
        "recurringProcessingModel":"CardOnFile",
        "shopperReference":"DEMO_1234556",
        "browserInfo": {
            "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36",
            "acceptHeader": "text\/html,application\/xhtml+xml,application\/xml;q=0.9,image\/webp,image\/apng,*\/*;q=0.8",
            "language": "nl-NL",
            "colorDepth": 24,
            "screenHeight": 723,
            "screenWidth": 1536,
            "timeZoneOffset": 0,
            "javaEnabled": true
        },
        "shopperInteraction":"Ecommerce",
        "shopperEmail": "s.hopper@example.com",
        "shopperIP": "192.0.2.1",
        "channel": "web",
        "origin": "https:your-company.com",
    }


    function callAPI(apiUrl, raw, headersSent, callback) {

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

    $('.integration-type-input select').change(function () {

        console.log('38');
        selectedIntegration = $(this).val();
        initAdyen();

    });

    function initAdyen() {
        console.log(selectedIntegration);
      

        var total;
        var currency;
        var country;
        var merchantAccount = JSON.parse(sessionStorage.connectionConfig).configuration.ecomMerchantAccount;

        if (typeof (Storage) !== "undefined") {
            // Retrieve cartItems from sessionStorage          
            currency = sessionStorage.getItem("selectedCurrency");
            total = parseFloat(sessionStorage.getItem("total")) * 100;
            country = sessionStorage.getItem("selectedCountry");
        }

        configuration.paymentMethodsConfiguration.card.amount.currency = currency;
        paymentMethodRequestBody.countryCode = country.toUpperCase();
        paymentMethodRequestBody.amount.value = total;
        paymentMethodRequestBody.amount.currency = currency.toUpperCase();
        paymentMethodRequestBody.merchantAccount = merchantAccount;

        raw = JSON.stringify(paymentMethodRequestBody);

        console.log('Payment Method Request Body', $.parseJSON(raw));
        var headersSent = {
            'X-API-Key': JSON.parse(sessionStorage.connectionConfig).configuration.apiKeyECOM
        }
        callAPI('./../utils/paymentMethods.php', raw, headersSent, function (response) {
            console.log('Payment Method Response no mod', response);
            LoadAdyen(response, selectedIntegration);


        });

    }


    configuration = {
        environment: 'test', // Change to 'live' for the live environment.
        locale: 'en-US',
        clientKey: "test_DNYUPHYAUJEWPEKUYET53S3U2EBHNJJD", // Public key used for client-side authentication: https://docs.adyen.com/development-resources/client-side-authentication
        analytics: {
            enabled: true // Set to false to not send analytics data to Adyen.
        },
        showPayButton: true,
        paymentMethodsResponse: '',
        onSubmit: (state, component) => {
            var total;
            var currency;
            var country;
            var merchantAccount = "MaherAccountECOM";

            if (typeof (Storage) !== "undefined") {
                // Retrieve cartItems from sessionStorage          
                currency = sessionStorage.getItem("selectedCurrency").toUpperCase();
                total = parseFloat(sessionStorage.getItem("total")) * 100;
                country = sessionStorage.getItem("selectedCountry");
            }

            paymentRequestBody.amount.value = 25500;
            paymentRequestBody.amount.currency = "AED";
            paymentRequestBody.merchantAccount = "MaherAccountECOM";
            paymentRequestBody.returnUrl = "";
            paymentRequestBody.paymentMethod = state.data.paymentMethod;
            paymentRequestBody.origin = window.location.href;
            raw = JSON.stringify(paymentRequestBody);
            console.log('Payment Request Body', $.parseJSON(raw));
            var headersSent = {
                'X-API-Key': "AQEuhmfxK47HbBxEw0m/n3Q5qf3VZYpFCIFrW2ZZ03a/qqNxYzLIkV4T4RpD+QLLkBDBXVsNvuR83LVYjEgiTGAH-SA1rN63uaZO505w752voi4T0qnhRYn/bJo9Rezz1Tt0=-i1i;(XaqSPL5WqCq+Xt"
            }
            callAPI('./../utils/payments.php', raw, headersSent, function (response) {

                console.log('Payment response Body', response);
                if (response.action) {
                    
                    dropinComponent.handleAction(response.action);
                }
                else {
                    showResult(response);
                }

            })
        },
        onPaymentCompleted: (result, component) => {
            console.info(result, component);
            // if(result.resultCode == "Authorised"){
            //   dropinUnmout();
            //   $('<div class="success-page"></div>').appendTo('.dropin-container');
            // }
        },
        onAdditionalDetails: (state, dropin) => {
            raw = JSON.stringify(
                state.data
            );
            console.log('Payment Details request Body', $.parseJSON(raw));
            var headersSent = {
                'X-API-Key': JSON.parse(sessionStorage.connectionConfig).configuration.apiKeyECOM
            }
            callAPI('./../utils/paymentsdetails.php', raw, headersSent, function (response) {


                if (response.action) {
                    dropinComponent.handleAction(response.action);
                }
                else {
                    showResult(response);
                }

            });


        },
        onError: (error, component) => {
            console.log(error.name, error.message, error.stack, component);
        },

        // Any payment method specific configuration. Find the configuration specific to each payment method:  https://docs.adyen.com/payment-methods
        // For example, this is 3D Secure configuration for cards:
        paymentMethodsConfiguration: {
            card: {
                onBrand: (brand) => {
                    console.log(brand);
                    if ($('.toggle-identify-brand-input input').is(':checked')) {
                        console.log('on');
                        var $creditCardElement = $('.adyen-checkout__payment-method--card');
                        if (brand.brand == 'visa') {
                            // Add the background gradient style
                            $creditCardElement.css('background', 'linear-gradient(90deg, #00d4ff 0%, #3278b5 59%)');


                        } else if (brand.brand == 'mc') {
                            // Apply MasterCard background gradient
                            $creditCardElement.css('background', 'linear-gradient(to right, #f8d500, #eb6d3d)');
                        }
                        else if (brand.brand == 'card') {
                            // Apply MasterCard background gradient
                            $creditCardElement.css('background', 'linear-gradient(to right, #f7f8f9, #f7f8f9)');
                        }






                    }
                },
                onFieldValid: (object) => {
                    console.log('onfieldValid', object);
                },
                onBinValue: (brand) => {
                    if ($('.toggle-identify-bin-input input').is(':checked')) {
                        if (brand.uuid != null) {
                            console.log(brand);
                            alert(`BIN Detected: ${brand.binValue}`);
                        }


                    }
                },
                amount: {
                    currency: sessionStorage.getItem("selectedCurrency"),
                    value: parseFloat(sessionStorage.getItem("total")) * 100
                }
            },
            storedCard: {
                hideCVC: false
            }
        }
    };

    function showResult(response) {
        console.log(response);

        if (response.resultCode == "Authorised") {


            $('#adyen-container').html('<div class="success-page adyen-checkout__status adyen-checkout__status--success"><img height="88" class="adyen-checkout__status__icon adyen-checkout__image adyen-checkout__image--loaded" src="https://checkoutshopper-test.adyen.com/checkoutshopper/images/components/success.gif" alt="Payment Successful"><span class="adyen-checkout__status__text">Payment Successful</span></div>');
            pspReference_Tokenize = response.pspReference
            recurringDetailReference_Tokenize = response.additionalData['recurring.recurringDetailReference'];
            console.log('psp', pspReference_Tokenize);
            console.log('rdr', recurringDetailReference_Tokenize);


        } else if (response.resultCode == "Refused") {
            $('#adyen-container').html(`<div class=" success-page adyen-checkout__status adyen-checkout__status--error"><img class="adyen-checkout__status__icon adyen-checkout__image adyen-checkout__image--loaded" src="https://checkoutshopper-test.adyen.com/checkoutshopper/images/components/error.gif" alt="An unknown error occurred" height="88"><span class="adyen-checkout__status__text">Payment Unsuccessful : <b>${response.refusalReason}</b></span></div>`);
        }




        

    }

    async function LoadAdyen(data, integrationType) {
        $('#adyen-container').html('');
        console.log('data', data);
        console.log('config', configuration);
        // Create an instance of AdyenCheckout using the configuration object.
        configuration.paymentMethodsResponse = data;
        console.log('dropin Config', dropInConfig);

        var checkout = await AdyenCheckout(configuration);

        
            dropinComponent = checkout.create(integrationType, dropInConfig);
        

        dropinComponent.mount("#adyen-container");


    }


    $('#country-dropdown').change(function () {
        if (dropinComponent) {
            dropinComponent.unmount('#adyen-countainer');
        }
        console.log('country changed');
        initAdyen();

    });
    $('#currency-dropdown').change(function () {
        if (dropinComponent) {
            dropinComponent.unmount('#adyen-countainer');
        }
        console.log('currency changed');
        initAdyen();
    });
    $('#country-dropdown').change(function () {

    });


    $('.toggle-stored-payments-input input').on('change', function () {
        if (dropinComponent) {
            dropinComponent.unmount('#adyen-countainer');
        }

        if ($(this).is(':checked')) {

            console.log('Stored changed true');
            dropInConfig.showStoredPaymentMethods = true;

        }
        else {
            console.log('Stored changed false');
            dropInConfig.showStoredPaymentMethods = false;

        }
        initAdyen();
    });
    $('.language-dropdown select').change(function () {

        configuration.locale = $(this).val();
        console.log('locale change', configuration);
        if (dropinComponent) {
            dropinComponent.unmount('#adyen-countainer');
        }
        initAdyen();

    });

    $('.toggle-billing-address-input input').on('change', function () {
        if (dropinComponent) {
            dropinComponent.unmount('#adyen-countainer');
        }
        if ($(this).is(':checked')) {

            console.log('Address changed true');
            configuration.paymentMethodsConfiguration.card.billingAddressRequired = true;

        }
        else {
            console.log('Address changed false');
            configuration.paymentMethodsConfiguration.card.billingAddressRequired = false;

        }
        initAdyen();
    });
    $('.toggle-holder-name-input input').on('change', function () {
        if (dropinComponent) {
            dropinComponent.unmount('#adyen-countainer');
        }
        if ($(this).is(':checked')) {

            console.log('holder changed true');
            configuration.paymentMethodsConfiguration.card.hasHolderName = true;

        }
        else {
            console.log('holder changed false');
            configuration.paymentMethodsConfiguration.card.hasHolderName = false;

        }
        initAdyen();
    });



    $('.toggle-open-first-input input').on('change', function () {
        if (dropinComponent) {
            dropinComponent.unmount('#adyen-countainer');
        }
        if ($(this).is(':checked')) {

            console.log('Open first changed true');
            dropInConfig.openFirstPaymentMethod = true;

        }
        else {
            console.log('Open first changed false');
            dropInConfig.openFirstPaymentMethod = false;

        }
        initAdyen();
    });

    $('.toggle-store-data input').on('change', function () {
        if (dropinComponent) {
            dropinComponent.unmount('#adyen-countainer');
        }
        if ($(this).is(':checked')) {
            console.log('store changed true');

            configuration.paymentMethodsConfiguration.card.enableStoreDetails = true;

        }
        else {
            console.log('store changed false');

            configuration.paymentMethodsConfiguration.card.enableStoreDetails = false;


        }
        initAdyen();
    });

    $('.toggle-hide-cvv-input input').on('change', function () {
        if (dropinComponent) {
            dropinComponent.unmount('#adyen-countainer');
        }
        if ($(this).is(':checked')) {

            console.log('cvv changed true');

            configuration.paymentMethodsConfiguration.card.hideCVC = true;
            configuration.paymentMethodsConfiguration.storedCard.hideCVC = true;
        }
        else {
            console.log('cvv changed false');

            configuration.paymentMethodsConfiguration.card.hideCVC = false;
            configuration.paymentMethodsConfiguration.storedCard.hideCVC = false;

        }
        initAdyen();
    });


});