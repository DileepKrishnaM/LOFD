import { getCurrentUser, getUserInfo, logoutUser } from "./firebase.js";
import {
	getAuth,
	sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

// DOM elements
const profileImg = document.getElementById("profileImg");
const profileDropdown = document.getElementById("profileDropdown");
const usernameElement = document.getElementById("username");
const headerUsernameElement = document.getElementById("headerUsername");
const signoutBtn = document.getElementById("signoutBtn");
const resetPasswordBtn = document.getElementById("resetPasswordBtn");
const auth = getAuth();

loadUserInfo();

// Toggle dropdown when profile image is clicked
profileImg.addEventListener("click", function (e) {
	e.stopPropagation();
	profileDropdown.classList.toggle("show");

	// Get and display current user info if dropdown is shown
	if (profileDropdown.classList.contains("show")) {
		loadUserInfo();
	}
});

// Close dropdown when clicking elsewhere on the page
window.addEventListener("click", function () {
	if (profileDropdown.classList.contains("show")) {
		profileDropdown.classList.remove("show");
	}
});

// Prevent dropdown from closing when clicked inside
profileDropdown.addEventListener("click", function (e) {
	e.stopPropagation();
});

// Handle sign out
signoutBtn.addEventListener("click", async function () {
	const result = await logoutUser();
	if (result.success) {
		// Redirect to login page after successful logout
		window.location.href = "./login.html";
	} else {
		alert("Failed to sign out: " + result.error);
	}
});

// Handle reset password
resetPasswordBtn.addEventListener("click", async function () {
	try {
		const user = await getCurrentUser();
		if (user && user.email) {
			await sendPasswordResetEmail(auth, user.email);
			alert("Password reset email sent! Check your inbox.");
			profileDropdown.classList.remove("show");
		} else {
			alert("You need to be logged in to reset your password.");
		}
	} catch (error) {
		alert("Error sending password reset email: " + error.message);
	}
});

// Load user information
async function loadUserInfo() {
	try {
		// Get current authenticated user
		const user = await getCurrentUser();

		if (user) {
			// Get user info from Firestore
			const userInfo = await getUserInfo(user.uid);
			let loginBtn = document.getElementById('login-btn')
			let signoutBtn = document.getElementById('signoutBtn')


			signoutBtn.innerText = 'Sign out'
			loginBtn.style.display = 'none'
			if (userInfo.success) {
				// Display username in both places
				usernameElement.textContent = userInfo.data.username;
				headerUsernameElement.textContent = userInfo.data.username;
			} else {
				usernameElement.textContent = "User";
				headerUsernameElement.textContent = "User";
				console.error("Failed to get user info:", userInfo.error);
			}
		} else {
			// User not logged in, redirect to login page
			signoutBtn.addEventListener("click", async function () {
				window.location.href='./login.html'
			});
			usernameElement.textContent = "Guest";
			headerUsernameElement.textContent = "Guest";
		}
	} catch (error) {
		console.error("Error loading user info:", error);
		usernameElement.textContent = "Error";
		headerUsernameElement.textContent = "Error";
	}
}

// Check authentication status and load username when page loads
document.addEventListener("DOMContentLoaded", async function () {
	loadUserInfo();
});