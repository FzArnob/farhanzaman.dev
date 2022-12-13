document.addEventListener("DOMContentLoaded", function () {
    document.querySelector("#theme-toogle-button").addEventListener('click', function (e) {

    });
    document.querySelectorAll(".bar-item").forEach(barItem => {
        barItem.addEventListener('mouseover', function(e){
            console.log("mouse");
            barItem.childNodes[0].className = 'bar-item-icon open';
        });
    });
});