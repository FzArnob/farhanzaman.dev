// ================================================= Cookies Handler =================================================
function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}
function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  let expires = "expires=" + d.toUTCString();
  document.cookie =
    cname + "=" + cvalue + "; " + expires + "; path=/; SameSite=Strict";
}
function deleteCookie(cname) {
  document.cookie =
    cname + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict";
}

// ================================================= Utilities Handler =================================================
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.bottom >= 0 &&
    rect.left <= (window.innerWidth || document.documentElement.clientWidth) &&
    rect.right >= 0
  );
}

navClick = false;

function handleNavScroll() {
  if (!navClick) {
    const sections = document.querySelectorAll("section.nav-section");
    const visibleSections = Array.from(sections).filter((section) =>
      isInViewport(section)
    );

    let mostVisibleSection = null;
    let mostVisiblePercentage = 0;

    visibleSections.forEach((section) => {
      const sectionId = section.getAttribute("id");
      const correspondingNavLink = document.querySelector(
        `a[href="#${sectionId}"]`
      );

      const visiblePercentage = calculateVisiblePercentage(section);

      if (visiblePercentage > mostVisiblePercentage) {
        mostVisibleSection = section;
        mostVisiblePercentage = visiblePercentage;
      }

      if (correspondingNavLink.classList.contains("active")) {
        correspondingNavLink.classList.remove("active");
      }
    });

    if (mostVisibleSection) {
      const mostVisibleNavLink = document.querySelector(
        `a[href="#${mostVisibleSection.getAttribute("id")}"]`
      );
      mostVisibleNavLink.classList.add("active");
    }
  }
}

function calculateVisiblePercentage(element) {
  const rect = element.getBoundingClientRect();
  const windowHeight =
    window.innerHeight || document.documentElement.clientHeight;
  const visibleHeight =
    Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
  return (visibleHeight / element.offsetHeight) * 100;
}

// Add scroll event listener to the window
window.addEventListener("scroll", handleNavScroll);

function wobbleAnimation() {
  // NAV Bar back color change
  const navbar = document.getElementById("navbar");
  const scrollHeight = 70;

  if (window.scrollY > scrollHeight) {
    navbar.classList.add("bg2");
    navbar.classList.add("nav-shadow");
  } else {
    navbar.classList.remove("bg2");
    navbar.classList.remove("nav-shadow");
  }

  var wobbleElements = document.querySelectorAll(
    ".wobble:not([data-animate-once])"
  );
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
            el.innerHTML += '<span class="letter">' + letter + "</span>";
            '<span class="letter">' + letter + "</span>";
          } else if (letter == "$") {
            letter = "<br/>";
            el.innerHTML += letter;
          } else el.innerHTML += '<span class="letter">' + letter + "</span>";
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
    }
    // else console.log(el," not in view");
  });
}
// preload
if (getCookie("theme") === "") {
  var themePopUp = document.getElementById("theme-popup");
  themePopUp.addEventListener("click", function () {
    themePopUp.style.display = "none";
  });
  themePopUp.style.display = "block";
  setCookie("theme", "dark", 30);
  document
    .querySelector("head")
    .insertAdjacentHTML(
      "beforeend",
      `<link type="text/css" rel="stylesheet" href="view/css/theme/dark.css" data-theme="dark" />`
    );
} else if (getCookie("theme") === "dark") {
  document
    .querySelector("head")
    .insertAdjacentHTML(
      "beforeend",
      `<link type="text/css" rel="stylesheet" href="view/css/theme/dark.css" data-theme="dark" />`
    );
} else if (getCookie("theme") === "light") {
  document
    .querySelector("head")
    .insertAdjacentHTML(
      "beforeend",
      `<link type="text/css" rel="stylesheet" href="view/css/theme/light.css" data-theme="light" />`
    );
}

