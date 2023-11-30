// const host = "http://localhost/fzs-lab-portfolio/version_1.04/backend/api";
// const host = "http://192.168.0.108/fzs-lab-portfolio/version_1.04/backend/api";
const host = "https://farhanzaman.dev/backend/api";

// SEND MESSAGE [CONTACT]
function enableMessages() {
  document
    .getElementById("direct-message")
    .addEventListener("submit", function (event) {
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
        method: "POST",
        headers: header,
        body: urlencoded,
        redirect: "follow",
      };

      fetch(host + "/send-direct-message.php", requestOptions)
        .then(function (response) {
          if (response.ok) {
            return response.json().then(function (result) {
              // Process the response data here
              console.log(result);
              document.getElementById("sendmessage").style.display = "block";
              name.value = "";
              email.value = "";
              subject.value = "";
              message.value = "";
              setTimeout(function () {
                document.getElementById("sendmessage").style.display = "none";
              }, 3000);
            });
          } else {
            return response.json().then(function (result) {
              throw new Error(result.message);
            });
          }
        })
        .catch(function (error) {
          console.log("Request error:", error);
          document.getElementById("errormessage").innerHTML = error.message;
          document.getElementById("errormessage").style.display = "block";
          setTimeout(function () {
            document.getElementById("errormessage").style.display = "none";
          }, 4000);
        });
    });
}

// Sync Info

