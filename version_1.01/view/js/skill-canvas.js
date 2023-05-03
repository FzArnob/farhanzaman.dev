function getRandomInt(min, max) {
    return Math.round(Math.random() * (max - min + 1)) + min;
}
document.addEventListener("DOMContentLoaded", function () {
    var tags = document.querySelectorAll("#tags a");
    var canvas = document.getElementById("skill-canvas");
    var context = canvas.getContext("2d");
    var textSize = 15;
    if(window.innerWidth < 600){
    textSize = 12;
    canvas.setAttribute("width", window.innerWidth-100);
        canvas.setAttribute("height", window.innerWidth-100);
    }
        else if (window.innerWidth > 1200){
    textSize = 20;
    canvas.setAttribute("width", 600);
            canvas.setAttribute("height", 600);
} else{
    textSize = 15;
    canvas.setAttribute("width", (window.innerWidth/2));
    canvas.setAttribute("height", (window.innerWidth/2));
}

    if (typeof TagCanvas !== "undefined") {
        TagCanvas.Start("skill-canvas", "tags", {
            textFont: "Segoe UI",
            textColour: "#00d3b4",
            weight: true,
            weightFrom: "data-weight",
            weightSize: 5,
            textHeight: textSize,
            weightGradient: {
                0: "#f00",
                0.33: "#ff0",
                0.66: "#0f0",
                1: "#00f"
            },
            outlineOffset: 4,
            outlineRadius: 6,
            outlineMethod: 'colour',
            outlineColour: "#fd2155",
            reverse: true,
            depth: 0.8,
            maxSpeed: 0.05,
            initial: [0.1, -0.1],
            decel: 0.98,
            fadeIn: 1000,
            radiusX: 1,
            radiusY: 1,
            wheelZoom: false,
            zooM: 1
        });
    } else {
        console.error("TagCanvas not found");
        canvas.style.display = "none";
    }
    for (var i = 0; i < tags.length; i++) {
        if(window.innerWidth < 600){
        tags[i].setAttribute("data-weight", Math.random() * 10);
        } else {
        tags[i].setAttribute("data-weight", Math.random() * 25);

        }
        tags[i].addEventListener("click", function (event) {
            event.preventDefault();
            TagCanvas.TagToFront(this, {
                active: true
            });
        });
    }
});
