// Configuration for synchronizeInfo usage

sync = {
  pages: {
    home: "HOME",
    expertise: "EXPERTISE",
    about: "ABOUT",
    hobbies: "HOBBIES",
    work_details: "WORK_DETAILS",
    works: "WORKS",
    gaming: "GAMING"
  },
  features: {
    full_page: "FULL_PAGE",
    resume_button: "RESUME_BUTTON",
    contact_me_button: "CONTACT_ME_BUTTON",
    theme_toggle: "THEME_TOGGLE",
    nav_bar: "NAV_BAR",
    back_to_top_button: "BACK_TO_TOP_BUTTON",
    about_me_button: "ABOUT_ME_BUTTON",
    expertise_more_button: "EXPERTISE_MORE_BUTTON",
    view_projects_button: "VIEW_PROJECTS_BUTTON",
    explore_hobbies_button: "EXPLORE_HOBBIES_BUTTON",
    works_marquee: "WORKS_MARQUEE",
    works_card: "WORKS_CARD",
    gallery_container: "GALLERY_CONTAINER",
    gallery_thumbnail: "GALLERY_THUMBNAIL",
    photo_viewer: "PHOTO_VIEWER",
    direct_message_form: "DIRECT_MESSAGE_FORM",
  },
  activities: {
    page_view: "PAGE_VIEW",
    click: "CLICK",
    submit: "SUBMIT",
  },
  actions: {
    visit: "VISIT",
    download: "DOWNLOAD",
    go_to_contact: "GO_TO_CONTACT",
    view_work: "VIEW_WORK",
    open_gallery_photo: "OPEN_GALLERY_PHOTO",
    redirect_suffix: "_REDIRECT",
    nav_logo_redirect: "LOGO_REDIRECT",
    logo_redirect: "LOGO_REDIRECT",
    applied_dark_theme: "APPLIED_DARK_THEME",
    applied_light_theme: "APPLIED_LIGHT_THEME",
    scroll_to_top: "SCROLL_TO_TOP",
    go_to_about_page: "GO_TO_ABOUT_PAGE",
    go_to_expertise_page: "GO_TO_EXPERTISE_PAGE",
    go_to_works_page: "GO_TO_WORKS_PAGE",
    go_to_hobbies_page: "GO_TO_HOBBIES_PAGE",
    send_direct_message: "SEND_DIRECT_MESSAGE",
    expertise_more_click: "EXPERTISE_MORE_CLICK",
  },
};