function synchronizeInfo() {
  const profileId = "farhan";
  const url = host + `/synchronize-info.php?profile_id=${profileId}`;

  return new Promise((resolve, reject) => {
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
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
function showIntroAnimation(data) {
  var mousePos = {};
  document.getElementById("wrap").addEventListener("mousemove", function (e) {
    mousePos.x = e.pageX;
    mousePos.y = e.pageY;
    var sizeInt = 15;
    if (mousePos.x > 0 && mousePos.y > 0) {
      var size = "height: " + sizeInt + "px; width: " + sizeInt + "px;";
      var left = "left: " + mousePos.x + "px;";

      var top = "top: " + mousePos.y + "px;";
      var style = left + top + size;
      const ball = document.createElement("div");
      ball.classList.add("ball");
      ball.setAttribute("style", style);
      ball.addEventListener("animationend", function (e) {
        this.parentNode.removeChild(this);
      });
      document.getElementById("wrap").appendChild(ball);
    }
  });

  var typing = new Typed("#designation", {
    strings: data.designations,
    typeSpeed: 150,
    backSpeed: 40,
    loop: true,
  });
  // INTRO IMAGE ANIMATION [INTRO]
  // var introImageEle = document.getElementById("intro-image");
  // introImageEle.addEventListener("mousemove", function (e) {
  //     introImageEle.style.opacity = 0.4;
  // });
  // introImageEle.addEventListener("mouseleave", function (e) {
  //     introImageEle.style.opacity = 0.2;
  // });
}
function getExpertiseLevel(percentage) {
  if (percentage >= 0 && percentage < 16) {
    return "Novice";
  } else if (percentage >= 16 && percentage < 31) {
    return "Fundamental";
  } else if (percentage >= 31 && percentage < 46) {
    return "Intermediate";
  } else if (percentage >= 46 && percentage < 61) {
    return "Competent";
  } else if (percentage >= 61 && percentage < 76) {
    return "Advanced";
  } else if (percentage >= 76 && percentage <= 91) {
    return "Expert";
  } else {
    return "Mastery";
  }
}

// SKILL BAR [EXPERTISE]
function generateSkillBars(data, extended) {
  // Create the skill bars container div
  const skillBarsDiv = document.getElementById("skill-bars");
  skillBarsDiv.classList.add("skill-bars");
  if (extended) skillBarsDiv.style.maxHeight = "none";
  var count;
  if (window.innerWidth <= 800) count = Math.floor(window.innerWidth / 72);
  else count = Math.floor(window.innerWidth / 4 / 72);
  if (extended) count = data.length;
  // Create the individual skill bars
  for (let i = 0; i < count; i++) {
    const skill = data[i];
    // Create the skill bar div
    const skillBarDiv = document.createElement("div");
    skillBarDiv.classList.add("bar");
    // Create the info div
    const infoDiv = document.createElement("div");
    infoDiv.classList.add("info");
    // Create the span element inside the info div
    const spanElement = document.createElement("span");
    spanElement.textContent = skill.name;
    // Append the span element to the info div
    infoDiv.appendChild(spanElement);
    // Create the progress line div
    const progressLineDiv = document.createElement("div");
    progressLineDiv.classList.add("progress-line");
    // Create the span element inside the progress line div
    const spanElement2 = document.createElement("span");
    spanElement2.style.width = skill.percentage + "%";
    spanElement2.setAttribute(
      "data-value",
      getExpertiseLevel(skill.percentage)
    );
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
  const element = document.getElementById("skill-bars");
  if (!element.classList.contains("in-viewport")) {
    if (isInViewport(element)) {
      element.classList.add("in-viewport");
      generateSkillBars(data, extended);
    }
  }
}

// SKILL CLOUD [EXPERTISE]
function createSkillCloud(targetElement, data) {
  var radius;
  if (window.innerWidth <= 800) {
    radius = window.innerWidth / 2;
  } else {
    radius = window.innerWidth / 4;
    if (radius > 400) radius = 400;
  }
  const skillTags = data.map((item) => item.name);
  TagCloud(".skillTags", skillTags, {
    radius: radius,
    maxSpeed: "normal",
    initSpeed: "normal",
    direction: 135,
    keep: true,
  });
  var textSize;
  if (window.innerWidth <= 1400) {
    textSize = Math.floor((27 * radius) / 300);
  } else {
    textSize = Math.floor((22 * radius) / 300);
  }
  document.getElementById(targetElement).firstChild.style.fontSize =
    textSize + "px";
}

// GALLERY BOXES [GALLERY]
function createGallery(targetElement, gallery, extended) {
  const container = document.createElement("div");
  container.style.overflow = "hidden";
  container.classList.add("gallery-container");
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
  var imageSide = window.innerWidth / numColumn - 70;
  const containerHeight = imageSide + imageSide / 2 + 30;
  const containerShadowHeight = imageSide / 2;
  if (!extended) container.style.height = containerHeight + "px";
  const containerShadow = document.createElement("div");
  containerShadow.style.height = containerShadowHeight + "px";
  containerShadow.style.top =
    containerHeight - containerShadowHeight - 1 + "px";
  containerShadow.classList.add("bottom-gradient-bg");
  containerShadow.classList.add("gallery-container-shadow");
  var len;
  if (extended) len = gallery.length;
  else len = numColumn * 2;
  for (let i = 0; i < len; i++) {
    var art = gallery[i];
    const image = document.createElement("img");
    image.src = art.thumb_url;
    image.classList.add("gallery-image");
    image.style.objectFit = "cover";
    image.style.width = imageSide + "px";
    image.style.height = imageSide + "px";
    const zoomIcon = document.createElement("div");
    zoomIcon.classList.add("zoom-icon");
    zoomIcon.classList.add("ico-gen");
    zoomIcon.style.fontSize = "40px";
    zoomIcon.innerHTML = "O";
    const background = document.createElement("div");
    background.classList.add("gallery-image-back");
    const imageContainer = document.createElement("div");
    imageContainer.style.width = imageSide + "px";
    imageContainer.style.height = imageSide + "px";
    imageContainer.style.transition = "none";
    imageContainer.addEventListener(
      "mousemove",
      function rotate3DOnHover(event) {
        zoomIcon.style.display = "block";
        background.style.display = "block";

        const divRect = imageContainer.getBoundingClientRect();
        const divCenterX = divRect.left + divRect.width / 2;
        const divCenterY = divRect.top + divRect.height / 2;
        const mouseX = event.clientX;
        const mouseY = event.clientY;

        // Calculate the distance between the mouse pointer and the center of the div
        const distanceX = mouseX - divCenterX;
        const distanceY = mouseY - divCenterY;
        const maxDistanceX = Math.abs(divRect.left - divCenterX);
        const maxDistanceY = Math.abs(divRect.top - divCenterY);
        const ratioX = (distanceX / maxDistanceX) * -1;
        const ratioY = distanceY / maxDistanceY;
        // console.log(`distanceX: ${distanceX}, distanceY: ${distanceY}, maxDistanceX: ${maxDistanceX}, maxDistanceY: ${maxDistanceY}, ratioX: ${ratioX}, ratioY: ${ratioY}`);
        // Calculate the overall distance using the Pythagorean theorem
        const distanceFromCenter = Math.sqrt(
          distanceX * distanceX + distanceY * distanceY
        );
        const maxDistanceFromCenter = Math.sqrt(
          maxDistanceX * maxDistanceX + maxDistanceY * maxDistanceY
        );
        // console.log('Distance from center:', distanceFromCenter, " max:"+ maxDistanceFromCenter);
        const maxRotation = 8; // Maximum rotation angle in degrees
        const minRotation = 0; // Minimum rotation angle in degrees
        const rotationRange = maxRotation - minRotation;

        const rotation =
          minRotation +
          (distanceFromCenter / maxDistanceFromCenter) * rotationRange;
        const maxBoxShadowDepthX = Math.floor(ratioX * -4);
        const maxBoxShadowDepthY = Math.floor(ratioY * 4);
        imageContainer.style.boxShadow = `${maxBoxShadowDepthX}px ${maxBoxShadowDepthY}px 5px rgba(0, 211, 180, 0.3)`;
        imageContainer.style.transform = `perspective(600px) rotate3d(${ratioY}, ${ratioX}, 0, ${rotation}deg) scale(1.02)`;
      }
    );
    imageContainer.addEventListener("click", () => {
      selectPhoto(i, gallery);
      var thumbnails = document.querySelectorAll(".thumbnail-g");
      for (let i = 0; i < gallery.length; i++) {
        thumbnails[i].src = gallery[i].thumb_url;
      }
      document.getElementById("photoContainer").style.display = "flex";
      document.querySelector("main-page").style.visibility = "hidden";
    });
    imageContainer.addEventListener("mouseleave", () => {
      zoomIcon.style.display = "none";
      background.style.display = "none";
      imageContainer.style.boxShadow = "none";
      imageContainer.style.transform = "none";
    });
    imageContainer.classList.add("image-container");
    imageContainer.appendChild(image);
    imageContainer.appendChild(background);
    imageContainer.appendChild(zoomIcon);
    container.appendChild(imageContainer);
  }
  if (!extended) container.appendChild(containerShadow);
  document.getElementById(targetElement).appendChild(container);
}

// GALLERY PHOTO VIEW
function createPhotoViewer(targetElement, gallery) {
  const photoContainer = document.getElementById(targetElement);
  // Create large photo element
  const largePhoto = document.createElement("img");
  largePhoto.id = "largePhoto";
  largePhoto.src = "";
  largePhoto.alt = "Large Photo";
  const largePhotoHolder = document.createElement("div");
  largePhotoHolder.id = "largePhotoHolder";
  // Create thumbnail container
  const thumbnailContainer = document.createElement("div");
  thumbnailContainer.id = "thumbnailContainer";
  thumbnailContainer.classList.add("bg2");
  // Create title and subtitle elements
  const photoTitle = document.createElement("div");
  photoTitle.id = "photoTitle";
  const photoSubtitle = document.createElement("div");
  photoSubtitle.id = "photoSubtitle";
  // Append elements to the photo container
  largePhotoHolder.appendChild(largePhoto);
  photoContainer.appendChild(largePhotoHolder);
  photoContainer.appendChild(thumbnailContainer);
  photoContainer.appendChild(photoTitle);
  photoContainer.appendChild(photoSubtitle);
  photoContainer.classList.add("bg1");
  // Populate thumbnail images
  for (let i = 0; i < gallery.length; i++) {
    const thumbnail = document.createElement("img");
    thumbnail.classList.add("thumbnail-g");
    thumbnail.classList.add("animate-opacity");
    thumbnail.alt = `Thumbnail ${i + 1}`;
    thumbnail.addEventListener("click", () => selectPhoto(i, gallery));
    thumbnailContainer.appendChild(thumbnail);
  }
  // Set initial selection
  startPhotoVeiwer();
}

// Select a photo
function selectPhoto(index, gallery) {
  var selectedPhoto = gallery[index];
  const largePhoto = document.getElementById("largePhoto");
  const thumbnailContainer = document.getElementById("thumbnailContainer");
  const photoTitle = document.getElementById("photoTitle");
  const photoSubtitle = document.getElementById("photoSubtitle");

  // Remove previous selection
  const previousSelectedThumbnail = thumbnailContainer.querySelector(
    ".thumbnail.selected"
  );
  if (previousSelectedThumbnail) {
    previousSelectedThumbnail.classList.remove("selected");
  }

  // Add new selection
  const currentThumbnail = thumbnailContainer.children[index];
  currentThumbnail.classList.add("selected");

  // Show loading indicator
  const loadingIndicator = document.createElement("div");
  loadingIndicator.classList.add("loading-indicator");
  largePhoto.classList.add("animate-opacity");
  largePhoto.style.display = "none"; // Hide the large photo temporarily
  largePhoto.parentNode.insertBefore(loadingIndicator, largePhoto);
  largePhoto.src = selectedPhoto.image_url;
  console.log("onload started");
  largePhoto.onload = function () {
    // Remove the loading indicator when the image is loaded
    loadingIndicator.remove();
    console.log("onload");
    // Update the large photo source and show it
    largePhoto.style.display = "block";
  };

  photoTitle.textContent = selectedPhoto.name;
  photoSubtitle.textContent = selectedPhoto.description;
}

// Start photo viewer
function startPhotoVeiwer() {
  // Close button functionality
  const closeButton = document.getElementById("closeButton");
  closeButton.addEventListener("click", () => {
    document.getElementById("photoContainer").style.display = "none";
    document.querySelector("main-page").style.visibility = "visible";
  });

  // Zoom in, out and drag functionality
  const swipeImage = document.getElementById("largePhoto");
  const zoomInBtn = document.getElementById("zoomInButton");
  const zoomOutBtn = document.getElementById("zoomOutButton");
  var scale = 1;
  var isDragging = false;
  var startX = 0;
  var startY = 0;
  var currentTranslateX = 0;
  var currentTranslateY = 0;
  var previousTranslateX = 0;
  var previousTranslateY = 0;
  var previousEventScale = 1;

  swipeImage.addEventListener("mousedown", startDrag);
  swipeImage.addEventListener("touchstart", startDrag);

  swipeImage.addEventListener("mousemove", drag);
  swipeImage.addEventListener("touchmove", drag);

  swipeImage.addEventListener("mouseup", endDrag);
  swipeImage.addEventListener("touchend", endDrag);

  swipeImage.addEventListener("mouseleave", endDrag);
  swipeImage.addEventListener("touchcancel", endDrag);

  zoomInBtn.addEventListener("click", zoomIn);
  zoomOutBtn.addEventListener("click", zoomOut);

  swipeImage.addEventListener("gesturestart", onGestureStart);
  swipeImage.addEventListener("gesturechange", onGestureChange);
  swipeImage.addEventListener("gestureend", onGestureEnd);

  function startDrag(event) {
    event.preventDefault();
    isDragging = true;
    swipeImage.style.cursor = "grabbing";
    if (event.type === "touchstart") {
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

      if (event.type === "touchmove" && event.touches.length < 2) {
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
    if (scale > 0.5) scale -= 0.1;
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
    console.log(
      "Action" + (event.scale - previousEventScale) + "Scale: " + scale
    );
    previousEventScale = event.scale;
  }

  function onGestureEnd(event) {
    event.preventDefault();
    previousEventScale = 1;
    console.log("End: " + previousEventScale);
  }
}

// WORKS [WORK]
function generateWorks(targetElement, worksData) {
  const worksContainer = document.createElement("div");
  worksContainer.classList.add("works");
  var numColumn;
  switch (true) {
    case window.innerWidth >= 600 && window.innerWidth < 1200:
      numColumn = 2;
      break;
    case window.innerWidth >= 1200 && window.innerWidth < 1800:
      numColumn = 3;
      break;
    case window.innerWidth >= 1800 && window.innerWidth < 2400:
      numColumn = 4;
      break;
    case window.innerWidth >= 2400:
      numColumn = 5;
      break;
    default:
      numColumn = 1;
      break;
  }
  var workCardWidth = window.innerWidth / numColumn - 70;
  var len = worksData.length;
  for (let i = 0; i < len; i++) {
    const work = worksData[i];
    const workCard = document.createElement("div");
    workCard.classList.add("work-card-full", "bg2", "work-card");
    workCard.style.width = workCardWidth + "px";
    const image = document.createElement("img");
    image.classList.add("work-card-image-full");
    image.src = work.logo_image;
    const tagsContainer = document.createElement("div");
    tagsContainer.classList.add("work-card-tags");
    const typeTag = document.createElement("div");
    typeTag.classList.add("work-card-tag", "c-theme", "animate-slide-down");
    typeTag.textContent = work.type;
    tagsContainer.appendChild(typeTag);
    const stackTag = document.createElement("div");
    stackTag.classList.add(
      "work-card-tag",
      "c-theme-second",
      "animate-slide-down"
    );
    stackTag.textContent = work.stack;
    tagsContainer.appendChild(stackTag);
    const title = document.createElement("div");
    title.classList.add("work-card-title-full", "c1");
    title.textContent = work.name;
    const des = document.createElement("div");
    des.classList.add("work-card-des-full");
    des.textContent = work.work_role;
    const details = document.createElement("div");
    details.classList.add("work-card-details", "c2");
    details.textContent = work.details;
    workCard.addEventListener("mouseover", () => {
      workCard.classList.add("animate-infinite-tossing");
      image.style.filter = "blur(0px)";
      typeTag.style.display = "flex";
      stackTag.style.display = "flex";
    });
    workCard.addEventListener("mouseleave", () => {
      workCard.classList.remove("animate-infinite-tossing");
      image.style.filter = "blur(1px)";
      typeTag.style.display = "none";
      stackTag.style.display = "none";
    });
    workCard.addEventListener("click", () => {
      window.location.href = "/work/" + (i + 1);
    });
    workCard.appendChild(image);
    workCard.appendChild(tagsContainer);
    workCard.appendChild(title);
    workCard.appendChild(des);
    workCard.appendChild(details);
    worksContainer.appendChild(workCard);
  }
  const parentElement = document.getElementById(targetElement);
  parentElement.appendChild(worksContainer);
}
function generateWorkCard(work, workCardWidth, i) {
  var workCard = document.createElement("div");
  workCard.classList.add("work-card", "bg2");
  workCard.style.width = workCardWidth + "px";
  const image = document.createElement("img");
  image.classList.add("work-card-image");
  image.src = work.logo_image;
  const tagsContainer = document.createElement("div");
  tagsContainer.classList.add("work-card-tags");
  const typeTag = document.createElement("div");
  typeTag.classList.add("work-card-tag", "c-theme", "animate-right");
  typeTag.textContent = work.type;
  tagsContainer.appendChild(typeTag);
  const stackTag = document.createElement("div");
  stackTag.classList.add("work-card-tag", "c-theme-second", "animate-right");
  stackTag.textContent = work.stack;
  tagsContainer.appendChild(stackTag);
  const title = document.createElement("div");
  title.classList.add("work-card-title", "c1");
  title.textContent = work.name;
  title.addEventListener("click", () => {
    window.location.href = "/work/" + (i + 1);
  });
  const details = document.createElement("div");
  details.classList.add("work-card-details", "c2");
  details.textContent = work.details;
  workCard.addEventListener("mouseover", () => {
    image.style.filter = "grayscale(0%)"; // Set grayscale to 0% (full color)
    typeTag.style.display = "flex";
    stackTag.style.display = "flex";
    title.classList.add("work-card-text-style");
  });
  workCard.addEventListener("mouseleave", () => {
    image.style.filter = "grayscale(20%) blur(1px) saturate(70%)"; // Set grayscale to 0% (full color)
    typeTag.style.display = "none";
    stackTag.style.display = "none";
    title.classList.remove("work-card-text-style");
  });
  workCard.appendChild(image);
  workCard.appendChild(tagsContainer);
  workCard.appendChild(title);
  return workCard;
}
function createCardHolder(work, workBottom, workCardWidth, i) {
  var workCard = generateWorkCard(work, workCardWidth, i);
  var workCardBottom = generateWorkCard(workBottom, workCardWidth, i+1);
  workCardBottom.style.borderBottom = "none";
  var cardHolder = document.createElement("div");
  cardHolder.classList.add("work-card-holder");
  cardHolder.appendChild(workCard);
  cardHolder.appendChild(workCardBottom);
  return cardHolder;
}
function generateWorksMarquee(targetElement, worksData) {
  const worksContainer = document.createElement("div");
  worksContainer.classList.add("marquee-inner");
  const worksSpanOne = document.createElement("span");
  const worksSpanTwo = document.createElement("span");
  var numColumn;
  switch (true) {
    case window.innerWidth >= 600 && window.innerWidth < 1200:
      numColumn = 2;
      break;
    case window.innerWidth >= 1200 && window.innerWidth < 1800:
      numColumn = 3;
      break;
    case window.innerWidth >= 1800 && window.innerWidth < 2400:
      numColumn = 3;
      break;
    case window.innerWidth >= 2400:
      numColumn = 3;
      break;
    default:
      numColumn = 2;
      break;
  }
  var buff = 2 * (numColumn + 1);
  var workCardWidth = Math.round(
    window.innerWidth / numColumn - buff / numColumn
  );
  var len = (numColumn + 1) * 2;
  var parentWidth = workCardWidth * (numColumn + 1) + buff;
  console.log(workCardWidth * numColumn + buff, innerWidth);
  for (let i = 0; i < len; i += 2) {
    const work = worksData[i];
    const workBottom = worksData[i + 1];
    var cardHolderOne = createCardHolder(work, workBottom, workCardWidth, i);
    var cardHolderTwo = createCardHolder(
      work,
      workBottom,
      workCardWidth,
      i
    );
    worksSpanOne.appendChild(cardHolderOne);
    worksSpanTwo.appendChild(cardHolderTwo);
  }
  worksContainer.appendChild(worksSpanOne);
  worksContainer.appendChild(worksSpanTwo);
  worksContainer.style.width = parentWidth * 2 + "px";
  const parentElement = document.getElementById(targetElement);
  parentElement.style.width = parentWidth + "px";
  parentElement.appendChild(worksContainer);
}
// SOCIAL CONTACTS [CONTACT]
function generateSocialContact(targetElement, data) {
  const ul = document.createElement("ul");

  const socialLinks = [
    { href: data.facebook_url, text: "A" },
    { href: data.github_url, text: "B" },
    { href: data.linkedin_url, text: "C" },
    { href: data.whatsapp_url, text: "D" },
  ];

  socialLinks.forEach((link) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = link.href;
    a.target = "_blank";
    const span = document.createElement("span");
    span.className = "ico-circle";
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
  const infoParagraph = document.createElement("p");
  infoParagraph.className = "lead";
  infoParagraph.textContent = data.contact_preference_details;

  const ul = document.createElement("ul");
  ul.className = "list-ico";

  const listItems = [
    { text: data.address, icon: "K" },
    { text: data.phone, icon: "L" },
    { text: data.email, icon: "M" },
  ];

  listItems.forEach((item) => {
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.className = "ico-gen text-icon";
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
  const achievementDiv = document.createElement("div");
  achievementDiv.className = "achievement-preview";

  achievementData.forEach((data) => {
    const a = document.createElement("a");
    a.href = data.certification_url;
    a.className = "achievement-node tooltip";
    a.target = "_blank";

    const img = document.createElement("img");
    img.className = "achievement-node-image";
    img.src = data.certification_logo;
    img.setAttribute("data-tooltip", data.name);

    const tooltip = document.createElement("span");
    tooltip.className = "tooltip-text";
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
  const tooltips = document.querySelectorAll(".tooltip");
  tooltips.forEach((tooltip) => {
    const tooltipText = tooltip.querySelector(".tooltip-text");

    tooltip.addEventListener("mouseover", () => {
      tooltipText.style.visibility = "visible";
      tooltipText.style.opacity = "1";
    });

    tooltip.addEventListener("mouseout", () => {
      tooltipText.style.visibility = "hidden";
      tooltipText.style.opacity = "0";
    });
  });
}

// EXPERIENCES [ABOUT]
function generateExperienceHTML(targetElement, experienceData, extended) {
  function createPointBox(
    header,
    companyLinkText,
    dates,
    description,
    companyLink,
    descriptionLink,
    descriptionLinkText
  ) {
    var pointBox = document.createElement("div");
    pointBox.className = "point-box";

    var point = document.createElement("div");
    point.innerHTML =
      '<span class="hotspot main-wrapper">' +
      '<span class="hotspot dots-container">' +
      '<span class="hotspot dot1"></span>' +
      '<span class="hotspot dot2"></span>' +
      '<span class="hotspot dot3"></span>' +
      "</span>" +
      "</span>";
    pointBox.appendChild(point);

    var boxHeader = document.createElement("div");
    boxHeader.className = "box-header";
    boxHeader.textContent = header;
    boxHeader.addEventListener("click", () => {
      window.open(companyLink);
    });
    pointBox.appendChild(boxHeader);

    var boxSubHeader = document.createElement("div");
    boxSubHeader.className = "box-sub-header";
    var companyLinkElement = document.createElement("a");
    companyLinkElement.innerHTML =
      '<span class="cross-theme wobble" data-animation="upscale">' +
      companyLinkText +
      "</span>";
    boxSubHeader.appendChild(companyLinkElement);
    boxSubHeader.innerHTML = boxSubHeader.innerHTML + "<br />" + dates;
    boxSubHeader.addEventListener("click", () => {
      window.open(companyLink);
    });
    pointBox.appendChild(boxSubHeader);

    var boxDescription = document.createElement("div");
    boxDescription.className = "box-description";
    var descriptionLinkElement = document.createElement("a");
    descriptionLinkElement.innerHTML =
      '<span class="cross-theme wobble" data-animation="upscale">' +
      descriptionLinkText +
      "</span>";
    boxDescription.innerHTML = description;
    boxDescription.appendChild(descriptionLinkElement);
    boxDescription.addEventListener("click", () => {
      if (descriptionLink) window.open(descriptionLink);
      else window.open(companyLink);
    });
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
  var len = extended ? experienceData.length : 2;
  for (let i = 0; i < len; i++) {
    var experience = experienceData[i];
    var pointBox = createPointBox(
      experience.position,
      experience.institute_name,
      experience.end_date
        ? experience.start_date + " - " + experience.end_date
        : experience.start_date + " - Present",
      experience.project_text_1
        ? experience.project_details + ", "
        : experience.project_details,
      experience.institute_url,
      experience.project_url_1,
      experience.project_text_1 ? experience.project_text_1 : ""
    );
    columnContainer.appendChild(pointBox);
  }
}

// EDUCATION [ABOUT]
function generateEducationHTML(targetElement, educationData, extended) {
  function createPointBox(
    header,
    institution,
    institutionLink,
    dates,
    description
  ) {
    var pointBox = document.createElement("div");
    pointBox.className = "point-box";

    var point = document.createElement("div");
    point.innerHTML =
      '<span class="hotspot main-wrapper">' +
      '<span class="hotspot dots-container">' +
      '<span class="hotspot dot1"></span>' +
      '<span class="hotspot dot2"></span>' +
      '<span class="hotspot dot3"></span>' +
      "</span>" +
      "</span>";
    pointBox.appendChild(point);

    var boxHeader = document.createElement("div");
    boxHeader.className = "box-header";
    boxHeader.textContent = header;
    pointBox.appendChild(boxHeader);

    var boxSubHeader = document.createElement("div");
    boxSubHeader.className = "box-sub-header";
    var institutionLinkElement = document.createElement("a");
    institutionLinkElement.innerHTML =
      '<span class="cross-theme wobble" data-animation="upscale">' +
      institution +
      "</span>";
    boxSubHeader.appendChild(institutionLinkElement);
    boxSubHeader.innerHTML += "<br />" + dates;
    pointBox.appendChild(boxSubHeader);

    var boxDescription = document.createElement("div");
    boxDescription.className = "box-description";
    boxDescription.textContent = description;
    pointBox.appendChild(boxDescription);
    pointBox.addEventListener("click", () => {
      window.open(institutionLink);
    });

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
  var len = extended ? educationData.length : 2;
  for (let i = 0; i < len; i++) {
    var education = educationData[i];
    var pointBox = createPointBox(
      education.subject,
      education.institute_name,
      education.institute_url,
      education.end_date
        ? "Graduation year of " + education.end_date
        : education.start_date + " - Present",
      education.activity
    );
    columnContainer.appendChild(pointBox);
  }
}
// COMBINE QUALIFICATION [ABOUT]
function combineAndLabel(educations, experiences) {
  const combinedArray = [];
  let educationIndex = 0;
  let experienceIndex = 0;

  while (
    educationIndex < educations.length ||
    experienceIndex < experiences.length
  ) {
    if (educationIndex < educations.length) {
      combinedArray.push({ ...educations[educationIndex], type: "education" });
      educationIndex++;
    }

    if (experienceIndex < experiences.length) {
      combinedArray.push({
        ...experiences[experienceIndex],
        type: "experience",
      });
      experienceIndex++;
    }
  }

  return combinedArray;
}

// QUALIFICATION [ABOUT]

function generateQualification(targetElementId, combinedData) {
  // Create div elements with respective classes and styles
  const divExBoxLineLeft = document.createElement("div");
  divExBoxLineLeft.classList.add("ex-box-line", "about-line-left");

  const divExBoxLineRight = document.createElement("div");
  divExBoxLineRight.classList.add("ex-box-line", "about-line-right");

  combinedData.forEach((data, index) => {
    if (index % 2 === 0) {
      generateLeftSideCard(targetElementId, data);
    } else {
      generateRightSideCard(targetElementId, data);
    }
  });
  const targetElement = document.getElementById(targetElementId);
  targetElement.appendChild(divExBoxLineLeft);
  targetElement.appendChild(divExBoxLineRight);
}

// QUALIFICATION LEFT [ABOUT]

function generateLeftSideCard(targetElementId, data) {
  const divRowAboutCardRight = document.createElement("div");
  divRowAboutCardRight.classList.add("row", "about-card-right");

  const divColumn2RightAlign = document.createElement("div");
  divColumn2RightAlign.classList.add("column-2", "right-align");

  const divExPointBoxLeft = document.createElement("div");
  divExPointBoxLeft.classList.add("ex-point-box-left", "bg2", "move-right");

  divExPointBoxLeft.appendChild(generateQualificationData(data));

  const divExPointRight = document.createElement("div");
  divExPointRight.classList.add("ex-point-right", "bg1");

  divColumn2RightAlign.appendChild(divExPointBoxLeft);
  divColumn2RightAlign.appendChild(divExPointRight);

  divRowAboutCardRight.appendChild(divColumn2RightAlign);
  const targetElement = document.getElementById(targetElementId);
  targetElement.appendChild(divRowAboutCardRight);
}

// QUALIFICATION RIGHT [ABOUT]

function generateRightSideCard(targetElementId, data) {
  const divRowAboutCardLeft = document.createElement("div");
  divRowAboutCardLeft.classList.add("row", "about-card-left");

  const divColumn2RightAlign = document.createElement("div");
  divColumn2RightAlign.classList.add("column-2", "right-align");

  const divColumn2LeftAlign = document.createElement("div");
  divColumn2LeftAlign.classList.add("column-2", "left-align");

  const divExPointBoxRight = document.createElement("div");
  divExPointBoxRight.classList.add("ex-point-box-right", "bg2", "move-left");

  divExPointBoxRight.appendChild(generateQualificationData(data));

  const divExPointLeft = document.createElement("div");
  divExPointLeft.classList.add("ex-point-left", "bg1");

  divColumn2LeftAlign.appendChild(divExPointBoxRight);
  divColumn2LeftAlign.appendChild(divExPointLeft);

  divRowAboutCardLeft.appendChild(divColumn2RightAlign);
  divRowAboutCardLeft.appendChild(divColumn2LeftAlign);
  const targetElement = document.getElementById(targetElementId);
  targetElement.appendChild(divRowAboutCardLeft);
}

// QUALIFICATION DATA [ABOUT]

function generateQualificationData(data) {
  if (data.type == "education") {
    const divBoxHeader = document.createElement("div");
    divBoxHeader.classList.add("box-header");
    divBoxHeader.textContent = data.subject;

    const divBoxSubHeader = document.createElement("div");
    divBoxSubHeader.classList.add("box-sub-header");
    const instituteLink = document.createElement("a");
    instituteLink.href = data.institute_url;
    instituteLink.target = "_blank";
    const spanInstituteName = document.createElement("span");
    spanInstituteName.classList.add("cross-theme", "wobble");
    spanInstituteName.setAttribute("data-animation", "upscale");
    spanInstituteName.textContent = data.institute_name;
    instituteLink.appendChild(spanInstituteName);
    divBoxSubHeader.appendChild(instituteLink);
    divBoxSubHeader.innerHTML +=
      "<br>" +
      data.start_date +
      " - " +
      (data.is_present === "1" ? "Present" : data.end_date);

    const divBoxDescription = document.createElement("div");
    divBoxDescription.classList.add("box-description");
    divBoxDescription.textContent = data.activity;

    const divHolder = document.createElement("div");

    divHolder.appendChild(divBoxHeader);
    divHolder.appendChild(divBoxSubHeader);
    divHolder.appendChild(divBoxDescription);
    return divHolder;
  } else if (data.type == "experience") {
    const divBoxHeader = document.createElement("div");
    divBoxHeader.classList.add("box-header");
    divBoxHeader.textContent = data.position;

    const divBoxSubHeader = document.createElement("div");
    divBoxSubHeader.classList.add("box-sub-header");
    const instituteLink = document.createElement("a");
    instituteLink.href = data.institute_url;
    instituteLink.target = "_blank";
    const spanInstituteName = document.createElement("span");
    spanInstituteName.classList.add("cross-theme", "wobble");
    spanInstituteName.setAttribute("data-animation", "upscale");
    spanInstituteName.textContent = data.institute_name;
    instituteLink.appendChild(spanInstituteName);
    divBoxSubHeader.appendChild(instituteLink);
    divBoxSubHeader.innerHTML +=
      "<br>" +
      data.start_date +
      " - " +
      (data.is_present === "1" ? "Present" : data.end_date);

    const divBoxDescription = document.createElement("div");
    divBoxDescription.classList.add("box-description");
    divBoxDescription.textContent = `${data.project_details}, `;

    const projectLink = document.createElement("a");
    projectLink.href = data.project_url_1;
    projectLink.target = "_blank";
    const spanProjectText = document.createElement("span");
    spanProjectText.classList.add("cross-theme", "wobble");
    spanProjectText.setAttribute("data-animation", "upscale");
    spanProjectText.textContent = data.project_text_1;
    projectLink.appendChild(spanProjectText);
    divBoxDescription.appendChild(projectLink);

    const divHolder = document.createElement("div");
    divHolder.appendChild(divBoxHeader);
    divHolder.appendChild(divBoxSubHeader);
    divHolder.appendChild(divBoxDescription);
    return divHolder;
  } else {
    return null;
  }
}

// SINGLE PAGE [WORK]

function generateProjectHTML(data) {
  let html = `
      <div class="row" style="justify-content: center;">
          <div class="work-left">
              <div class="work-details">
                  <img class="img-float-left work-logo animate-left" src="${data.logo_image}" alt="Logo Image">
                  ${data.details}
              </div>
              <div class="work-gallery animate-left">`;

  // Loop through media data to add the right media links
  data.media.forEach((item) => {
    if (item.media_type === "Image") {
      html += `<img class="work-media" src="${item.media_link}" />`;
    } else if (item.media_type === "Vimeo") {
      html += `<iframe src="${item.media_link}" frameborder="0" allowfullscreen allow="autoplay; encrypted-media" class="work-media"></iframe>`;
    } else {
      html += `<video class="work-media" controls><source src="${item.media_link}" type="video/mp4"> Your browser does not support the video tag.</video>`;
    }
  });

  html += `
              </div>
          </div>
          <div class="work-right">
              <div class="work-stats animate-top">
                  <div class="work-card-tags-view">
                      <div class="work-card-tag-view c-theme">${data.type}</div>
                      <div class="work-card-tag-view c-theme-second">${data.stack}</div>
                  </div>
                  <b>Start Date:</b> ${data.start_date}<br /><br />
                  <b>Last Contribution Date:</b> ${data.last_contribution_date}<br /><br />
                  <b>Scope of Work:</b> ${data.scope_of_work}<br /><br />`;

  // Check and add live and source links if they exist
  if (data.live_url) {
    html += `<div class="work-links-view">
                  <a href="${data.live_url}" style="margin-bottom: 10px;" class="work-link-view c1">${data.live_text}</a>`;
  }

  if (data.source_url) {
    html += `<a href="${data.source_url}" style="margin-bottom: 10px;" class="work-link-view c1">Source</a>`;
  }

  html += `</div>
                  <b>Current Status:</b> ${data.current_status}<br /><br />
                  <b>Methodology:</b> ${data.methodology}<br /><br />
                  <b>Tech Stack:</b><br/>`;

  // Split tech stack value to get the list
  const techStackList = data.tech_stack.split(",");
  techStackList.forEach((tech) => {
    html += `<div class="tech c1">${tech.trim()}</div>`;
  });

  html += `<br/>
                  <b>Challenges and Risks:</b> ${data.challenges}<br /><br />
                  <b>Future Scope:</b> ${data.future_scope}<br /><br />
              </div>
          </div>
      </div>`;

  return html;
}
