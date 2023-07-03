//  ================================================= API Call Handler ================================================= 
fetchProfileData()
    .then(result => {
        console.log(result);
        // Handle the response data here
        document.title = result.profile.info.full_name+' - '+result.profile.info.name_subtitle+' '+result.profile.info.name_subtitle_highlight;
        document.getElementById('nick_name').innerHTML = result.profile.info.nick_name;
        document.getElementById('designation').innerHTML = result.profile.info.designation;
        document.getElementById('intro_text').innerHTML = result.profile.info.intro_text; 
        document.getElementById('footer_name').innerHTML = result.profile.info.full_name; 
        document.getElementById('expertise-text').innerHTML = result.profile.info.expertise_preference_details;
        generateInfo('info', result.profile.info);
        showIntroAnimation();
        generateSocialContact('social-contact', result.profile.info);
        generateEducationHTML("education", result.profile.educations);
        generateExperienceHTML("experiences", result.profile.experiences);
        generateAchievements('achievements', result.profile.achievements);
        window.addEventListener("scroll", skillBarAnimation(result.profile.skills));
        createSkillCloud(result.profile.expertises);
        createGallery(result.profile.gallery, false);
        createPhotoViewer('photoContainer', result.profile.gallery);
        startPhotoVeiwer();
        generateWorks("works", result.profile.projects, false);
        enableMessages();
        setTimeout(function () {
                document.querySelector("pre-loader").style.display = "none"; // hide
                document.querySelector("main-page").style.display = "block"; // show
                wobbleAnimation();
            }, 1000);
    })
    .catch(error => {
        console.error(error); // Handle any errors here
    });


    // ============================================= Special Util ============================================================
    document.getElementById("content-gap").style.marginTop = window.innerHeight + "px";
    document.getElementById("content-gap").style.border = "none";