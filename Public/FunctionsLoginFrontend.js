async function login() {
    //post to backend with user and password
    var userName = document.getElementById("inputUserName").value;
    var password = document.getElementById("inputPassword").value;

    const userInfo = {
        "userName": userName,
        "password": password
    }

    //post request to backend for authorization check
    response = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            "Content-Type": "application/json"},
        body: JSON.stringify(userInfo)
    }).then((response) => response.json());

    if (!response) {
        alert("wrong");
    } else {
        const author = await fetch("http://localhost:3000/authorize")
        alert("hey");
        location.reload()
    }
}