//theme toogle
document
  .querySelector("#theme-toogle-button")
  .addEventListener("click", function (e) {
    var existingLinks = document.querySelectorAll("head link[data-theme]");

    if (existingLinks.length > 0) {
      setTimeout(function () {
        existingLinks.forEach((existingLink) => {
          existingLink.remove();
        });
      }, 1000);
    }

    if (getCookie("theme") === "dark") {
      setCookie("theme", "light", 30);
      document
        .querySelector("head")
        .insertAdjacentHTML(
          "beforeend",
          `<link type="text/css" rel="stylesheet" href="view/css/theme/light.css" data-theme="light" />`
        );
    } else if (getCookie("theme") === "light") {
      setCookie("theme", "dark", 30);
      document
        .querySelector("head")
        .insertAdjacentHTML(
          "beforeend",
          `<link type="text/css" rel="stylesheet" href="view/css/theme/dark.css" data-theme="dark" />`
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
      menuBtn.style.display === "block"
        ? (menuBtn.style.display = "none")
        : (menuBtn.style.display = "block");
    }, 100);
  });

// nav links highlight

// Get all the navigation links
const navLinks = document.querySelectorAll(".nav-links");

// Loop through each navigation link and add the event listener
navLinks.forEach((link) => {
  link.addEventListener("click", function (event) {
    navClick = true;
    // Remove the "active" class from all navigation links
    navLinks.forEach((link) => {
      link.classList.remove("active");
    });

    // Add the "active" class to the clicked navigation link
    this.classList.add("active");

    var menuBtn = document.querySelector(".mobile-nav-menu");
    if (menuBtn) {
      menuBtn.classList.toggle("mobile-nav-menu");
      setTimeout(function () {
        menuBtn.style.display === "block"
          ? (menuBtn.style.display = "none")
          : (menuBtn.style.display = "block");
      }, 200);
    }
    setTimeout(function () {
      navClick = false;
    }, 2000);
  });
});

