$(document).ready(function () {

    var getShopperInfoRequestBody;
    function generateISOTimestamp() {
        return new Date().toISOString();
    }

    function generateServiceID() {
        return Date.now().toString(36);
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


    function getAndDisplayshopper(shopperEmail, doitflag) {
        getShopperInfoRequestBody = { "shopperEmail": shopperEmail };
        var getShopperInfoResponseBody;
        var shopper_Name;
        var shopper_Email;
        var shopper_ID;
        var shopper_loyaltyPoints;
        var raw = JSON.stringify(getShopperInfoRequestBody);
        if (doitflag) {
            var headersSent = {

            }
            callAPI('./../utils/getShopperInfo.php', raw, headersSent, function (response) {

                // getShopperInfoResponseBody = JSON.parse(response);
                //console.log(response)
                getShopperInfoResponseBody = response;
                shopper_Email = getShopperInfoResponseBody[0].shopperEmail
                shopper_ID = getShopperInfoResponseBody[0].shopperID
                shopper_Name = getShopperInfoResponseBody[0].shopperName
                shopper_loyaltyPoints = getShopperInfoResponseBody[0].shopperLoyaltyPoints
                if (sessionStorage.demoType) {
                    $('.shopper').html(`Welcome back <b>${shopper_Name}<b>`);

                    $('.spinner').addClass('hide');
                    $('.shopperDetails').removeClass('hide');


                    $('.shopperName').html(`${shopper_Name}`);
                    $('.loyaltyPoints').html(`${shopper_loyaltyPoints}`);
                    sessionStorage.setItem('shopper', shopper_Name);
                    return;

                }
                sessionStorage.setItem('shopper', shopper_Name);
                $('.shopper').html(`Welcome back <b>${shopper_Name}<b>`);

                $('.spinner').addClass('hide');
                $('.shopperDetails').removeClass('hide');
                $('.shopperName').html(`${shopper_Name}`);
                $('.loyaltyPoints').html(`${shopper_loyaltyPoints}`);

            });

        }
        else {
            shopper_Name = sessionStorage.getItem('shopper');
            $('.shopper').html(`Welcome back <b>${shopper_Name}<b>`);
            $('.shopperName').html(`${shopper_Name}`);


        }

    }
    var demoType;
    var getShopperEmailRequestBody =
    {
        "SaleToPOIRequest": {
            "MessageHeader": {
                "ProtocolVersion": "3.0",
                "MessageClass": "Device",
                "MessageCategory": "Input",
                "MessageType": "Request",
                "ServiceID": generateServiceID(),
                "SaleID": "POSSystemID12345",
                "POIID": JSON.parse(sessionStorage.connectionConfig).configuration.terminalID
            },
            "InputRequest": {
                "DisplayOutput": {
                    "Device": "CustomerDisplay",
                    "InfoQualify": "Display",
                    "OutputContent": {
                        "OutputFormat": "Text",
                        "PredefinedContent": {
                            "ReferenceID": "GetText"
                        },
                        "OutputText": [
                            {
                                "Text": "Enter your email address:"
                            }
                        ]
                    }
                },
                "InputData": {
                    "Device": "CustomerInput",
                    "InfoQualify": "Input",
                    "InputCommand": "TextString",
                    "MaxInputTime": 120,
                    "DefaultInputString": "name@domain.com",
                    "MaskCharactersFlag": false
                }
            }
        }
    };


    if (typeof (Storage) !== "undefined") {
        // Retrieve cartItems from sessionStorage
        demoType = sessionStorage.getItem('demoType');
    }

    if (demoType == 'POS') {
        if(!JSON.parse(sessionStorage.settingconfig).identifyShopper){
            sessionStorage.setItem('shopper','Demo Shopper');
        }
        if (!sessionStorage.shopper) {
            $("#overlay, #popup").fadeIn();
            var apiUrl = "./../utils/payment.php";
            var raw = JSON.stringify(getShopperEmailRequestBody);
            var shopperEmail;
            var getShopperEmailResponseBody;
            var headersSent = {
                'X-API-Key': JSON.parse(sessionStorage.connectionConfig).configuration.apiKeyPOS
            }
           // callAPI(apiUrl, raw, headersSent, function (response) {

              //  console.log('getShopperEmailResponseBody', JSON.parse(response));
             //   getShopperEmailResponseBody = JSON.parse(response);
                // if (getShopperEmailResponseBody.SaleToPOIResponse.InputResponse.InputResult.Response.Result == 'Success') {
                //     shopperEmail = getShopperEmailResponseBody.SaleToPOIResponse.InputResponse.InputResult.Input.TextInput;
                //     getAndDisplayshopper(shopperEmail, true);
                // } else {

                // }
                getAndDisplayshopper("shopper@adyen.com", true);
                setTimeout(() => {
                    
                }, (2000));
           // });

        } else {
            getAndDisplayshopper(sessionStorage.shopper, false);
            setTimeout(() => {
                    
            }, (2000));
        }

    }

    $("#closePopupButton, #overlay").click(function () {

        $("#overlay, #popup").fadeOut();
        $('.spinner').removeClass('hide');
    });


    $('.tokenize-card-btn').click(function () {
        var getSignatureRequestBody = {
            "SaleToPOIRequest": {
                "MessageHeader": {
                    "ProtocolVersion": "3.0",
                    "MessageClass": "Device",
                    "MessageCategory": "Input",
                    "MessageType": "Request",
                    "ServiceID": generateServiceID(),
                    "SaleID": "POSSystemID12345",
                    "POIID": JSON.parse(sessionStorage.connectionConfig).configuration.terminalID
                },
                "InputRequest": {
                    "DisplayOutput": {
                        "Device": "CustomerDisplay",
                        "InfoQualify": "Display",
                        "OutputContent": {
                            "OutputFormat": "Text",
                            "PredefinedContent": {
                                "ReferenceID": "GetSignature"
                            },
                            "OutputText": [
                                {
                                    "Text": "Accept Card tokenization by signing here"
                                },
                                {
                                    "Text": "Card details will be saved for future auto-payments"
                                }
                            ]
                        }
                    },
                    "InputData": {
                        "Device": "CustomerInput",
                        "InfoQualify": "Input",
                        "InputCommand": "GetConfirmation",
                        "MaxInputTime": 120
                    }
                }
            }
        };

        var apiUrl = "./../utils/payment.php";
        var raw = JSON.stringify(getSignatureRequestBody);
        var shopperEmail;
        var getSignatureResponseBody;
        var headersSent = {
            'X-API-Key': JSON.parse(sessionStorage.connectionConfig).configuration.apiKeyPOS
        }
        // callAPI(apiUrl, raw, headersSent, function (response) {
            var tokenizationRequestBody = {
                "SaleToPOIRequest": {
                    "MessageHeader": {
                        "ProtocolVersion": "3.0",
                        "MessageClass": "Service",
                        "MessageCategory": "Payment",
                        "MessageType": "Request",
                        "SaleID": "POSSystemID12345",
                        "ServiceID": generateServiceID(),
                        "POIID": JSON.parse(sessionStorage.connectionConfig).configuration.terminalID
                    },
                    "PaymentRequest": {
                        "SaleData": {
                            "SaleTransactionID": {
                                "TransactionID": generateServiceID(),
                                "TimeStamp": generateISOTimestamp()
                            },
                            "SaleToAcquirerData": "recurringProcessingModel=UnscheduledCardOnFile&shopperReference=DEMO_2245678&shopperEmail=shopper@adyen.com",
                            "TokenRequestedType": "Customer"
                        },
                        "PaymentTransaction": {
                            "AmountsReq": {
                                "Currency": "AED",
                                "RequestedAmount": 0
                            }
                        }
                    }
                }
            };
            
            var apiUrl1 = "./../utils/payment.php";
            var raw1 = JSON.stringify(tokenizationRequestBody);
            var shopperEmail;
            var tokenizationResponseBody;
            var headersSent1 = {
                'X-API-Key': JSON.parse(sessionStorage.connectionConfig).configuration.apiKeyPOS
            }

            callAPI(apiUrl1, raw1, headersSent1, function (response) {



                tokenizationResponseBody = JSON.parse(response);
                console.log(tokenizationResponseBody);

                var additionalResponse = tokenizationResponseBody.SaleToPOIResponse.PaymentResponse.Response.AdditionalResponse;
                var regex = /recurringDetailReference=([^&]+)/;
                var match = regex.exec(additionalResponse);

                if (match) {
                    var result = match[1];
                    sessionStorage.setItem('recurringDetailReference',result);
                    console.log('recurringDetailReference',result);
                } else {
                    console.log("Pattern not found in the input string.");
                }







            });
        });
    // });

});