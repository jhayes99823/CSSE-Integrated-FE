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
						const retData = JSON.stringify(data.returnValue);
						localStorage.setItem(rhit.CURR_USER_KEY, retData);
					}
				}).then(() => {
					rhit.checkForRedirects();
				})
		}
	}
}

rhit.MainPageController = class {
	constructor() {
		console.log('im the main page controller');

		this.getLikedList()
		this.getDislikedList();

		document.querySelector('#logout-btn').addEventListener("click", (event) => {
			localStorage.removeItem(rhit.CURR_USER_KEY);
			rhit.checkForRedirects();
		});

		$("#addDislikeModal").on("show.bs.modal", (event) => {
			console.log('made it here');
			// pre animation
			fetch(rhit.MONGO_URL + '/game')
				.then(response => response.json())
				.then((data) => {
					$.each(data.returnValue, function (i, item) {
						$('#gameOptList').append($('<option>', {
							value: item._id,
							text: item.game_title
						}));
					});
				});
		});

		$("#addDislikeModal").on("hide.bs.modal", (event) => {
			$('#gameOptList').empty()
		});

		$("#deleteDislikeModal").on("show.bs.modal", (event) => {
			console.log('made it here');
			// pre animation
			fetch(rhit.REDIS_URL + '/dislike?username=' + rhit.currUserUsername())
				.then(response => response.json())
				.then((data) => {
					for (let val of data.returnValue) {
						rhit.GetGameInfo(val).then(retData => {
							$('#dislikedOptList').append($('<option>', {
								value: retData._id,
								text: retData.game_title
							}));
						});
					}
				});
		});

		$("#deleteDislikeModal").on("hide.bs.modal", (event) => {
			$('#dislikedOptList').empty()
		});

		document.querySelector("#deleteDislikedGame").addEventListener("click", (event) => {
			let game = document.querySelector("#dislikedOptList").value;
			let username = rhit.currUserUsername();
			let data = { username, gameID: game };

			fetch(rhit.REDIS_URL + '/dislike', {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data)
			}).then(response => response.json())
				.then((data) => {
					if (data) location.reload();
				});
		});

		document.querySelector("#submitDislikedGame").addEventListener("click", (event) => {
			let game = document.querySelector("#gameOptList").value;
			const username = rhit.currUserUsername();
			const data = { username, gameID: game };

			fetch(rhit.REDIS_URL + '/dislike', {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data)
			})
				.then(response => response.json())
				.then((data) => {
					if (data) location.reload();
				});
		});

		$("#addLikedModal").on("show.bs.modal", (event) => {
			console.log('made it here   liked');
			// pre animation
			fetch(rhit.MONGO_URL + '/game')
				.then(response => response.json())
				.then((data) => {
					$.each(data.returnValue, function (i, item) {
						$('#gameOptListLiked').append($('<option>', {
							value: item._id,
							text: item.game_title
						}));
					});
				});
		});

		$("#addLikedModal").on("hide.bs.modal", (event) => {
			$('#gameOptListLiked').empty()
		});

		$("#deleteLikeModal").on("show.bs.modal", (event) => {
			// pre animation
			fetch(rhit.REDIS_URL + '/like?username=' + rhit.currUserUsername())
				.then(response => response.json())
				.then((data) => {
					for (let val of data.returnValue) {
						rhit.GetGameInfo(val).then(retData => {
							$('#likedOptList').append($('<option>', {
								value: retData._id,
								text: retData.game_title
							}));
						});
					}
				});
		});

		$("#deleteLikeModal").on("hide.bs.modal", (event) => {
			$('#likedOptList').empty()
		});

		document.querySelector("#deleteDislikedGame").addEventListener("click", (event) => {
			let game = document.querySelector("#dislikedOptList").value;
			let username = rhit.currUserUsername();
			let data = { username, gameID: game };

			fetch(rhit.REDIS_URL + '/dislike', {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data)
			}).then(response => response.json())
				.then((data) => {
					if (data) location.reload();
				});
		});

		document.querySelector("#deleteLikedGame").addEventListener("click", (event) => {
			let game = document.querySelector("#likedOptList").value;
			let username = rhit.currUserUsername();
			let data = { username, gameID: game };

			fetch(rhit.REDIS_URL + '/like', {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data)
			}).then(response => response.json())
				.then((data) => {
					if (data) location.reload();
				});
		});

		document.querySelector("#submitDislikedGame").addEventListener("click", (event) => {
			let game = document.querySelector("#gameOptList").value;
			const username = rhit.currUserUsername();
			const data = { username, gameID: game };

			fetch(rhit.REDIS_URL + '/dislike', {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data)
			})
				.then(response => response.json())
				.then((data) => {
					if (data) location.reload();
				});
		});

		document.querySelector("#submitLikedGame").addEventListener("click", (event) => {
			let game = document.querySelector("#gameOptListLiked").value;
			const username = rhit.currUserUsername();
			const data = { username, gameID: game };

			fetch(rhit.REDIS_URL + '/like', {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data)
			})
				.then(response => response.json())
				.then((data) => {
					if (data) location.reload();
				});
		});
	}

	getLikedList() {
		const newList = htmlToElement('<div id="itemRow-like" class="row"> </div>');

		fetch(rhit.REDIS_URL + '/like?username=' + rhit.currUserUsername())
			.then(response => response.json())
			.then((data) => {
				console.log('data   ', data);
				console.log('data.resultValue   ', data.returnValue);
				for (let val of data.returnValue) {
					rhit.GetGameInfo(val).then(retData => {
						const newCard = this._createCard(retData);

						newList.appendChild(newCard);
					});
				}
			});

		// remove old quoteListContainer
		const oldList = document.querySelector("#itemRow-like");
		oldList.removeAttribute("id");
		oldList.hidden = true;

		// put in new quoteListContainer
		oldList.parentElement.appendChild(newList);
	}

	getDislikedList() {
		const newList = htmlToElement('<div id="itemRow-dislike" class="row"> </div>');

		fetch(rhit.REDIS_URL + '/dislike?username=' + rhit.currUserUsername())
			.then(response => response.json())
			.then((data) => {
				console.log('data   ', data);
				console.log('data.resultValue   ', data.returnValue);
				for (let val of data.returnValue) {
					rhit.GetGameInfo(val).then(retData => {
						const newCard = this._createCard(retData);

						newList.appendChild(newCard);
					});
				}
			});

		// remove old quoteListContainer
		const oldList = document.querySelector("#itemRow-dislike");
		oldList.removeAttribute("id");
		oldList.hidden = true;

		// put in new quoteListContainer
		oldList.parentElement.appendChild(newList);
	}

	_createCard(item) {
		console.log('item info  ', item);
		return htmlToElement(`
		<div id="${item.id}" class="col-md-4 card-with-non-favorite">
              <div class="card mb-4 box-shadow" data-item-id="${item.id}">
			  <img class="card-img-top"
			  data-src="holder.js/100px225?theme=thumb&amp;bg=55595c&amp;fg=eceeef&amp;text=Thumbnail"
			  alt="Thumbnail [100%x225]" style="height: 225px; width: 100%; display: block"
			  src=${item.game_img_url || "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22290%22%20height%3D%22225%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20290%20225%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_17730751f77%20text%20%7B%20fill%3A%23eceeef%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A15pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_17730751f77%22%3E%3Crect%20width%3D%22290%22%20height%3D%22225%22%20fill%3D%22%2355595c%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2294.4453125%22%20y%3D%22119.1%22%3EThumbnail%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E"}
			  data-holder-rendered="true" />
                <div class="card-body">
                  <p class="card-text">${item.game_title} - ${item.percent_recommended} - ${item.num_reviewers}</p>
                </div>
              </div>
			</div>
		`);
	}
}

// From: https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
function htmlToElement(html) {
	var template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
}

rhit.GetGameInfo = async function (id) {
	const game = await fetch(rhit.MONGO_URL + '/game/' + id).then(response => response.json());

	return game.returnValue;
}

rhit.currUserUsername = function () {
	let user = JSON.parse(localStorage.getItem(rhit.CURR_USER_KEY));

	return user.username;
}

rhit.currUserPassword = function () {
	let user = JSON.parse(localStorage.getItem(rhit.CURR_USER_KEY));

	return user.password;
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

	if (document.querySelector("#mainPage")) {
		console.log("you are on the main page");
		new rhit.MainPageController();
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