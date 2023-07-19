const host = "http://localhost/fzs-lab-portfolio/version_1.03/backend/api";
// const host = "http://192.168.0.108/fzs-lab-portfolio/version_1.03/backend/api";
// const host = "https://farhanzaman.dev/backend/api";

// SEND MESSAGE [CONTACT] 
function enableMessages(){
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
}
// GET PROFILE DATA
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

// GET GALLERY DATA
function fetchGalleryData() {
    const profileId = 'farhan';
    const url = host + `/get-gallery-data.php?profile_id=${profileId}`;

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

// GET EXPERTISE DATA
function fetchExpertiseData() {
    const profileId = 'farhan';
    const url = host + `/get-expertise-data.php?profile_id=${profileId}`;

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

// GET WORKS DATA
function fetchWorksData() {
    const profileId = 'farhan';
    const url = host + `/get-works-data.php?profile_id=${profileId}`;

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

// EXPERTISE CARDS [EXPERTISE]

function generateExpertiseCards(targetElement, cardData) {
    const target = document.getElementById(targetElement);
    if (!target) {
      console.error("Target element not found.");
      return;
    }
  
    cardData.forEach((card) => {
      const cardElement = document.createElement("div");
      cardElement.className = "card bg2 c1";
  
      const heading = document.createElement("h2");
      heading.className = "heading c1";
      heading.textContent = card.name;
  
      const subheading = document.createElement("h3");
      subheading.className = "subheading c2";
      subheading.textContent = `${card.level} (${card.duration} months)`;
  
      const details = document.createElement("p");
      details.className = "details c3";
      details.textContent = card.description;
  
      cardElement.appendChild(heading);
      cardElement.appendChild(subheading);
      cardElement.appendChild(details);
  
      target.appendChild(cardElement);
    });
  }

// INTRO IMAGE ANIMATION [INTRO]
function showIntroAnimation() {
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

    // INTRO IMAGE ANIMATION [INTRO]
    var introImageEle = document.getElementById("intro-image");
    introImageEle.addEventListener("mousemove", function (e) {
        introImageEle.style.opacity = 0.8;
    });
    introImageEle.addEventListener("mouseleave", function (e) {
        introImageEle.style.opacity = 0.4;
    });
}

// SKILL BAR [EXPERTISE]
function generateSkillBars(data, extended) {
    // Create the skill bars container div
    const skillBarsDiv = document.getElementById("skill-bars");
    skillBarsDiv.classList.add('skill-bars');
    if (extended) skillBarsDiv.style.maxHeight = 'none';
    var count;
    if (window.innerWidth <= 800) count = Math.floor((window.innerWidth) / 72);
    else count = Math.floor((window.innerWidth / 4) / 72);
    if(extended) count = data.length;
    // Create the individual skill bars
    for (let i = 0; i < count; i++) {
        const skill = data[i];
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
        spanElement2.style.width = skill.percentage + '%';
        spanElement2.setAttribute('data-value', skill.percentage * 5 / 100 + "/5")
        // Append the span element to the progress line div
        progressLineDiv.appendChild(spanElement2);
        // Append the info div and progress line div to the skill bar div
        skillBarDiv.appendChild(infoDiv);
        skillBarDiv.appendChild(progressLineDiv);
        // Append the skill bar div to the skill bars container div
        skillBarsDiv.appendChild(skillBarDiv);
    }
}
function skillBarAnimation(data, extended) {
    const element = document.getElementById('skill-bars');
    if (!element.classList.contains('in-viewport')) {
        if (isInViewport(element)) {
            element.classList.add('in-viewport');
            generateSkillBars(data, extended);
        }
    }
}

// SKILL CLOUD [EXPERTISE] 
function createSkillCloud(data) {
    var radius;
    if (window.innerWidth <= 800) {
        radius = window.innerWidth / 2;
    } else {
        radius = window.innerWidth / 4;
        if (radius > 400) radius = 400;
    }
    const skillTags = data.map(item => item.name);
    TagCloud(".skillTags", skillTags, {
        radius: radius,
        maxSpeed: "fast",
        initSpeed: "normal",
        direction: 135,
        keep: true,
    });
    var textSize;
    if (window.innerWidth <= 1400) {
        textSize = Math.floor(27 * radius / 300);
    } else {
        textSize = Math.floor(22 * radius / 300);
    }
    document.getElementById("skill-canvas").firstChild.style.fontSize = textSize + "px";
}

// GALLERY BOXES [GALLERY]
function createGallery(gallery, extended) {
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
    if(!extended) container.style.height = containerHeight + 'px';
    const containerShadow = document.createElement('div');
    containerShadow.style.height = containerShadowHeight + 'px';
    containerShadow.style.top = containerHeight - containerShadowHeight - 1 + 'px';
    containerShadow.classList.add('bottom-gradient-bg');
    containerShadow.classList.add('gallery-container-shadow');
    var len;
    if(extended) len = gallery.length;
    else len = numColumn * 2;
    for (let i = 0; i < len; i++) {
        var art = gallery[i];
        const image = document.createElement('img');
        image.src = art.thumb_url;
        image.classList.add('gallery-image');
        image.style.objectFit = 'cover';
        image.style.width = imageSide + 'px';
        image.style.height = imageSide + 'px';
        const zoomIcon = document.createElement('div');
        zoomIcon.classList.add('zoom-icon');
        zoomIcon.classList.add('ico-gen');
        zoomIcon.classList.add('c1');
        zoomIcon.style.fontSize = '70px';
        zoomIcon.innerHTML = 'O';
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
            selectPhoto(i, gallery);
            document.getElementById('photoContainer').style.display = 'flex';
            document.querySelector("main-page").style.visibility = "hidden";
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
    if(!extended) container.appendChild(containerShadow);
    document.getElementById('gallery').appendChild(container);
}

// GALLERY PHOTO VIEW
function createPhotoViewer(targetElement, gallery) {
    const photoContainer = document.getElementById(targetElement);
    // Create large photo element
    const largePhoto = document.createElement('img');
    largePhoto.id = 'largePhoto';
    largePhoto.src = '';
    largePhoto.alt = 'Large Photo';
    const largePhotoHolder = document.createElement('div');
    largePhotoHolder.id = 'largePhotoHolder';
    // Create thumbnail container
    const thumbnailContainer = document.createElement('div');
    thumbnailContainer.id = 'thumbnailContainer';
    thumbnailContainer.classList.add('bg2');
    // Create title and subtitle elements
    const photoTitle = document.createElement('div');
    photoTitle.id = 'photoTitle';
    const photoSubtitle = document.createElement('div');
    photoSubtitle.id = 'photoSubtitle';
    // Append elements to the photo container
    largePhotoHolder.appendChild(largePhoto);
    photoContainer.appendChild(largePhotoHolder);
    photoContainer.appendChild(thumbnailContainer);
    photoContainer.appendChild(photoTitle);
    photoContainer.appendChild(photoSubtitle);
    photoContainer.classList.add('bg1');
    // Populate thumbnail images
    for (let i = 0; i < gallery.length; i++) {
        var art = gallery[i];
        const thumbnail = document.createElement('img');
        thumbnail.classList.add('thumbnail');
        thumbnail.src = art.thumb_url;
        thumbnail.alt = `Thumbnail ${i + 1}`;
        thumbnail.addEventListener('click', () => selectPhoto(i, gallery));
        thumbnailContainer.appendChild(thumbnail);
    }
    // Set initial selection
    selectPhoto(0, gallery);

}

// Select a photo
function selectPhoto(index, gallery) {
    var selectedPhoto = gallery[index];
    const largePhoto = document.getElementById('largePhoto');
    const thumbnailContainer = document.getElementById('thumbnailContainer');
    const photoTitle = document.getElementById('photoTitle');
    const photoSubtitle = document.getElementById('photoSubtitle');
    
    // Remove previous selection
    const previousSelectedThumbnail = thumbnailContainer.querySelector('.thumbnail.selected');
    if (previousSelectedThumbnail) {
        previousSelectedThumbnail.classList.remove('selected');
    }
    
    // Add new selection
    const currentThumbnail = thumbnailContainer.children[index];
    currentThumbnail.classList.add('selected');
    
    // Show loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.classList.add('loading-indicator');
    largePhoto.style.display = 'none'; // Hide the large photo temporarily
    largePhoto.parentNode.insertBefore(loadingIndicator, largePhoto);
    
    // Create a new image element for preloading
    const preloadedImage = new Image();
    preloadedImage.onload = function() {
        // Remove the loading indicator when the image is loaded
        loadingIndicator.remove();
        
        // Update the large photo source and show it
        largePhoto.src = selectedPhoto.image_url;
        largePhoto.style.display = 'block';
    };
    preloadedImage.src = selectedPhoto.image_url;
    
    photoTitle.textContent = selectedPhoto.name;
    photoSubtitle.textContent = selectedPhoto.description;
}

// Start photo viewer
function startPhotoVeiwer() {
    // Close button functionality
    const closeButton = document.getElementById('closeButton');
    closeButton.addEventListener('click', () => {
        document.getElementById('photoContainer').style.display = 'none';
        document.querySelector("main-page").style.visibility = "visible";
    });

    // Zoom in, out and drag functionality
    const swipeImage = document.getElementById('largePhoto');
    const zoomInBtn = document.getElementById('zoomInButton');
    const zoomOutBtn = document.getElementById('zoomOutButton');
    var scale = 1;
    var isDragging = false;
    var startX = 0;
    var startY = 0;
    var currentTranslateX = 0;
    var currentTranslateY = 0;
    var previousTranslateX = 0;
    var previousTranslateY = 0;
    var previousEventScale = 1;

    swipeImage.addEventListener('mousedown', startDrag);
    swipeImage.addEventListener('touchstart', startDrag);

    swipeImage.addEventListener('mousemove', drag);
    swipeImage.addEventListener('touchmove', drag);

    swipeImage.addEventListener('mouseup', endDrag);
    swipeImage.addEventListener('touchend', endDrag);

    swipeImage.addEventListener('mouseleave', endDrag);
    swipeImage.addEventListener('touchcancel', endDrag);

    zoomInBtn.addEventListener('click', zoomIn);
    zoomOutBtn.addEventListener('click', zoomOut);

    swipeImage.addEventListener('gesturestart', onGestureStart);
    swipeImage.addEventListener('gesturechange', onGestureChange);
    swipeImage.addEventListener('gestureend', onGestureEnd);

    function startDrag(event) {
        event.preventDefault();
        isDragging = true;
        swipeImage.style.cursor = "grabbing";
        if (event.type === 'touchstart') {
            startX = event.touches[0].clientX;
            startY = event.touches[0].clientY;
        } else {
            startX = event.clientX;
            startY = event.clientY;
        }

        previousTranslateX = currentTranslateX || 0;
        previousTranslateY = currentTranslateY || 0;
    }

    function drag(event) {
        event.preventDefault();
        if (isDragging) {
            let x, y;

            if (event.type === 'touchmove' && event.touches.length < 2) {
                x = event.touches[0].clientX;
                y = event.touches[0].clientY;
            } else {
                x = event.clientX;
                y = event.clientY;
            }

            if (x != null && y != null) {
                const dragDistanceX = x - startX;
                const dragDistanceY = y - startY;

                currentTranslateX = previousTranslateX + dragDistanceX;
                currentTranslateY = previousTranslateY + dragDistanceY;

                swipeImage.style.transform = `scale(${scale}) translate(${currentTranslateX}px, ${currentTranslateY}px)`;
            }
        }
    }

    function endDrag(event) {
        swipeImage.style.cursor = "graB";
        event.preventDefault();
        isDragging = false;
        previousTranslateX = currentTranslateX;
        previousTranslateY = currentTranslateY;
    }

    function zoomIn() {
        scale += 0.1;
        swipeImage.style.transform = `scale(${scale}) translate(${currentTranslateX}px, ${currentTranslateY}px)`;
    }

    function zoomOut() {
        if(scale > 0.5) scale -= 0.1;
        swipeImage.style.transform = `scale(${scale}) translate(${currentTranslateX}px, ${currentTranslateY}px)`;
    }

    function onGestureStart(event) {
        event.preventDefault();
        previousTranslateX = currentTranslateX;
        previousTranslateY = currentTranslateY;
    }

    function onGestureChange(event) {
        event.preventDefault();
        if (5 > scale + (event.scale - previousEventScale) > 0.5) {
            scale = scale + (event.scale - previousEventScale);
            swipeImage.style.transform = `scale(${scale}) translate(${currentTranslateX}px, ${currentTranslateY}px)`;
        }
        console.log("Action" + (event.scale - previousEventScale) + "Scale: " + scale);
        previousEventScale = event.scale;
    }

    function onGestureEnd(event) {
        event.preventDefault();
        previousEventScale = 1;
        console.log("End: " + previousEventScale);
    }


}

// WORKS [WORK]
function generateWorks(targetElement, worksData, extended) {
    const worksContainer = document.createElement("div");
    worksContainer.classList.add("works");
    var numColumn;
    switch (true) {
        case window.innerWidth >= 500 && window.innerWidth < 800:
            numColumn = 2;
            break;
        case window.innerWidth >= 800 && window.innerWidth < 1400:
            numColumn = 2;
            break;
        case window.innerWidth >= 1400 && window.innerWidth < 2000:
            numColumn = 3;
            break;
        case window.innerWidth >= 2000:
            numColumn = 4;
            break;
        default:
            numColumn = 1;
            break;
    }
    var workCardWidth = (window.innerWidth / numColumn) - 70;
    var len;
    if(extended) len = worksData.length;
    else len = numColumn * 2;
    for (let i = 0; i < len; i++) {
        const work = worksData[i];
        const workCard = document.createElement("div");
        workCard.classList.add("work-card", "bg2");
        workCard.style.width = workCardWidth + 'px';
        const image = document.createElement("img");
        image.classList.add("work-card-image");
        image.src = work.logo_image;
        const tagsContainer = document.createElement("div");
        tagsContainer.classList.add("work-card-tags");
        const typeTag = document.createElement("div");
        typeTag.classList.add("work-card-tag", "c-theme");
        typeTag.textContent = work.type;
        tagsContainer.appendChild(typeTag);
        const stackTag = document.createElement("div");
        stackTag.classList.add("work-card-tag", "c-theme");
        stackTag.textContent = work.stack;
        tagsContainer.appendChild(stackTag);
        const title = document.createElement("div");
        title.classList.add("work-card-title", "c1");
        title.textContent = work.name;
        const details = document.createElement("div");
        details.classList.add("work-card-details", "c2");
        details.textContent = work.details;
        workCard.appendChild(image);
        workCard.appendChild(tagsContainer);
        workCard.appendChild(title);
        workCard.appendChild(details);
        worksContainer.appendChild(workCard);
    }
    const parentElement = document.getElementById(targetElement);
    parentElement.appendChild(worksContainer);
}

// SOCIAL CONTACTS [CONTACT]
function generateSocialContact(targetElement, data) {

    const ul = document.createElement('ul');

    const socialLinks = [
        { href: data.facebook_url, text: 'A' },
        { href: data.github_url, text: 'B' },
        { href: data.linkedin_url, text: 'C' },
        { href: data.whatsapp_url, text: 'D' }
    ];

    socialLinks.forEach(link => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = link.href;
        a.target = '_blank';
        const span = document.createElement('span');
        span.className = 'ico-circle';
        span.textContent = link.text;

        a.appendChild(span);
        li.appendChild(a);
        ul.appendChild(li);
    });

    const target = document.getElementById(targetElement);
    if (target) {
        target.appendChild(ul);
    }
}

// INFO [CONTACT]
function generateInfo(targetElement, data) {
    const infoParagraph = document.createElement('p');
    infoParagraph.className = 'lead';
    infoParagraph.textContent = data.contact_preference_details

    const ul = document.createElement('ul');
    ul.className = 'list-ico';

    const listItems = [
        { text: data.address, icon: 'K' },
        { text: data.phone, icon: 'L' },
        { text: data.email, icon: 'M' }
    ];

    listItems.forEach(item => {
        const li = document.createElement('li');
        const span = document.createElement('span');
        span.className = 'ico-gen text-icon';
        span.textContent = item.icon;

        li.appendChild(span);
        li.appendChild(document.createTextNode(` ${item.text}`));
        ul.appendChild(li);
    });

    const target = document.getElementById(targetElement);
    if (target) {
        target.appendChild(infoParagraph);
        target.appendChild(ul);
    }
}

// ACHEIVEMENTS [EXPERTISE]
function generateAchievements(targetElement, achievementData) {
    const achievementDiv = document.createElement('div');
    achievementDiv.className = 'achievement-preview';

    achievementData.forEach(data => {
        const a = document.createElement('a');
        a.href = data.certification_url;
        a.className = 'achievement-node tooltip';
        a.target = '_blank';

        const img = document.createElement('img');
        img.className = 'achievement-node-image';
        img.src = data.certification_logo;
        img.setAttribute('data-tooltip', data.name);

        const tooltip = document.createElement('span');
        tooltip.className = 'tooltip-text';
        tooltip.textContent = data.name;

        a.appendChild(img);
        a.appendChild(tooltip);
        achievementDiv.appendChild(a);
    });

    const target = document.getElementById(targetElement);
    if (target) {
        target.appendChild(achievementDiv);
    }

    // Add event listeners to show/hide tooltips
    const tooltips = document.querySelectorAll('.tooltip');
    tooltips.forEach(tooltip => {
        const tooltipText = tooltip.querySelector('.tooltip-text');

        tooltip.addEventListener('mouseover', () => {
            tooltipText.style.visibility = 'visible';
            tooltipText.style.opacity = '1';
        });

        tooltip.addEventListener('mouseout', () => {
            tooltipText.style.visibility = 'hidden';
            tooltipText.style.opacity = '0';
        });
    });
}

// EXPERIENCES [ABOUT]
function generateExperienceHTML(targetElement, experienceData) {
    function createPointBox(header, companyLinkText, dates, description, companyLink, descriptionLink, descriptionLinkText) {
        var pointBox = document.createElement("div");
        pointBox.className = "point-box";

        var point = document.createElement("div");
        point.innerHTML = '<span class="hotspot main-wrapper">' +
            '<span class="hotspot dots-container">' +
            '<span class="hotspot dot1"></span>' +
            '<span class="hotspot dot2"></span>' +
            '<span class="hotspot dot3"></span>' +
            '</span>' +
            '</span>';
        pointBox.appendChild(point);

        var boxHeader = document.createElement("div");
        boxHeader.className = "box-header";
        boxHeader.textContent = header;
        pointBox.appendChild(boxHeader);

        var boxSubHeader = document.createElement("div");
        boxSubHeader.className = "box-sub-header";
        var companyLinkElement = document.createElement("a");
        companyLinkElement.href = companyLink;
        companyLinkElement.target = "_blank";
        companyLinkElement.innerHTML =
            '<span class="cross-theme wobble" data-animation="upscale">' + companyLinkText + "</span>";
        boxSubHeader.appendChild(companyLinkElement);
        boxSubHeader.innerHTML = boxSubHeader.innerHTML + "<br />" + dates;
        pointBox.appendChild(boxSubHeader);

        var boxDescription = document.createElement("div");
        boxDescription.className = "box-description";
        var descriptionLinkElement = document.createElement("a");
        descriptionLinkElement.href = descriptionLink;
        descriptionLinkElement.target = "_blank";
        descriptionLinkElement.innerHTML =
            '<span class="cross-theme wobble" data-animation="upscale">' + descriptionLinkText + "</span>";
        boxDescription.innerHTML = description;
        boxDescription.appendChild(descriptionLinkElement);
        pointBox.appendChild(boxDescription);

        return pointBox;
    }

    var columnContainer = document.getElementById(targetElement);

    var experienceTopic = document.createElement("div");
    experienceTopic.className = "topic";
    experienceTopic.textContent = "Experience";
    columnContainer.appendChild(document.createElement("br"));
    columnContainer.appendChild(document.createElement("br"));
    columnContainer.appendChild(experienceTopic);
    columnContainer.appendChild(document.createElement("br"));
    columnContainer.appendChild(document.createElement("br"));

    experienceData.forEach(function (experience) {
        var pointBox = createPointBox(
            experience.position,
            experience.institute_name,
            experience.end_date ? experience.start_date + ' - ' + experience.end_date : experience.start_date + ' - Present',
            experience.project_text_1 ? experience.project_details + ', ' : experience.project_details,
            experience.institute_url,
            experience.project_url_1,
            experience.project_text_1 ? experience.project_text_1 : ''
        );
        columnContainer.appendChild(pointBox);
    });

    var resumeButton = document.createElement("button");
    resumeButton.type = "submit";
    resumeButton.className = "button button-a button-big button-rouded reverse-color";
    resumeButton.style.marginLeft = "50%";
    resumeButton.style.transform = "translateX(-50%)";
    resumeButton.innerHTML = '<span class="ico-gen resume">N</span> Resume';
    columnContainer.appendChild(resumeButton);
}

// EDUCATION [ABOUT]
function generateEducationHTML(targetElement, educationData) {
    function createPointBox(header, institution, institutionLink, dates, description) {
        var pointBox = document.createElement("div");
        pointBox.className = "point-box";

        var point = document.createElement("div");
        point.innerHTML = '<span class="hotspot main-wrapper">' +
            '<span class="hotspot dots-container">' +
            '<span class="hotspot dot1"></span>' +
            '<span class="hotspot dot2"></span>' +
            '<span class="hotspot dot3"></span>' +
            '</span>' +
            '</span>';
        pointBox.appendChild(point);

        var boxHeader = document.createElement("div");
        boxHeader.className = "box-header";
        boxHeader.textContent = header;
        pointBox.appendChild(boxHeader);

        var boxSubHeader = document.createElement("div");
        boxSubHeader.className = "box-sub-header";
        var institutionLinkElement = document.createElement("a");
        institutionLinkElement.href = institutionLink;
        institutionLinkElement.target = "_blank";
        institutionLinkElement.innerHTML =
            '<span class="cross-theme wobble" data-animation="upscale">' + institution + "</span>";
        boxSubHeader.appendChild(institutionLinkElement);
        boxSubHeader.innerHTML += "<br />" + dates;
        pointBox.appendChild(boxSubHeader);

        var boxDescription = document.createElement("div");
        boxDescription.className = "box-description";
        boxDescription.textContent = description;
        pointBox.appendChild(boxDescription);

        return pointBox;
    }

    var columnContainer = document.getElementById(targetElement);

    var educationTopic = document.createElement("div");
    educationTopic.className = "topic";
    educationTopic.textContent = "Education";
    columnContainer.appendChild(document.createElement("br"));
    columnContainer.appendChild(document.createElement("br"));
    columnContainer.appendChild(educationTopic);
    columnContainer.appendChild(document.createElement("br"));
    columnContainer.appendChild(document.createElement("br"));

    educationData.forEach(function (education) {
        var pointBox = createPointBox(
            education.subject,
            education.institute_name,
            education.institute_url,
            education.end_date ? 'Graduation year of ' + education.end_date : education.start_date + ' - Present',
            education.activity
        );
        columnContainer.appendChild(pointBox);
    });
}  
