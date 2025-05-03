$(document).ready(function () {
    function generateServiceID() {
        return `${Date.now().toString(36)}`;
    }

    // Function to make an API call
    function callAPI(apiUrl, raw,headersSent, callback) {
        // Convert the data object to a JSON strings
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
                console.log(response);
                callback(response); // Call the callback function with the response data
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error('Error:', textStatus, errorThrown);
                console.error('error', jqXHR);
                // You can handle error cases here
            }
        });
    }

    // Replace this with your actual API endpoint
    getWebhooks();
    function getWebhooks() {
        var getwebhookrequestBody = {
            "ecomMerchantAccount": JSON.parse(sessionStorage.connectionConfig).configuration.ecomMerchantAccount,
            "posMerchantAccount":JSON.parse(sessionStorage.connectionConfig).configuration.posMerchantAccount
        }
        console.log(getwebhookrequestBody);
        var raw = JSON.stringify(getwebhookrequestBody);
        var headersSent = {
            
        }
        callAPI('./../utils/getwebhooks.php', raw,headersSent, function (response) {
            const sampleApiResponse = response;
            const table = document.querySelector('tbody');
            var originalPspReferences = [];
            sampleApiResponse.forEach(item => {
                console.log("TEST",item.content);
                const newitem = JSON.parse(item.content);

                if (newitem.notificationItems[0].NotificationRequestItem.eventCode == "AUTHORISATION" | newitem.notificationItems[0].NotificationRequestItem.eventCode == "REFUND" | newitem.notificationItems[0].NotificationRequestItem.eventCode == "CANCEL_OR_REFUND") {

                    if ((newitem.notificationItems[0].NotificationRequestItem.eventCode == "REFUND" | newitem.notificationItems[0].NotificationRequestItem.eventCode == "CANCEL_OR_REFUND"  )& newitem.notificationItems[0].NotificationRequestItem.success == "true") {
                        originalPspReferences.push(newitem.notificationItems[0].NotificationRequestItem.originalReference);
                    }

                    table.innerHTML += `
                <tr class="hoverable">
                    <td class="success">${newitem.notificationItems[0].NotificationRequestItem.success == "true" ? "<img class=\"sucess-img\" title=\"Success\" src=\"./../images/success.svg\"/>" : "<img class=\"fail-img\" title=\"Failure\" src=\"./../images/failure.svg\"/>"}</td>
                    <td class="merchantCode">${newitem.notificationItems[0].NotificationRequestItem.merchantAccountCode}</td>
                    <td class="pspReference">${newitem.notificationItems[0].NotificationRequestItem.pspReference}</td>
                    <td class="originalReference">${(newitem.notificationItems[0].NotificationRequestItem.eventCode == "REFUND" | newitem.notificationItems[0].NotificationRequestItem.eventCode == "CANCEL_OR_REFUND" )? newitem.notificationItems[0].NotificationRequestItem.originalReference : ""}</td>
                    <td>${newitem.notificationItems[0].NotificationRequestItem.merchantReference}</td>
                    <td>${newitem.notificationItems[0].NotificationRequestItem.paymentMethod}</td>
                    <td class="eventDate">${newitem.notificationItems[0].NotificationRequestItem.eventDate}</td>
                    <td>${newitem.notificationItems[0].NotificationRequestItem.eventCode}</td>
                    <td>${newitem.notificationItems[0].NotificationRequestItem.success == "false" ? newitem.notificationItems[0].NotificationRequestItem.reason : ""}</td>
                    <td class="amount">${((newitem.notificationItems[0].NotificationRequestItem.amount.value) / 100).toFixed(2)} ${newitem.notificationItems[0].NotificationRequestItem.amount.currency}</td>
                    <td class="">${(newitem.notificationItems[0].NotificationRequestItem.success == "true" & newitem.notificationItems[0].NotificationRequestItem.eventCode == "AUTHORISATION" & $.inArray(newitem.notificationItems[0].NotificationRequestItem.pspReference, originalPspReferences) == -1) ? "<img class=\"refund-online-btn\" title=\"Refund Online\" src=\"./../images/refund.svg\"/>" : ""}</td>
                    <td class="actions">${(newitem.notificationItems[0].NotificationRequestItem.success == "true" & newitem.notificationItems[0].NotificationRequestItem.eventCode == "AUTHORISATION" & $.inArray(newitem.notificationItems[0].NotificationRequestItem.pspReference, originalPspReferences) == -1) ? "<img class=\"refund-instore-btn\" title=\"Refund In Store\" src=\"./../images/refund.svg\"/>" : ""}</td>
              
                </tr>
            `;
                }
            });
        });
    };

    $('.refresh').click(function () {
        const table = document.querySelector('tbody');
        table.innerHTML = '';
        getWebhooks();
    });

    $('.styled-table').on('click', '.refund-online-btn', function () {

        var pspReference = $(this).closest('.hoverable').find('.pspReference').text();
        var amountValue = (parseFloat($(this).closest('.hoverable').find('.amount').text().split(' ')[0]) * 100).toFixed(0);
        var amountCurrency = $(this).closest('.hoverable').find('.amount').text().split(' ')[1];

        console.log(pspReference);
        console.log(amountValue);
        console.log(amountCurrency);

        var refundReuqestBody = `
{
    "request":{
    "merchantAccount": "${JSON.parse(sessionStorage.connectionConfig).configuration.ecomMerchantAccount}",
    "amount": {
        "value": ${amountValue},
        "currency": "${amountCurrency}"
    },
    "reference": "${generateServiceID()}"
},
"pspReference":"${pspReference}"
}

`;

        console.log('refundReuqestBody', refundReuqestBody);
        var headersSent = {
            'X-API-Key': JSON.parse(sessionStorage.connectionConfig).configuration.apiKeyECOM 
        }
        callAPI('./../utils/refund.php', refundReuqestBody,headersSent,function (response) {
            console.log(response);
        });

    });


    $('.styled-table').on('click', '.refund-instore-btn', function () {

        var pspReference = $(this).closest('.hoverable').find('.pspReference').text();
        var amountValue = (parseFloat($(this).closest('.hoverable').find('.amount').text().split(' ')[0]) * 100).toFixed(0);
        var amountCurrency = $(this).closest('.hoverable').find('.amount').text().split(' ')[1];
        var eventDate = $(this).closest('.hoverable').find('.eventDate').text();
        console.log(eventDate);
        // Input date and time with time zone offset
        var inputDateTime = new Date(eventDate);

        // Get the equivalent UTC date and time
        var utcDateTime = new Date(inputDateTime.toISOString());

        // Format the UTC date and time as a string
        var utcDateTimeString = utcDateTime.toISOString();

        console.log(utcDateTimeString);
        console.log(pspReference);
        console.log(amountValue);
        console.log(amountCurrency);

        var refundReuqestBody = `
    {
        "SaleToPOIRequest":{
            "MessageHeader":{
                "ProtocolVersion":"3.0",
                "MessageClass":"Service",
                "MessageCategory":"Reversal",
                "MessageType":"Request",
                "SaleID":"POSSystemID12345",
                "ServiceID":"${generateServiceID()}",
                "POIID":"${JSON.parse(sessionStorage.connectionConfig).configuration.terminalID}"
            },
            "ReversalRequest":{
                "OriginalPOITransaction":{
                    "POITransactionID":{
                        "TransactionID":".${pspReference}",
                        "TimeStamp":"${utcDateTimeString}"
                    }
                },
                "ReversalReason":"MerchantCancel"
            }
        }
    }
    
    
    `;

        console.log('refundReuqestBody', refundReuqestBody);
        var headersSent = {
            'X-API-Key': JSON.parse(sessionStorage.connectionConfig).configuration.apiKeyECOM 
        }

        callAPI('./../utils/payment.php', refundReuqestBody,headersSent, function (response) {
            console.log(response);
        })




    });

});