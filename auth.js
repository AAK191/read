// Insecure client-side session check (for demonstration only)
if (localStorage.getItem('isLoggedIn')) {
    window.location.href = 'pomodoro.html';
}

// ... (rest of your auth.js code)

loginButton.addEventListener('click', () => {
    // ... (your existing login logic)
    if (email && password) {
        localStorage.setItem('isLoggedIn', 'true'); // Insecure way to store login status
        window.location.href = 'pomodoro.html';
    }
    // ...
});

signupButton.addEventListener('click', () => {
    // ... (your existing signup logic)
    if (email && password && password === confirmPassword) {
        alert('Account created successfully! Please sign in.');
        signupForm.style.display = 'none';
        loginForm.style.display = 'flex';
        // You might choose to log them in immediately here and set localStorage
        // localStorage.setItem('isLoggedIn', 'true');
        // window.location.href = 'pomodoro.html';
    }
    // ...
});