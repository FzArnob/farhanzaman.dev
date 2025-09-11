// Configuration for synchronizeInfo usage

sync = {
  home: {
    page: "HOME",
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
    },
  },
  expertise: {
    page: "EXPERTISE",
    features: { full_page: "FULL_PAGE" },
    activities: { page_view: "PAGE_VIEW" },
    actions: { visit: "VISIT" },
  },
};

function synchronizePage(pageName) {
  // Page View Tracking
  synchronizeInfo(
    sync[pageName].page,
    sync[pageName].features.full_page,
    sync[pageName].activities.page_view,
    sync[pageName].actions.visit
  );

  // Resume Download Tracking
  var resumeLink = document.getElementById("resume");
  if (resumeLink) {
    resumeLink.addEventListener("click", function () {
      synchronizeInfo(
        sync[pageName].page,
        sync[pageName].features.resume_button,
        sync[pageName].activities.click,
        sync[pageName].actions.download
      );
    });
  }
  // Contact Button Tracking
  var contactLink = document.getElementById("button-3");
  if (contactLink) {
    contactLink.addEventListener("click", function () {
      synchronizeInfo(
        sync[pageName].page,
        sync[pageName].features.contact_me_button,
        sync[pageName].activities.click,
        sync[pageName].actions.go_to_contact
      );
    });
  }

  // Navbar Navigation Tracking
  var navLinks = document.querySelectorAll(".nav-links");
  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      var linkText = link.textContent.trim().toUpperCase();
      var actionName = linkText + sync[pageName].actions.redirect_suffix;

      synchronizeInfo(
        sync[pageName].page,
        sync[pageName].features.nav_bar,
        sync[pageName].activities.click,
        actionName
      );
    });
  });

  // Logo Navigation Tracking
  var logoLink = document.querySelector(".nav-logo");
  if (logoLink) {
    logoLink.addEventListener("click", function () {
      synchronizeInfo(
        sync[pageName].page,
        sync[pageName].features.nav_bar,
        sync[pageName].activities.click,
        sync[pageName].actions.logo_redirect
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
        actionName = sync[pageName].actions.applied_dark_theme;
      } else if (currentTheme === "light") {
        actionName = sync[pageName].actions.applied_light_theme;
      } else {
        actionName = sync[pageName].actions.applied_dark_theme;
      }
      synchronizeInfo(
        sync[pageName].page,
        sync[pageName].features.theme_toggle,
        sync[pageName].activities.click,
        actionName
      );
    });
  }

  // Back-to-Top Button Tracking
  var backToTopBtn = document.getElementById("back-to-top-btn");
  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", function () {
      synchronizeInfo(
        sync[pageName].page,
        sync[pageName].features.back_to_top_button,
        sync[pageName].activities.click,
        sync[pageName].actions.scroll_to_top
      );
    });
  }

  // About Me Button Tracking
  var aboutMeBtn = document.getElementById("about-me-btn");
  if (aboutMeBtn) {
    aboutMeBtn.addEventListener("click", function () {
      synchronizeInfo(
        sync[pageName].page,
        sync[pageName].features.about_me_button,
        sync[pageName].activities.click,
        sync[pageName].actions.go_to_about_page
      );
    });
  }

  // Expertise More Button Tracking
  var expertiseMoreBtn = document.getElementById("expertise-more-btn");
  if (expertiseMoreBtn) {
    expertiseMoreBtn.addEventListener("click", function () {
      synchronizeInfo(
        sync[pageName].page,
        sync[pageName].features.expertise_more_button,
        sync[pageName].activities.click,
        sync[pageName].actions.expertise_more_click
      );
    });
  }
  // View Projects Button Tracking
  var viewProjectsBtn = document.getElementById("view-projects-btn");
  if (viewProjectsBtn) {
    viewProjectsBtn.addEventListener("click", function () {
      synchronizeInfo(
        sync[pageName].page,
        sync[pageName].features.view_projects_button,
        sync[pageName].activities.click,
        sync[pageName].actions.go_to_works_page
      );
    });
  }
  // Explore Hobbies Button Tracking
  var exploreHobbiesBtn = document.getElementById("explore-hobbies-btn");
  if (exploreHobbiesBtn) {
    exploreHobbiesBtn.addEventListener("click", function () {
      synchronizeInfo(
        sync[pageName].page,
        sync[pageName].features.explore_hobbies_button,
        sync[pageName].activities.click,
        sync[pageName].actions.go_to_hobbies_page
      );
    });
  }

  // Send Direct Message Form Submission Tracking
  var directMessageForm = document.getElementById("direct-message");
  if (directMessageForm) {
    directMessageForm.addEventListener("submit", function () {
      synchronizeInfo(
        sync[pageName].page,
        sync[pageName].features.direct_message_form,
        sync[pageName].activities.submit,
        sync[pageName].actions.send_direct_message
      );
    });
  }
}
