function isInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)

  );
}

function wobbleAnimation() {
  var wobbleElements = document.querySelectorAll(".wobble:not([data-animate-once])");
  wobbleElements.forEach(function (el) {
    if (isInViewport(el)) {
      if (
        !el.classList.contains("animating") &&
        !el.classList.contains("mouseover")
      ) {
        el.classList.add("animating", "mouseover");

        var letters = el.innerText.split("");

        setTimeout(function () {
          el.classList.remove("animating");
        }, (letters.length + 1) * 50);

        var animationName = el.dataset.animation;
        if (!animationName) {
          animationName = "jump";
        }

        el.innerText = "";

        letters.forEach(function (letter) {
          if (letter == " ") {
            letter = "&nbsp;";
          }
          el.innerHTML += '<span class="letter">' + letter + "</span>";
        });

        var letterElements = el.querySelectorAll(".letter");
        letterElements.forEach(function (letter, i) {
          setTimeout(function () {
            letter.classList.add(animationName);
          }, 50 * i);
        });
      }
      el.addEventListener("animationend", function () {
        el.classList.remove("mouseover");
      });
      el.dataset.animateOnce = "true";
    } else console.log(el," not in view");
  })
}



document.addEventListener("DOMContentLoaded", function () {

  document.getElementById("content-gap").style.marginTop = window.innerHeight + "px";
  // preload
  if (getCookie("theme") === "") {
    setCookie("theme", "light", 30);
    document
      .querySelector("head")
      .insertAdjacentHTML(
        "beforeend",
        `<link type="text/css" rel="stylesheet" href="view/css/theme/light.css" />`
      );
  } else if (getCookie("theme") === "dark") {
    document
      .querySelector("head")
      .insertAdjacentHTML(
        "beforeend",
        `<link type="text/css" rel="stylesheet" href="view/css/theme/dark.css" />`
      );
  } else if (getCookie("theme") === "light") {
    document
      .querySelector("head")
      .insertAdjacentHTML(
        "beforeend",
        `<link type="text/css" rel="stylesheet" href="view/css/theme/light.css" />`
      );
  }
  setTimeout(function () {
    document.querySelector("pre-loader").style.display = "none"; // hide
    document.querySelector("main-page").style.display = "block"; // show
    wobbleAnimation();
  }, 1000);

  //   intro animation
  var mousePos = {};

  function getRandomInt(min, max) {
    return Math.round(Math.random() * (max - min + 1)) + min;
  }
  function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
      : {
        r: null,
        g: null,
        b: null,
      }
  }
  var timer;
var timeout = function () {
  mousePos.x = -1;
  mousePos.y = -1;
}
  timer = setTimeout(timeout, 30);
  document.getElementById("wrap").addEventListener("mousemove", function (e) {
    mousePos.x = e.pageX;
    mousePos.y = e.pageY;
    clearTimeout(timer);
    timer = setTimeout(timeout, 30);
  });

  // document.getElementById("wrap").addEventListener("mouseleave", function (e) {
  //   mousePos.x = -1;
  //   mousePos.y = -1;
  // });

  var draw = setInterval(function () {
    var range = 15;
    var sizeInt = getRandomInt(20, 30);
    if (window.innerWidth < 800) {
      range = 1000;
      sizeInt = getRandomInt(10, 50);
        mousePos.x = window.innerWidth/2;
        mousePos.y = window.innerHeight/2;
    }
    if (mousePos.x > 0 && mousePos.y > 0) {

      var colorList = [
        "#80ffec",
        "#4dffe5",
        "#00e6c4",
        "#00b398",
        "#00806d",

        "#fe819e",
        "#fd4e78",
        "#fd1c51",
        "#e30237",
        "#e30237",

        "#737373",
        "#a6a6a6",
        "#8c8c8c",
        "#595959",
      ];
      var colorCode = colorList[getRandomInt(0, colorList.length - 1)];
      var colorRGB = hexToRgb(colorCode);
      var color =
        "background: transparent; border: 2px solid " +
        colorCode +
        "; box-shadow: 0 0 14px rgba(" +
        colorRGB.r +
        ", " +
        colorRGB.g +
        ", " +
        colorRGB.b +
        ", 0.6);";

      var size = "height: " + sizeInt + "px; width: " + sizeInt + "px;";

      var left =
        "left: " +
        getRandomInt(mousePos.x - range - sizeInt, mousePos.x + range) +
        "px;";

      var top =
        "top: " +
        getRandomInt(mousePos.y - range - sizeInt, mousePos.y + range) +
        "px;";

      var style = left + top + color + size;
      const ball = document.createElement("div");
      ball.classList.add("ball");
      ball.setAttribute("style", style);
      ball.addEventListener("animationend", function (e) {
        this.parentNode.removeChild(this);
      });
      document.getElementById("wrap").appendChild(ball);
    }
  }, 10);


  // intro image animation
  var introImageEle = document.getElementById("intro-image");
  introImageEle.addEventListener("mousemove", function (e) {
    introImageEle.style.opacity = 0.8;
  });

  introImageEle.addEventListener("mouseleave", function (e) {
    introImageEle.style.opacity = 0.4;
  });

  //theme toogle
  document
    .querySelector("#theme-toogle-button")
    .addEventListener("click", function (e) {
      if (getCookie("theme") === "") {
        setCookie("theme", "dark", 30);
        document
          .querySelector("head")
          .insertAdjacentHTML(
            "beforeend",
            `<link type="text/css" rel="stylesheet" href="view/css/theme/dark.css" />`
          );
      } else if (getCookie("theme") === "dark") {
        setCookie("theme", "light", 30);
        document
          .querySelector("head")
          .insertAdjacentHTML(
            "beforeend",
            `<link type="text/css" rel="stylesheet" href="view/css/theme/light.css" />`
          );
      } else if (getCookie("theme") === "light") {
        setCookie("theme", "dark", 30);
        document
          .querySelector("head")
          .insertAdjacentHTML(
            "beforeend",
            `<link type="text/css" rel="stylesheet" href="view/css/theme/dark.css" />`
          );
      }
    });

  //nav toogle
  document
    .querySelector("#nav-menu-button")
    .addEventListener("click", function (e) {
      var menuBtn = document.querySelector("#nav-menu");
      menuBtn.classList.toggle("mobile-nav-menu");
      setTimeout(function () {
        (menuBtn.style.display === "block") ? menuBtn.style.display = "none" : menuBtn.style.display = "block"
      }, 100);

    });
});



