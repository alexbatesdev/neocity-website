const handleRegisterClicked = () => {
    let button = document.getElementById('register-button');
    if (button.classList.contains('disabled')) {
        return;
    } else {
        button.classList.add('disabled');
        button.innerText = 'Registering...';
    }
    const email = document.getElementById('email').value;
    const name = document.getElementById('name').value;
    const password = document.getElementById('password').value;

    const data = {
        email: email,
        name: name,
        password: password
    };

    //Not real endpoint
    const url = "https://hjpe29d12e.execute-api.us-east-1.amazonaws.com/1/user/register"
    //Not real endpoint

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(response => {
        console.log(response);
        button.classList.remove('disabled');
        button.innerText = 'Register';
        if (response.status === 200) {
            alert('User registered successfully');
            window.location.href = 'login.html';
        } else {
            response.json().then(data => {
                alert(data.message);
            });
        }
    }).catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again later.')
    });
}

document.getElementById('password').addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        handleRegisterClicked();
    }
});