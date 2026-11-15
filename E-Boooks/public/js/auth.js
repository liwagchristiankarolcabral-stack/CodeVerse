// Check logged-in user
async function checkUser() {

    try {

        const response = await fetch("/api/user");

        if (!response.ok) {
            window.location.href = "login.html";
            return null;
        }

        const result = await response.json();

        return result.user;

    } catch (error) {

        window.location.href = "login.html";
        return null;

    }

}

// Log out
async function logoutUser() {

    try {

        const response = await fetch("/api/logout", {
            method: "POST"
        });

        if (!response.ok) {
            throw new Error("Unable to log out.");
        }

        window.location.href = "login.html";

    } catch (error) {

        alert(error.message);

    }

}
