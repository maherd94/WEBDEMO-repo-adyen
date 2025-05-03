$(document).ready(function(){

    if (typeof (Storage) !== "undefined") {
    //sessionStorage.clear();
    }
    $('.ecom').click(function(){
        if (typeof (Storage) !== "undefined") {
            // Retrieve cartItems from sessionStorage
           sessionStorage.setItem('demoType','ECOM');
           window.location.href = 'index.html';
        }
    });
    $('.pos').click(function(){
        if (typeof (Storage) !== "undefined") {
            // Retrieve cartItems from sessionStorage
           sessionStorage.setItem('demoType','POS');
           window.location.href = 'index.html';
        }
    });
    $('.hotel').click(function(){
        if (typeof (Storage) !== "undefined") {
            // Retrieve cartItems from sessionStorage
           sessionStorage.setItem('demoType','HOTEL');
           window.location.href = 'hotelonline.html';
        }
    });


});