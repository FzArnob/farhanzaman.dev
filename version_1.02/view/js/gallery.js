// const host = "http://localhost/fzs-lab-portfolio/version_1.02/backend/api";
const host = "http://192.168.0.105/fzs-lab-portfolio/version_1.02/backend/api";
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
    console.log(numColumn);
    for (let i = 0; i < imageUrls.length; i++) {
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

    document.getElementById('gallery').appendChild(container);
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