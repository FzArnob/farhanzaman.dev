// const host = "http://localhost/fzs-lab-portfolio/version_1.02/backend/api";
// const host = "http://192.168.0.104/fzs-lab-portfolio/version_1.02/backend/api";
const host = "https://farhanzaman.dev/backend/api";
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
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function deleteCookie(cname) {
    document.cookie = cname + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
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

document.getElementById("direct-message").addEventListener("submit", function (event) {
    event.preventDefault();
    var name = document.getElementById("message-name");
    var email = document.getElementById("message-email");
    var subject = document.getElementById("message-subject");
    var message = document.getElementById("message");
    var header = new Headers();
    header.append("Content-Type", "application/x-www-form-urlencoded");

    var urlencoded = new URLSearchParams();
    urlencoded.append("profile_id", "farhan");
    urlencoded.append("name", name.value);
    urlencoded.append("email", email.value);
    urlencoded.append("subject", subject.value);
    urlencoded.append("message", message.value);

    var requestOptions = {
        method: 'POST',
        headers: header,
        body: urlencoded,
        redirect: 'follow'
    };

    fetch(host + "/send-direct-message.php", requestOptions)
        .then(function (response) {
            if (response.ok) {
                return response.json()
                    .then(function (result) {
                        // Process the response data here
                        console.log(result);
                        document.getElementById("sendmessage").style.display = 'block';
                        name.value = "";
                        email.value = "";
                        subject.value = "";
                        message.value = "";
                        setTimeout(function () {
                            document.getElementById("sendmessage").style.display = 'none';
                        }, 3000);
                    });
            } else {
                return response.json()
                    .then(function (result) {
                        throw new Error(result.message);
                    });
            }
        })
        .catch(function (error) {
            console.log("Request error:", error);
            document.getElementById("errormessage").innerHTML = error.message;
            document.getElementById("errormessage").style.display = 'block';
            setTimeout(function () {
                document.getElementById("errormessage").style.display = 'none';
            }, 4000);
        });
});









// ================================================= Data Response Handler ================================================= 

function createGallery(imageUrls) {
    const container = document.createElement('div');
    container.style.overflow = 'hidden';
    container.classList.add('gallery-container');

    var numColumn;

    switch (true) {
        case window.innerWidth >= 600 && window.innerWidth < 800:
            numColumn = 2;
            break;
        case window.innerWidth >= 800 && window.innerWidth < 1400:
            numColumn = 3;
            break;
        case window.innerWidth >= 1400 && window.innerWidth < 2000:
            numColumn = 4;
            break;
        case window.innerWidth >= 2000:
            numColumn = 5;
            break;
        default:
            numColumn = 1;
            break;
    }
    var imageSide = (window.innerWidth / numColumn) - 70;

    const containerHeight = imageSide + (imageSide / 2) + 30;
    const containerShadowHeight = imageSide / 2;

    container.style.height = containerHeight + 'px';

    const containerShadow = document.createElement('div');
    containerShadow.style.height = containerShadowHeight + 'px';
    containerShadow.style.top = containerHeight - containerShadowHeight - 1 + 'px';
    containerShadow.classList.add('bottom-gradient-bg');
    containerShadow.classList.add('gallery-container-shadow');
    console.log(numColumn);
    for (let i = 0; i < numColumn * 2; i++) {
        var url = imageUrls[i];
        const image = document.createElement('img');
        image.src = url;
        image.classList.add('gallery-image');
        image.style.objectFit = 'cover';
        image.style.width = imageSide + 'px';
        image.style.height = imageSide + 'px';

        const zoomIcon = document.createElement('div');
        zoomIcon.classList.add('zoom-icon');
        zoomIcon.classList.add('material-symbols-outlined');
        zoomIcon.classList.add('c-theme');
        zoomIcon.style.fontSize = '50px';
        zoomIcon.innerHTML = 'add_circle';

        const background = document.createElement('div');
        background.classList.add('gallery-image-back');

        const imageContainer = document.createElement('div');
        imageContainer.style.width = imageSide + 'px';
        imageContainer.style.height = imageSide + 'px';
        imageContainer.addEventListener('mouseover', () => {
            imageContainer.classList.add('zoomed');
            zoomIcon.style.display = 'block';
            background.style.display = 'block';
        });
        imageContainer.addEventListener('click', () => {
            document.getElementById('photoContainer').style.display = 'flex';
            selectPhoto(i);
        });
        imageContainer.addEventListener('mouseout', () => {
            imageContainer.classList.remove('zoomed');
            zoomIcon.style.display = 'none';
            background.style.display = 'none';
        });
        imageContainer.classList.add('image-container');
        imageContainer.appendChild(image);
        imageContainer.appendChild(background);
        imageContainer.appendChild(zoomIcon);
        container.appendChild(imageContainer);
    }

    container.appendChild(containerShadow);
    document.getElementById('gallery').appendChild(container);
}

function createSkillCloud(skillTags) {
    var radius;
    if (window.innerWidth <= 800) {
        radius = window.innerWidth / 2;
    } else {
        radius = window.innerWidth / 4;
        if (radius > 400) radius = 400;
    }
    var tagCloud = TagCloud(".skillTags", skillTags, {
        // radius in px
        radius: radius,

        // animation speed
        // slow, normal, fast
        maxSpeed: "fast",
        initSpeed: "normal",

        // 0 = top
        // 90 = left
        // 135 = right-bottom
        direction: 135,

        // interact with cursor move on mouse out
        keep: true,
    });
    var textSize;
    if (window.innerWidth <= 1400) {
        textSize = Math.floor(27 * radius / 300);
    } else {
        textSize = Math.floor(22 * radius / 300);
    }
    // console.log(radius,"--" ,Math.floor(20*radius/300));
    document.getElementById("skill-canvas").firstChild.style.fontSize = textSize + "px";
    // console.log(document.getElementById("skill-canvas").firstChild.style.fontSize);

    //To change the color of text randomly
    // var colors = ["#34A853", "#FBBC05", "#4285F4", "#7FBC00", "FFBA01", "01A6F0"];
    // var random_color = colors[Math.floor(Math.random() * colors.length)];
    // document.querySelector(".content").style.color = random_color;
}











// ================================================= Utilities Handler ================================================= 
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
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

    document.getElementById("content-gap").style.marginTop = window.innerHeight - 70 + "px";
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
    document.getElementById("wrap").addEventListener("mousemove", function (e) {
        mousePos.x = e.pageX;
        mousePos.y = e.pageY;
        var rangex = 15;
        var rangey = 15;
        var sizeInt = getRandomInt(20, 30);
        if (mousePos.x > 0 && mousePos.y > 0) {

            var colorList = [
                "#80ffec",
                "#4dffe5",
                "#00e6c4",

                "#fe819e",
                "#fd4e78",
                "#fd1c51",

                "#c4c4c4",
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
                getRandomInt(mousePos.x - rangex - sizeInt, mousePos.x + rangex) +
                "px;";

            var top =
                "top: " +
                getRandomInt(mousePos.y - rangey - sizeInt, mousePos.y + rangey) +
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

    // intro image animation
    var introImageEle = document.getElementById("intro-image");
    introImageEle.addEventListener("mousemove", function (e) {
        introImageEle.style.opacity = 0.8;
    });

    introImageEle.addEventListener("mouseleave", function (e) {
        introImageEle.style.opacity = 0.4;
    });
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



//Test 
const skillTags = [
    "HTML",
    "CSS",
    "JavaScript",
    "TypeScript",
    "Python",
    "Java",
    "C++",
    "PHP",
    "SpringBoot",
    "ReactJS",
    "MongoDB",
    "NodeJS",
    "MySQL",
    "NoSQL",
    "GraphQL",
    "Selenium",
    "OOD",
    "Redux",
    "jQuery",
    "Photoshop",
    "Illustrator",
    "Excel",
    "PowerPoint"
];
createSkillCloud(skillTags);

const imageUrls = [
    "https://drive.google.com/uc?export=view&id=1uTNMfmAJ37-eT0bTfvlEbBOkV_o9xAN2",
    "https://drive.google.com/uc?export=view&id=1kk5XwFs6rpB-025pSz5rLFanuUm6-Q4t",
    "https://drive.google.com/uc?export=view&id=1kaUC67zGqKIVqo_cqNnFmYhRh-aArxmu",
    "https://drive.google.com/uc?export=view&id=1kSWSM9_6WkFeP9dZJcCqTMv3m6hAiG7O",
    "https://drive.google.com/uc?export=view&id=1keL-fGWtm-P8RILuG-E5aFxpVDXId6h8",
    "https://drive.google.com/uc?export=view&id=1kbcW8RN7Q6twRR6aes5CfY7e1t_2SFGy",
    "https://drive.google.com/uc?export=view&id=1knnF-6NKTCiVBJU07D-O67vRJsx-2Y_H",
    "https://drive.google.com/uc?export=view&id=1kx9Oy4gTXmTg8zK4UPWPcXhT4501sIsM",
    "https://drive.google.com/uc?export=view&id=1l59pamuCF42zd7_SpjYXA0VYPNfdPGXw",
    "https://drive.google.com/uc?export=view&id=1WELGHhoSQQgZ__fpWe2cWurGe7AO4E2T",
    "https://drive.google.com/uc?export=view&id=1l4V0H-iNS44j5vC3cHEMILm4jyOVFr9T",
    "https://drive.google.com/uc?export=view&id=1hlMVSou2MAYMAy91Fv9xjeIbRfJrgDJM",
    "https://drive.google.com/uc?export=view&id=1k_KetgeWDZxnxZ8Np5RRbMHGIA4cNrgQ",
    "https://drive.google.com/uc?export=view&id=1kUnFaDjnYAAK69K32dQJTklUf_qruPcd",
    "https://drive.google.com/uc?export=view&id=1kJyB6wsATY-gGq0Z658hZm0Rt52i8KAM",
    "https://drive.google.com/uc?export=view&id=1kjKMfW4LBqux3x_5xK3fXgX9qiel4dYl",
    "https://drive.google.com/uc?export=view&id=1lFQVFW868garosNk17RgVgRq-2l-F3q1",
    "https://drive.google.com/uc?export=view&id=1lD_0RMbcd0NhwsITCLfb2bm2i7bjOuKa",
    "https://drive.google.com/uc?export=view&id=1kTWK3N0JFUyRdCjku0leRiy7Cq-bxfGT"
    // Add more image URLs as needed
];
// Example usage
const photos = [
    {
        src: "https://drive.google.com/uc?export=view&id=1uTNMfmAJ37-eT0bTfvlEbBOkV_o9xAN2",
        title: "Photo 1",
        subtitle: "Description 1"
    },
    {
        src: "https://drive.google.com/uc?export=view&id=1kk5XwFs6rpB-025pSz5rLFanuUm6-Q4t",
        title: "Photo 2",
        subtitle: "Description 2"
    },
    {
        src: "https://drive.google.com/uc?export=view&id=1kaUC67zGqKIVqo_cqNnFmYhRh-aArxmu",
        title: "Photo 3",
        subtitle: "Description 3"
    },
    {
        src: "https://drive.google.com/uc?export=view&id=1kSWSM9_6WkFeP9dZJcCqTMv3m6hAiG7O",
        title: "Photo 1",
        subtitle: "Description 1"
    },
    {
        src: "https://drive.google.com/uc?export=view&id=1keL-fGWtm-P8RILuG-E5aFxpVDXId6h8",
        title: "Photo 2",
        subtitle: "Description 2"
    },
    {
        src:
            "https://drive.google.com/uc?export=view&id=1kbcW8RN7Q6twRR6aes5CfY7e1t_2SFGy",
        title: "Photo 3",
        subtitle: "Description 3"
    },
    {
        src:
            "https://drive.google.com/uc?export=view&id=1knnF-6NKTCiVBJU07D-O67vRJsx-2Y_H",
        title: "Photo 1",
        subtitle: "Description 1"
    },
    {
        src:
            "https://drive.google.com/uc?export=view&id=1kx9Oy4gTXmTg8zK4UPWPcXhT4501sIsM",
        title: "Photo 2",
        subtitle: "Description 2"
    },
    {
        src:
            "https://drive.google.com/uc?export=view&id=1l59pamuCF42zd7_SpjYXA0VYPNfdPGXw",
        title: "Photo 3",
        subtitle: "Description 3"
    }
    // Add more photos as needed
];
createGallery(imageUrls);



function generateSkillBars(skills) {
    // Create the skill bars container div
    const skillBarsDiv = document.getElementById("skill-bars");
    skillBarsDiv.classList.add('skill-bars');

    var count;
    if (window.innerWidth <= 800) count = Math.floor((window.innerWidth) / 72);
    else count = Math.floor((window.innerWidth / 4) / 72);

    // Create the individual skill bars
    for (let i = 0; i < count; i++) {
        const skill = skills[i];
        // Create the skill bar div
        const skillBarDiv = document.createElement('div');
        skillBarDiv.classList.add('bar');

        // Create the info div
        const infoDiv = document.createElement('div');
        infoDiv.classList.add('info');

        // Create the span element inside the info div
        const spanElement = document.createElement('span');
        spanElement.textContent = skill.name;

        // Append the span element to the info div
        infoDiv.appendChild(spanElement);

        // Create the progress line div
        const progressLineDiv = document.createElement('div');
        progressLineDiv.classList.add('progress-line');

        // Create the span element inside the progress line div
        const spanElement2 = document.createElement('span');
        spanElement2.style.width = skill.width * 20 + '%';
        spanElement2.setAttribute('data-value', skill.width + "/5")

        // Append the span element to the progress line div
        progressLineDiv.appendChild(spanElement2);

        // Append the info div and progress line div to the skill bar div
        skillBarDiv.appendChild(infoDiv);
        skillBarDiv.appendChild(progressLineDiv);

        // Append the skill bar div to the skill bars container div
        skillBarsDiv.appendChild(skillBarDiv);
    }
}
function skillBarAnimation() {
    const element = document.getElementById('skill-bars');
    if (!element.classList.contains('in-viewport')) {
        if (isInViewport(element)) {
            element.classList.add('in-viewport');
            // Skill data
            const skills = [
                { name: 'Problem Solving', width: 4.6, className: 'ps' },
                { name: 'Critical thinking', width: 4, className: 'ct' },
                { name: 'Teamwork', width: 3.3, className: 'tw' },
                { name: 'Leadership', width: 4.1, className: 'bc' },
                { name: 'Interpersonal skills', width: 3.2, className: 'is' },
                { name: 'Adaptability', width: 2.55, className: 'a' },
                { name: 'Business Communication', width: 4, className: 'l' },
                { name: 'Presentation skills', width: 4, className: 'psk' },
                { name: 'Creativity', width: 3, className: 'c' },
                { name: 'Self-motivated', width: 3, className: 'sm' },
                { name: 'Organizational skills', width: 2, className: 'os' },
                { name: 'Time management', width: 3, className: 'tm' }
            ];
            generateSkillBars(skills);
        }
    }

}
window.addEventListener("scroll", skillBarAnimation);

function createPhotoViewer(targetElement, photos) {
    const photoContainer = document.getElementById(targetElement);

    // Create large photo element
    const largePhoto = document.createElement('img');
    largePhoto.id = 'largePhoto';
    largePhoto.src = '';
    largePhoto.alt = 'Large Photo';

    // Create thumbnail container
    const thumbnailContainer = document.createElement('div');
    thumbnailContainer.id = 'thumbnailContainer';
    thumbnailContainer.classList.add('bg2');

    // Create title and subtitle elements
    const photoTitle = document.createElement('div');
    photoTitle.id = 'photoTitle';
    const photoSubtitle = document.createElement('div');
    photoSubtitle.id = 'photoSubtitle';
    photoTitle.classList.add('c1');
    photoSubtitle.classList.add('c1');
    // Append elements to the photo container
    photoContainer.appendChild(largePhoto);
    photoContainer.appendChild(thumbnailContainer);
    thumbnailContainer.appendChild(photoTitle);
    thumbnailContainer.appendChild(photoSubtitle);
    photoContainer.classList.add('bg1');

    // Populate thumbnail images
    photos.forEach((photo, index) => {
        const thumbnail = document.createElement('img');
        thumbnail.classList.add('thumbnail');
        thumbnail.src = photo.src;
        thumbnail.alt = `Thumbnail ${index + 1}`;
        thumbnail.addEventListener('click', () => selectPhoto(index));
        thumbnailContainer.appendChild(thumbnail);
    });

    // Set initial selection
    selectPhoto(0);
}

// Set the photo viewer to occupy the full screen ratio
function setFullScreenRatio() {
    const photoContainer = document.getElementById('photoContainer');
    const largePhoto = document.getElementById('largePhoto');
    const thumbnailContainer = document.getElementById('thumbnailContainer');
    const photoTitle = document.getElementById('photoTitle');
    const photoSubtitle = document.getElementById('photoSubtitle');


    // Set container heights
    photoContainer.style.height = '100%';
    thumbnailContainer.style.height = `170px`;
    largePhoto.style.maxHeight = 'calc(100% - 250px)';
}

// Select a photo
function selectPhoto(index) {
    const selectedPhoto = photos[index];
    const largePhoto = document.getElementById('largePhoto');
    const thumbnailContainer = document.getElementById('thumbnailContainer');
    const photoTitle = document.getElementById('photoTitle');
    const photoSubtitle = document.getElementById('photoSubtitle');
    largePhoto.src = selectedPhoto.src;
    photoTitle.textContent = selectedPhoto.title;
    photoSubtitle.textContent = selectedPhoto.subtitle;

    // Remove previous selection
    const previousSelectedThumbnail = thumbnailContainer.querySelector('.thumbnail.selected');
    if (previousSelectedThumbnail) {
        previousSelectedThumbnail.classList.remove('selected');
    }

    // Add new selection
    const currentThumbnail = thumbnailContainer.children[index + 2];
    currentThumbnail.classList.add('selected');
}


createPhotoViewer('photoContainer', photos);
setFullScreenRatio();

// Update the full screen ratio when the window is resized
window.addEventListener('resize', setFullScreenRatio);
// Close button functionality
const closeButton = document.getElementById('closeButton');
closeButton.addEventListener('click', () => {
    document.getElementById('photoContainer').style.display = 'none';
});

// Zoom in and out buttons functionality
const zoomInButton = document.getElementById('zoomInButton');
const zoomOutButton = document.getElementById('zoomOutButton');
let scale = 1;
zoomInButton.addEventListener('click', () => {
    if (scale < 5) {
        const largePhoto = document.getElementById('largePhoto');
        scale += 0.1;
        largePhoto.style.transform = `scale(${scale})`;
    }
});

zoomOutButton.addEventListener('click', () => {
    if (scale > 0.6) {
        const largePhoto = document.getElementById('largePhoto');
        scale -= 0.1;
        largePhoto.style.transform = `scale(${scale})`;
    }
});
let posX = 0;
let posY = 0;
let isDragging = false;
let startX;
let startY;
largePhoto.addEventListener('mousedown', (event) => {
    isDragging = true;
    startX = event.clientX - posX;
    startY = event.clientY - posY;
});

largePhoto.addEventListener('mouseup', () => {
    isDragging = false;
});

window.addEventListener('mousemove', (event) => {
    if (isDragging) {
        posX = event.clientX - startX;
        posY = event.clientY - startY;
        largePhoto.style.transform = `scale(${scale}) translate(${posX}px, ${posY}px)`;
    }
});