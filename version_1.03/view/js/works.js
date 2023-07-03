//  ================================================= API Call Handler ================================================= 
fetchWorksData()
    .then(result => {
        console.log(result);
        // Handle the response data here
        document.title = result.profile.info.full_name+' - Works';
        document.getElementById('footer_name').innerHTML = result.profile.info.full_name; 
        generateWorks("works", result.profile.projects, true);
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