const host = "http://localhost/fzs-lab-portfolio/version_1.01/backend/api";

document.getElementById("direct-message").addEventListener("submit", function (event) {
    event.preventDefault();
    var name = document.getElementById("message-name").value;
    var email = document.getElementById("message-email").value;
    var subject = document.getElementById("message-subject").value;
    var message = document.getElementById("message").value;
    var header = new Headers();
    header.append("Content-Type", "application/x-www-form-urlencoded");

    var urlencoded = new URLSearchParams();
    urlencoded.append("profile_id", "farhan");
    urlencoded.append("name", name);
    urlencoded.append("email", email);
    urlencoded.append("subject", subject);
    urlencoded.append("message", message);

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
                        setTimeout(function () {
                            document.getElementById("sendmessage").style.display = 'none';
                        }, 4000);
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