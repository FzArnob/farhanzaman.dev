const host = "http://localhost/fzs-lab-portfolio/version_1.02/backend/api";
// const host = "http://192.168.0.103/fzs-lab-portfolio/version_1.02/backend/api";
// const host = "https://farhanzaman.dev/backend/api";
var data = null;




// ================================================= Cookies Handler ================================================= 
function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
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
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires + "; path=/; SameSite=Strict";
}
function deleteCookie(cname) {
    document.cookie = cname + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict";
}















//  ================================================= API Call Handler ================================================= 
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function checkGolbalData(ms) {
    sleep(ms).then(() => {
        if (data == null) {
            checkGolbalData(ms);
        } else {
            setTimeout(function () {
                document.querySelector("pre-loader").style.display = "none"; // hide
                document.querySelector("main-page").style.display = "block"; // show
                wobbleAnimation();
            }, 1000);

        }
    });
}
function fetchProfileData() {
    const profileId = 'farhan';
    const url = host + `/get-profile-data.php?profile_id=${profileId}`;

    return new Promise((resolve, reject) => {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(result => {
                resolve(result);
            })
            .catch(error => {
                reject(error);
            });
    });
}
// API Usage:
fetchProfileData()
    .then(result => {
        console.log(result);
        data = result;
        checkGolbalData(500); // Handle the response data here
    })
    .catch(error => {
        console.error(error); // Handle any errors here
    });







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
    if(!navClick){
    const sections = document.querySelectorAll('section.nav-section');
    const visibleSections = Array.from(sections).filter(section => isInViewport(section));
    
    let mostVisibleSection = null;
    let mostVisiblePercentage = 0;
    
    visibleSections.forEach(section => {
      const sectionId = section.getAttribute('id');
      const correspondingNavLink = document.querySelector(`a[href="#${sectionId}"]`);
      
      const visiblePercentage = calculateVisiblePercentage(section);
      
      if (visiblePercentage > mostVisiblePercentage) {
        mostVisibleSection = section;
        mostVisiblePercentage = visiblePercentage;
      }
      
      if (correspondingNavLink.classList.contains('active')) {
        correspondingNavLink.classList.remove('active');
      }
    });
    
    if (mostVisibleSection) {
      const mostVisibleNavLink = document.querySelector(`a[href="#${mostVisibleSection.getAttribute('id')}"]`);
      mostVisibleNavLink.classList.add('active');
    }
  }
}
  
  function calculateVisiblePercentage(element) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
    return (visibleHeight / element.offsetHeight) * 100;
  }
  
  
  
  // Add scroll event listener to the window
  window.addEventListener('scroll', handleNavScroll);
  

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
                        el.innerHTML += '<span class="letter">' + letter + "</span>"; '<span class="letter">' + letter + "</span>";
                    } else if (letter == "$") {
                        letter = "<br/>";
                        el.innerHTML += letter;
                    } else
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
        }
        // else console.log(el," not in view");
    })
}



document.addEventListener("DOMContentLoaded", function () {

    document.getElementById("content-gap").style.marginTop = window.innerHeight + "px";
    document.getElementById("content-gap").style.border = "none";
    // preload
    if (getCookie("theme") === "") {
        var themePopUp = document.getElementById("theme-popup");
        themePopUp.addEventListener('click', function () {
            themePopUp.style.display = 'none';
        });
        themePopUp.style.display = 'block';
        setCookie("theme", "light", 30);
        document
            .querySelector("head")
            .insertAdjacentHTML(
                "beforeend",
                `<link type="text/css" rel="stylesheet" href="view/css/theme/light.css" data-theme="light" />`
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
                    existingLinks.forEach(existingLink => {
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
                (menuBtn.style.display === "block") ? menuBtn.style.display = "none" : menuBtn.style.display = "block";
            }, 100);

        });

    // nav links highlight

    // Get all the navigation links
    const navLinks = document.querySelectorAll('.nav-links');

    // Loop through each navigation link and add the event listener
    navLinks.forEach(link => {
        link.addEventListener('click', function (event) {
            navClick = true;
            // Remove the "active" class from all navigation links
            navLinks.forEach(link => {
                link.classList.remove('active');
            });

            // Add the "active" class to the clicked navigation link
            this.classList.add('active');

            var menuBtn = document.querySelector(".mobile-nav-menu");
            if(menuBtn){
                menuBtn.classList.toggle("mobile-nav-menu");
                setTimeout(function () {
                (menuBtn.style.display === "block") ? menuBtn.style.display = "none" : menuBtn.style.display = "block";
            }, 200);
        }
        setTimeout(function () {
            navClick = false;
        }, 2000);
        });
    });


    //animation text
    function addListenerMulti(element, eventNames, listener) {
        var events = eventNames.split(' ');
        for (var i = 0, iLen = events.length; i < iLen; i++) {
            element.addEventListener(events[i], listener, false);
        }
    }
    var wobbleElements = document.querySelectorAll(".wobble");
    wobbleElements.forEach(function (el) {
        addListenerMulti(el, 'mouseover click', function () {
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


    // back to top button
    window.addEventListener('scroll', function () {
        var button = document.getElementById('back-to-top-btn');
        if (window.pageYOffset > 300) {
            button.classList.add('show');
        } else {
            button.classList.remove('show');
        }
    });

    document.getElementById('back-to-top-btn').addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});



