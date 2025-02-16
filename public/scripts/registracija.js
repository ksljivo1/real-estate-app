window.onload = () => {
    const signUpButton = document.getElementById("submit-button")
    const password = document.getElementById("password")
    const confirmed = document.getElementById("confirmed-password")
    const username = document.getElementById("username")

    password.addEventListener("input", () => {
        const warning = document.getElementById("password-warning")
        if (password.value.length < 8) {
            warning.style.visibility = "visible"
            signUpButton.disabled = true
        } else {
            warning.style.visibility = "hidden"
            signUpButton.disabled = false
        }
    });

    confirmed.addEventListener("input", () => {
        const message = document.getElementById("password-mismatch-message")
        if (!password || password.value !== confirmed.value) {
            message.style.visibility = "visible"
            signUpButton.disabled = true
        } else {
            message.style.visibility = "hidden"
            signUpButton.disabled = false
        }
    })
    signUpButton.addEventListener("click", (event) => {
        event.preventDefault()
        PoziviAjax.signUp(
            document.getElementById("name").value,
            document.getElementById("last-name").value,
            username.value,
            password.value,
            (err, data) => {
                if (err && err.status === 409) {
                    document.getElementById("areaBelow").innerHTML = "<p>The username you selected is already in use. Please choose a different one.</p>"
                    username.value = ""
                    username.focus()
                }
                else {
                    document.getElementById("areaBelow").innerHTML = ""
                    displayNotification()
                }
            }
        )
    })
}

function displayNotification() {
    const notification = document.createElement('div');
    notification.innerText = "Signup successful!";
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.backgroundColor = '#333';
    notification.style.color = 'white';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '5px';
    notification.style.fontSize = '16px';
    notification.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
    document.body.appendChild(notification);


    setTimeout(() => {
        notification.style.opacity = '0'
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 5000);
}