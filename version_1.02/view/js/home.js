// ALL JS [HOME] 

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



// INTRO IMAGE ANIMATION [INTRO]

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




// SKILL BAR [EXPERTISE]

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




// SKILL CLOUD [EXPERTISE] 

function createSkillCloud(skillTags) {
    var radius;
    if (window.innerWidth <= 800) {
        radius = window.innerWidth / 2;
    } else {
        radius = window.innerWidth / 4;
        if (radius > 400) radius = 400;
    }
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



// GALLERY BOXES [GALLERY]

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
createGallery(imageUrls);




// GALLERY PHOTO VIEW

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






// WORK CARDS [WORKS]

const worksData = [
    {
        logo_image: "https://drive.google.com/uc?export=view&id=1MxXMUF4dTl3-JZb063SC9S-IDzS5pF8t",
        type: "Nature",
        stack: "Lake",
        name: "Lago di Braies",
        details: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Consectetur sodales morbi dignissim sed diam pharetra vitae ipsum odio."
    },
    {
        logo_image: "https://drive.google.com/uc?export=view&id=1NZs9d45CF2pwd6i5yhzvAlYortEj8LHq",
        type: "Nature",
        stack: "Lake",
        name: "Lago di Braies",
        details: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Consectetur sodales morbi dignissim sed diam pharetra vitae ipsum odio."
    },
    {
        logo_image: "https://drive.google.com/uc?export=view&id=1l2zysM2PFm1tVut6UTbbWpJ9UxwawleG",
        type: "Nature",
        stack: "Lake",
        name: "Lago di Braies",
        details: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Consectetur sodales morbi dignissim sed diam pharetra vitae ipsum odio."
    },
    {
        logo_image: "https://drive.google.com/uc?export=view&id=1MxXMUF4dTl3-JZb063SC9S-IDzS5pF8t",
        type: "Nature",
        stack: "Lake",
        name: "Lago di Braies",
        details: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Consectetur sodales morbi dignissim sed diam pharetra vitae ipsum odio."
    },
    {
        logo_image: "https://drive.google.com/uc?export=view&id=1NZs9d45CF2pwd6i5yhzvAlYortEj8LHq",
        type: "Nature",
        stack: "Lake",
        name: "Lago di Braies",
        details: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Consectetur sodales morbi dignissim sed diam pharetra vitae ipsum odio."
    },
    {
        logo_image: "https://drive.google.com/uc?export=view&id=1l2zysM2PFm1tVut6UTbbWpJ9UxwawleG",
        type: "Nature",
        stack: "Lake",
        name: "Lago di Braies",
        details: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Consectetur sodales morbi dignissim sed diam pharetra vitae ipsum odio."
    },
    {
        logo_image: "https://drive.google.com/uc?export=view&id=1MxXMUF4dTl3-JZb063SC9S-IDzS5pF8t",
        type: "Nature",
        stack: "Lake",
        name: "Lago di Braies",
        details: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Consectetur sodales morbi dignissim sed diam pharetra vitae ipsum odio."
    },
    {
        logo_image: "https://drive.google.com/uc?export=view&id=1NZs9d45CF2pwd6i5yhzvAlYortEj8LHq",
        type: "Nature",
        stack: "Lake",
        name: "Lago di Braies",
        details: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Consectetur sodales morbi dignissim sed diam pharetra vitae ipsum odio."
    },
    {
        logo_image: "https://drive.google.com/uc?export=view&id=1l2zysM2PFm1tVut6UTbbWpJ9UxwawleG",
        type: "Nature",
        stack: "Lake",
        name: "Lago di Braies",
        details: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Consectetur sodales morbi dignissim sed diam pharetra vitae ipsum odio."
    }
];
function generateWorks(targetElement, worksData) {
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
    for (let i = 0; i < numColumn * 2; i++) {
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
generateWorks("works", worksData);
