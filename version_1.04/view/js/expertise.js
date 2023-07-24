//  ================================================= API Call Handler ================================================= 
fetchExpertiseData()
    .then(result => {
        console.log(result);
        // Handle the response data here
        document.title = result.profile.info.full_name+' - Works';
        document.getElementById('footer_name').innerHTML = result.profile.info.full_name; 
        document.getElementById('expertise-text').innerHTML = result.profile.info.expertise_preference_details;
        generateExpertiseCards('expertise-items', result.profile.expertises)
        generateAchievements('achievements', result.profile.achievements);
        window.addEventListener("scroll", skillBarAnimation(result.profile.skills, true));
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
    document.getElementById("content-gap").style.border = "none";