//animation text
function addListenerMulti(element, eventNames, listener) {
  var events = eventNames.split(" ");
  for (var i = 0, iLen = events.length; i < iLen; i++) {
    element.addEventListener(events[i], listener, false);
  }
}
var wobbleElements = document.querySelectorAll(".wobble");
wobbleElements.forEach(function (el) {
  addListenerMulti(el, "mouseover click", function () {
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
});

window.addEventListener("scroll", wobbleAnimation);

// back to top button
window.addEventListener("scroll", function () {
  var button = document.getElementById("back-to-top-btn");
  if (window.pageYOffset > 300) {
    button.classList.add("show");
  } else {
    button.classList.remove("show");
  }
});

document
  .getElementById("back-to-top-btn")
  .addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

// PARTICLE NETWORK ANIMATION
(function () {
  var ParticleNetworkAnimation, PNA;
  ParticleNetworkAnimation = PNA = function () {};

  PNA.prototype.init = function (element) {
    this.el = element;

    this.container = element;
    this.canvas = document.createElement("canvas");
    this.sizeCanvas();
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d");
    this.particleNetwork = new ParticleNetwork(this);

    this.bindUiActions();

    return this;
  };

  PNA.prototype.bindUiActions = function () {
    var self = this;

    window.addEventListener("resize", function () {
      self.ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);
      self.sizeCanvas();
      self.particleNetwork.createParticles();
    });
  };

  PNA.prototype.sizeCanvas = function () {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  };

  var Particle = function (parent, x, y) {
    this.network = parent;
    this.canvas = parent.canvas;
    this.ctx = parent.ctx;
    this.particleColor = returnRandomArrayitem(
      this.network.options.particleColors
    );
    this.radius = getLimitedRandom(1.5, 2.5);
    this.opacity = 0;
    this.x = x || Math.random() * this.canvas.width;
    this.y = y || Math.random() * this.canvas.height;
    this.velocity = {
      x: (Math.random() - 0.5) * parent.options.velocity,
      y: (Math.random() - 0.5) * parent.options.velocity,
    };
  };

  Particle.prototype.update = function () {
    if (this.opacity < 1) {
      this.opacity += 0.01;
    } else {
      this.opacity = 1;
    }
    // Change dir if outside map
    if (this.x > this.canvas.width + 100 || this.x < -100) {
      this.velocity.x = -this.velocity.x;
    }
    if (this.y > this.canvas.height + 100 || this.y < -100) {
      this.velocity.y = -this.velocity.y;
    }

    // Update position
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  };

  Particle.prototype.draw = function () {
    // Draw particle
    this.ctx.beginPath();
    this.ctx.fillStyle = this.particleColor;
    this.ctx.globalAlpha = this.opacity;
    this.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    this.ctx.fill();
  };

  var ParticleNetwork = function (parent) {
    this.options = {
      velocity: 1, // the higher the faster
      density: 15000, // the lower the denser
      netLineDistance: 200,
      netLineColor: "#9a9a9a",
      particleColors: ["#9a9a9a"], // ['#6D4E5C', '#aaa', '#FFC458' ]
    };
    this.canvas = parent.canvas;
    this.ctx = parent.ctx;

    this.init();
  };

  ParticleNetwork.prototype.init = function () {
    // Create particle objects
    this.createParticles(true);

    // Update canvas
    this.animationFrame = requestAnimationFrame(this.update.bind(this));

    this.bindUiActions();
  };

  ParticleNetwork.prototype.createParticles = function (isInitial) {
    var me = this;
    this.particles = [];
    var quantity =
      (this.canvas.width * this.canvas.height) / this.options.density;

    if (isInitial) {
      var counter = 0;
      clearInterval(this.createIntervalId);
      this.createIntervalId = setInterval(
        function () {
          if (counter < quantity - 1) {
            // Create particle object
            this.particles.push(new Particle(this));
          } else {
            clearInterval(me.createIntervalId);
          }
          counter++;
        }.bind(this),
        250
      );
    } else {
      // Create particle objects
      for (var i = 0; i < quantity; i++) {
        this.particles.push(new Particle(this));
      }
    }
  };

  ParticleNetwork.prototype.createInteractionParticle = function () {
    // Add interaction particle
    this.interactionParticle = new Particle(this);
    this.interactionParticle.velocity = {
      x: 0,
      y: 0,
    };
    this.particles.push(this.interactionParticle);
    return this.interactionParticle;
  };

  ParticleNetwork.prototype.removeInteractionParticle = function () {
    // Find it
    var index = this.particles.indexOf(this.interactionParticle);
    if (index > -1) {
      // Remove it
      this.interactionParticle = undefined;
      this.particles.splice(index, 1);
    }
  };

  ParticleNetwork.prototype.update = function () {
    if (this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.globalAlpha = 1;

      // Draw connections
      for (var i = 0; i < this.particles.length; i++) {
        for (var j = this.particles.length - 1; j > i; j--) {
          var distance,
            p1 = this.particles[i],
            p2 = this.particles[j];

          // check very simply if the two points are even a candidate for further measurements
          distance = Math.min(Math.abs(p1.x - p2.x), Math.abs(p1.y - p2.y));
          if (distance > this.options.netLineDistance) {
            continue;
          }

          // the two points seem close enough, now let's measure precisely
          distance = Math.sqrt(
            Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)
          );
          if (distance > this.options.netLineDistance) {
            continue;
          }

          this.ctx.beginPath();
          this.ctx.strokeStyle = this.options.netLineColor;
          this.ctx.globalAlpha =
            ((this.options.netLineDistance - distance) /
              this.options.netLineDistance) *
            p1.opacity *
            p2.opacity;
          this.ctx.lineWidth = 0.7;
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.stroke();
        }
      }

      // Draw particles
      for (var i = 0; i < this.particles.length; i++) {
        this.particles[i].update();
        this.particles[i].draw();
      }

      if (this.options.velocity !== 0) {
        this.animationFrame = requestAnimationFrame(this.update.bind(this));
      }
    } else {
      cancelAnimationFrame(this.animationFrame);
    }
  };

  ParticleNetwork.prototype.bindUiActions = function () {
    var self = this;
    // Mouse / touch event handling
    this.spawnQuantity = 3;
    this.mouseIsDown = false;
    this.touchIsMoving = false;

    this.onMouseMove = function (e) {
      if (!this.interactionParticle) {
        this.createInteractionParticle();
      }
      this.interactionParticle.x = e.offsetX;
      this.interactionParticle.y = e.offsetY;
    };

    this.onTouchMove = function (e) {
      e.preventDefault();
      this.touchIsMoving = true;
      if (!this.interactionParticle) {
        this.createInteractionParticle();
      }
      this.interactionParticle.x = e.changedTouches[0].clientX;
      this.interactionParticle.y = e.changedTouches[0].clientY;
    };

    this.onMouseDown = function (e) {
      this.mouseIsDown = true;
      var counter = 0;
      var quantity = this.spawnQuantity;
      var intervalId = setInterval(
        function () {
          if (this.mouseIsDown) {
            if (counter === 1) {
              quantity = 1;
            }
            for (var i = 0; i < quantity; i++) {
              if (this.interactionParticle) {
                this.particles.push(
                  new Particle(
                    this,
                    this.interactionParticle.x,
                    this.interactionParticle.y
                  )
                );
              }
            }
          } else {
            clearInterval(intervalId);
          }
          counter++;
        }.bind(this),
        50
      );
    };

    this.onTouchStart = function (e) {
      e.preventDefault();
      setTimeout(
        function () {
          if (!this.touchIsMoving) {
            for (var i = 0; i < this.spawnQuantity; i++) {
              this.particles.push(
                new Particle(
                  this,
                  e.changedTouches[0].clientX,
                  e.changedTouches[0].clientY
                )
              );
            }
          }
        }.bind(this),
        200
      );
    };

    this.onMouseUp = function (e) {
      this.mouseIsDown = false;
    };

    this.onMouseOut = function (e) {
      this.removeInteractionParticle();
    };

    this.onTouchEnd = function (e) {
      e.preventDefault();
      this.touchIsMoving = false;
      this.removeInteractionParticle();
    };

    this.canvas.addEventListener("mousemove", this.onMouseMove.bind(self));
    this.canvas.addEventListener("touchmove", this.onTouchMove.bind(self));
    this.canvas.addEventListener("mousedown", this.onMouseDown.bind(self));
    this.canvas.addEventListener("touchstart", this.onTouchStart.bind(self));
    this.canvas.addEventListener("mouseup", this.onMouseUp.bind(self));
    this.canvas.addEventListener("mouseout", this.onMouseOut.bind(self));
    this.canvas.addEventListener("touchend", this.onTouchEnd.bind(self));
  };

  ParticleNetwork.prototype.unbindUiActions = function () {
    if (this.canvas) {
      this.canvas.removeEventListener("mousemove", this.onMouseMove);
      this.canvas.removeEventListener("touchmove", this.onTouchMove);
      this.canvas.removeEventListener("mousedown", this.onMouseDown);
      this.canvas.removeEventListener("touchstart", this.onTouchStart);
      this.canvas.removeEventListener("mouseup", this.onMouseUp);
      this.canvas.removeEventListener("mouseout", this.onMouseOut);
      this.canvas.removeEventListener("touchend", this.onTouchEnd);
    }
  };

  var getLimitedRandom = function (min, max, roundToInteger) {
    var number = Math.random() * (max - min) + min;
    if (roundToInteger) {
      number = Math.round(number);
    }
    return number;
  };

  var returnRandomArrayitem = function (array) {
    return array[Math.floor(Math.random() * array.length)];
  };

  var pna = new ParticleNetworkAnimation();
  pna.init(document.querySelector(".particle-network-animation"));
})();