//animation text
function addListenerMulti(element, eventNames, listener) {
  var events = eventNames.split(' ');
  for (var i=0, iLen=events.length; i<iLen; i++) {
    element.addEventListener(events[i], listener, false);
  }
}
var wobbleElements = document.querySelectorAll(".wobble");
wobbleElements.forEach(function (el) {
addListenerMulti(el, 'mouseover click', function(){
    if (
      !el.classList.contains("animating") &&
      !el.classList.contains("mouseover")
    ) {
      el.classList.add("animating", "mouseover");

      var letters = el.innerText.split("");

      setTimeout(function () {
        el.classList.remove("animating");
      }, (letters.length + 1) * 50);

      var animationName = el.dataset.animation;
      if (!animationName) {
        animationName = "jump";
      }

      el.innerText = "";

      letters.forEach(function (letter) {
        if (letter == " ") {
          letter = "&nbsp;";
        }
        el.innerHTML += '<span class="letter">' + letter + "</span>";
      });

      var letterElements = el.querySelectorAll(".letter");
      letterElements.forEach(function (letter, i) {
        setTimeout(function () {
          letter.classList.add(animationName);
        }, 50 * i);
      });
    }
  });
  el.addEventListener("animationend", function () {
    el.classList.remove("mouseover");
  });
})

window.addEventListener("scroll", wobbleAnimation);