function synchronizePage(pageName) {
  if (!sync.pages[pageName]) {
    console.error("synchronizePage: Unknown page name:", pageName);
    return;
  }
  // Page View Tracking
  var trackedActionName = sync.actions.visit;
  if (pageName === "work_details") {
    var workTitleEl = document.getElementById("work-title");
    var workTitle = workTitleEl ? workTitleEl.textContent.trim() : "NO_TITLE";
    trackedActionName = "WORK:" + workTitle;
  }
  synchronizeInfo(
    sync.pages[pageName],
    sync.features.full_page,
    sync.activities.page_view,
    trackedActionName
  );

  // Resume Download Tracking
  var resumeLink = document.getElementById("resume");
  if (resumeLink) {
    resumeLink.addEventListener("click", function () {
      synchronizeInfo(
        sync.pages[pageName],
        sync.features.resume_button,
        sync.activities.click,
        sync.actions.download
      );
    });
  }
  // Contact Button Tracking
  var contactLink = document.getElementById("button-3");
  if (contactLink) {
    contactLink.addEventListener("click", function () {
      synchronizeInfo(
        sync.pages[pageName],
        sync.features.contact_me_button,
        sync.activities.click,
        sync.actions.go_to_contact
      );
    });
  }

  // Navbar Navigation Tracking
  var navLinks = document.querySelectorAll(".nav-links");
  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      var linkText = link.textContent.trim().toUpperCase();
      var actionName = linkText + sync.actions.redirect_suffix;

      synchronizeInfo(
        sync.pages[pageName],
        sync.features.nav_bar,
        sync.activities.click,
        actionName
      );
    });
  });

  // Logo Navigation Tracking
  var logoLink = document.querySelector(".nav-logo");
  if (logoLink) {
    logoLink.addEventListener("click", function () {
      synchronizeInfo(
        sync.pages[pageName],
        sync.features.nav_bar,
        sync.activities.click,
        sync.actions.logo_redirect
      );
    });
  }

  // Theme Toggle Tracking
  var themeToggleButton = document.getElementById("theme-toogle-button");
  if (themeToggleButton) {
    themeToggleButton.addEventListener("click", function () {
      // Determine the theme that will be applied after this click
      var currentTheme = getCookie("theme");
      var actionName;
      if (currentTheme === "dark") {
        actionName = sync.actions.applied_dark_theme;
      } else if (currentTheme === "light") {
        actionName = sync.actions.applied_light_theme;
      } else {
        actionName = sync.actions.applied_dark_theme;
      }
      synchronizeInfo(
        sync.pages[pageName],
        sync.features.theme_toggle,
        sync.activities.click,
        actionName
      );
    });
  }

  // Back-to-Top Button Tracking
  var backToTopBtn = document.getElementById("back-to-top-btn");
  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", function () {
      synchronizeInfo(
        sync.pages[pageName],
        sync.features.back_to_top_button,
        sync.activities.click,
        sync.actions.scroll_to_top
      );
    });
  }

  // About Me Button Tracking
  var aboutMeBtn = document.getElementById("about-me-btn");
  if (aboutMeBtn) {
    aboutMeBtn.addEventListener("click", function () {
      synchronizeInfo(
        sync.pages[pageName],
        sync.features.about_me_button,
        sync.activities.click,
        sync.actions.go_to_about_page
      );
    });
  }

  // Expertise More Button Tracking
  var expertiseMoreBtn = document.getElementById("expertise-more-btn");
  if (expertiseMoreBtn) {
    expertiseMoreBtn.addEventListener("click", function () {
      synchronizeInfo(
        sync.pages[pageName],
        sync.features.expertise_more_button,
        sync.activities.click,
        sync.actions.expertise_more_click
      );
    });
  }
  // View Projects Button Tracking
  var viewProjectsBtn = document.getElementById("view-projects-btn");
  if (viewProjectsBtn) {
    viewProjectsBtn.addEventListener("click", function () {
      synchronizeInfo(
        sync.pages[pageName],
        sync.features.view_projects_button,
        sync.activities.click,
        sync.actions.go_to_works_page
      );
    });
  }
  // Explore Hobbies Button Tracking
  var exploreHobbiesBtn = document.getElementById("explore-hobbies-btn");
  if (exploreHobbiesBtn) {
    exploreHobbiesBtn.addEventListener("click", function () {
      synchronizeInfo(
        sync.pages[pageName],
        sync.features.explore_hobbies_button,
        sync.activities.click,
        sync.actions.go_to_hobbies_page
      );
    });
  }

  // Send Direct Message Form Submission Tracking
  var directMessageForm = document.getElementById("direct-message");
  if (directMessageForm) {
    directMessageForm.addEventListener("submit", function () {
      synchronizeInfo(
        sync.pages[pageName],
        sync.features.direct_message_form,
        sync.activities.submit,
        sync.actions.send_direct_message
      );
    });
  }

  // WORKS: track clicks on work cards
  var workCards = document.querySelectorAll('.work-card');
  if (workCards && workCards.length) {
    workCards.forEach(function (card) {
      card.addEventListener('click', function (evt) {
        var titleEl = card.querySelector('.work-card-title') || card.querySelector('.work-card-title-full');
        var workTitle = titleEl ? titleEl.textContent.trim() : 'UNKNOWN_WORK';
        synchronizeInfo(
          sync.pages[pageName],
          sync.features.works_card,
          sync.activities.click,
          sync.actions.view_work + ':' + workTitle
        );
      });
    });
  }

  // GALLERY: track clicks on gallery thumbnails
  var imageContainers = document.querySelectorAll('.image-container');
  if (imageContainers && imageContainers.length) {
    imageContainers.forEach(function (imgEl) {
      imgEl.addEventListener('click', function (evt) {
        // prefer data-name attribute for title
        var title = imgEl.getAttribute('data-name') || 'UNKNOWN_PHOTO';
        synchronizeInfo(
          sync.pages[pageName],
          sync.features.gallery_thumbnail,
          sync.activities.click,
          sync.actions.open_gallery_photo + ':' + title
        );
      });
    });
  }

}
