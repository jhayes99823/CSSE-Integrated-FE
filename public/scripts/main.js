/**
 * @fileoverview
 * Provides the JavaScript interactions for all pages.
 *
 * @author 
 * PUT_YOUR_NAME_HERE
 */

/** namespace. */
var rhit = rhit || {};

/** globals */
rhit.variableName = "";
rhit.BASE_URL = "http://433-21.csse.rose-hulman.edu:3100/api";
rhit.MONGO_URL = rhit.BASE_URL + '/mongo';
rhit.REDIS_URL = rhit.BASE_URL + '/redis';

rhit.CURR_USER_KEY = 'currUser';

/** function and class syntax examples */
rhit.functionName = function () {
	/** function body */
};

rhit.ClassName = class {
	constructor() {

	}

	methodName() {

	}
}

rhit.LoginPageController = class {
	constructor() {
		console.log('im the login page controller')

		document.querySelector("#login-btn").onclick = (event) => {
			const username = document.querySelector("#username-field");
			const password = document.querySelector("#password-field");
			const data = { "username": username.value, "password": password.value };

			fetch(rhit.REDIS_URL + '/login', {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data)
			})
				.then(response => response.json())
				.then((data) => {
					console.log('data  ', data);
					console.log('data.resultValue  ', data.returnValue);
					console.log('data.username  ', data.username);
					console.log('data.returnValue.username,   ', data.returnValue.username);
					if (data.returnValue.username) {
						localStorage.setItem(rhit.CURR_USER_KEY, { "username": data.returnValue.username, "password": data.returnValue.password });
					}
				}).then(() => {
					rhit.checkForRedirects();
				})
		}
	}
}


rhit.checkForRedirects = function () {
	if (document.querySelector("#loginPage") && localStorage.getItem(this.CURR_USER_KEY)) {
		console.log('made it to main page redirect')
		console.log("Redirect to list page");
		window.location.href = "/";
	}
	if (!document.querySelector("#loginPage") && !localStorage.getItem(this.CURR_USER_KEY)) {
		console.log("Redirect to login page");
		window.location.href = "/login.html";
	}
};

rhit.initializePage = function () {
	// const urlParams = new URLSearchParams(window.location.search);
	if (document.querySelector("#loginPage")) {
		console.log("You are on the login page.");
		new rhit.LoginPageController();
	}
}

/* Main */
/** function and class syntax examples */
/* Main */
rhit.main = function () {
	console.log("Ready");

	rhit.checkForRedirects();
	rhit.initializePage();
};

rhit.main();