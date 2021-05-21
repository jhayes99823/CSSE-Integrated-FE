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
rhit.ORIENT_URL = rhit.BASE_URL + '/orient';

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
						localStorage.setItem(rhit.CURR_USER_KEY, data.returnValue.username);
					} else {
						console.log('error happened ', data.returnValue);
						$("#alert-section").html(`
							<div class="alert alert-warning alert-dismissible fade show" role="alert">
								<p>${data.returnValue}</p>
								<button type="button" class="close" data-dismiss="alert" aria-label="Close">
									<span aria-hidden="true">&times;</span>
								</button>
							</div>
						`)
					}
				}).then(() => {
					rhit.checkForRedirects();
				})
		}

		document.querySelector("#create-account-btn").onclick = (event) => {
			const username = document.querySelector("#username-field");
			const password = document.querySelector("#password-field");
			const data = { "username": username.value, "password": password.value };

			fetch(rhit.REDIS_URL + '/user', {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data)
			})
				.then(response => response.json())
				.then((data) => {
					console.log('data  ', data);
					console.log('data.resultValue  ', data.returnValue);
					if (data.returnValue == true) {
						// TODO add success banner
						console.log('account created successfully');
						$("#alert-section").html(`
							<div class="alert alert-success alert-dismissible fade show" role="alert">
								<p>Account Created Successfully</p>
								<button type="button" class="close" data-dismiss="alert" aria-label="Close">
									<span aria-hidden="true">&times;</span>
								</button>
							</div>
						`)
					} else {
						console.log('error happened ', data.returnValue);
						$("#alert-section").html(`
							<div class="alert alert-warning alert-dismissible fade show" role="alert">
								<p>${data.returnValue}</p>
								<button type="button" class="close" data-dismiss="alert" aria-label="Close">
									<span aria-hidden="true">&times;</span>
								</button>
							</div>
						`)
					}
				})
		}
	}
}

rhit.MainPageController = class {
	constructor() {
		console.log('im the main page controller');

		this.getAllGames();
		this.getLikedList()
		this.getDislikedList();
		this.getReviewedList();
		this.getRecommendedList();

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
							value: item.game_id,
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
								value: retData.game_id,
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
							value: item.game_id,
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
								value: retData.game_id,
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



		$("#addReviewModal").on("show.bs.modal", (event) => {
			console.log('made it here   review');
			// pre animation
			fetch(rhit.MONGO_URL + '/game')
				.then(response => response.json())
				.then((data) => {
					$.each(data.returnValue, function (i, item) {
						$('#gameOptListReviewed').append($('<option>', {
							value: item.game_id,
							text: item.game_title
						}));
					});
				});
		});

		$("#addReviewModal").on("hide.bs.modal", (event) => {
			$('#gameOptListReviewed').empty()
		});

		$("#deleteReviewModal").on("show.bs.modal", (event) => {
			// pre animation
			fetch(rhit.MONGO_URL + '/reviews?username=' + rhit.currUserUsername())
				.then(response => response.json())
				.then((data) => {
					for (let val of data.returnValue) {
						rhit.GetReviewInfo(val).then(retData => {
							$('#reviewedOptList').append($('<option>', {
								value: retData.game_id,
								text: retData.game_title
							}));
						});
					}
				});
		});

		$("#deleteReviewModal").on("hide.bs.modal", (event) => {
			$('#reviewedOptList').empty()
		});

		document.querySelector("#deleteReviewedGame").addEventListener("click", (event) => {
			let game = document.querySelector("#reviewedOptList").value;
			let username = rhit.currUserUsername();
			let data = { username, gameID: game };

			fetch(rhit.ORIENT_URL + '/reviews', {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data)
			}).then((orientRes) => {
				fetch(rhit.MONGO_URL + '/reviews', {
					method: "DELETE",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(data)
				}).then(response => response.json())
					.then((data) => {
						if (data) location.reload();
					});
			});
		});

		document.querySelector("#submitReviewedGame").addEventListener("click", (event) => {
			let game = document.querySelector("#gameOptListReviewed").value;
			// let recommended = document.querySelector("#gameReviewedRecommend").value;
			let recommended = $("#gameReviewedRecommend").is(":checked") ? "true" : "false";

			console.log('rec from front end   ', recommended);
			let reviewText = document.querySelector("#gameReviewedText").value;
			console.log('review text  ', reviewText);
			const username = rhit.currUserUsername();
			const data = { username, gameID: game, recommended, review_text: reviewText };

			console.log('data being sent to create review   ', data);

			fetch(rhit.ORIENT_URL + '/reviews', {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data)
			}).then((orientRes) => {
				fetch(rhit.MONGO_URL + '/reviews', {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(data)
				}).then(response => response.json())
					.then((data) => {
						if (data) location.reload();
					});
			});
		});



		document.querySelector('#submitUpdateUsername').addEventListener('click', (event) => {
			let currUsername = document.querySelector("#oldUsername").value;
			let newUsername = document.querySelector("#newUsername").value;

			const data = { currUsername, newUsername };

			fetch(rhit.REDIS_URL + '/user/username', {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data)
			})
				.then(response => response.json())
				.then((data) => {
					if (data.returnValue == true) {
						console.log('i think im okay')
						$("#alert-section").html(`
							<div class="alert alert-success alert-dismissible fade show" role="alert">
								<p>Username successfully updated!</p>
								<button type="button" class="close" data-dismiss="alert" aria-label="Close">
									<span aria-hidden="true">&times;</span>
								</button>
							</div>
						`)
					} else {
						console.log('error happened ', data.returnValue);
						$("#alert-section").html(`
							<div class="alert alert-warning alert-dismissible fade show" role="alert">
								<p>${data.returnValue}</p>
								<button type="button" class="close" data-dismiss="alert" aria-label="Close">
									<span aria-hidden="true">&times;</span>
								</button>
							</div>
						`)
					}
				}).then(() => {
					localStorage.setItem(rhit.CURR_USER_KEY, newUsername);
				})
		});

		$("#updateUsernameModal").on("show.bs.modal", (event) => {
			// pre animation
			document.querySelector("#oldUsername").value = "";
			document.querySelector("#newUsername").value = "";
		});

		document.querySelector('#submitUpdatePassword').addEventListener('click', (event) => {
			let oldpassword = document.querySelector("#oldPassword").value;
			let newpassword = document.querySelector("#newPassword").value;
			let username = rhit.currUserUsername();

			const data = { username, oldpassword, newpassword };

			fetch(rhit.REDIS_URL + '/user/password', {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data)
			})
				.then(response => response.json())
				.then((data) => {
					if (data.returnValue > -1) {
						console.log('i think im okay')
						$("#alert-section").html(`
							<div class="alert alert-success alert-dismissible fade show" role="alert">
								<p>Password successfully updated!</p>
								<button type="button" class="close" data-dismiss="alert" aria-label="Close">
									<span aria-hidden="true">&times;</span>
								</button>
							</div>
						`)
					} else {
						console.log('error happened ', data.returnValue);
						$("#alert-section").html(`
							<div class="alert alert-warning alert-dismissible fade show" role="alert">
								<p>${data.returnValue}</p>
								<button type="button" class="close" data-dismiss="alert" aria-label="Close">
									<span aria-hidden="true">&times;</span>
								</button>
							</div>
						`)
					}
				});
		});

		$("#updatePasswordModal").on("show.bs.modal", (event) => {
			// pre animation
			document.querySelector("#oldPassword").value = "";
			document.querySelector("#newPassword").value = "";
		});

		document.querySelector('#delete-account-btn').addEventListener('click', (event) => {
			const username = rhit.currUserUsername();
			const data = { username };

			fetch(rhit.REDIS_URL + '/user', {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data)
			})
				.then(response => response.json())
				.then((data) => {
					if (data.returnValue == true) localStorage.removeItem(rhit.CURR_USER_KEY);
				})
				.then(() => {
					rhit.checkForRedirects();
				})
		});

		document.querySelector("#submitFilterOptions").addEventListener('click', (event) => {
			let min = document.querySelector("#minInput").value;
			let max = document.querySelector("#maxInput").value;
			let field = $("input[name='filterName']:checked").val();

			console.log('field ', field);
			fetch(rhit.MONGO_URL + '/game/filter?field=' + field + "&min=" + min + "&max=" + max)
				.then(response => response.json())
				.then((data) => {
					const newList = htmlToElement('<div id="itemRow-all" class="row"> </div>');

					for (let val of data.returnValue) {
						rhit.GetGameInfo(val.game_id).then(retData => {
							const newCard = this._createCard(retData);

							newList.appendChild(newCard);
						})
					}

					// remove old quoteListContainer
					const oldList = document.querySelector("#itemRow-all");
					oldList.removeAttribute("id");
					oldList.hidden = true;

					// put in new quoteListContainer
					oldList.parentElement.appendChild(newList);
				})
		});

		document.querySelector("#submitSortOptions").addEventListener('click', (event) => {
			let field = $("input[name='sortName']:checked").val();
			let order = $("input[name='orderName']:checked").val();

			console.log('field ', field);
			fetch(rhit.MONGO_URL + '/game/sort?field=' + field + "&order=" + order)
				.then(response => response.json())
				.then((data) => {
					const newList = htmlToElement('<div id="itemRow-all" class="row"> </div>');

					for (let val of data.returnValue) {
						rhit.GetGameInfo(val.game_id).then(retData => {
							const newCard = this._createCard(retData);

							newList.appendChild(newCard);
						})
					}

					// remove old quoteListContainer
					const oldList = document.querySelector("#itemRow-all");
					oldList.removeAttribute("id");
					oldList.hidden = true;

					// put in new quoteListContainer
					oldList.parentElement.appendChild(newList);
				})
		});

		document.querySelector("#submitTitleSearch").addEventListener('click', (event) => {
			let title = document.querySelector("#titleField").value;

			fetch(rhit.MONGO_URL + '/game?title=' + title)
				.then(response => response.json())
				.then((data) => {
					const newList = htmlToElement('<div id="itemRow-all" class="row"> </div>');

					for (let val of data.returnValue) {
						rhit.GetGameInfo(val.game_id).then(retData => {
							const newCard = this._createCard(retData);

							newList.appendChild(newCard);
						})
					}

					// remove old quoteListContainer
					const oldList = document.querySelector("#itemRow-all");
					oldList.removeAttribute("id");
					oldList.hidden = true;

					// put in new quoteListContainer
					oldList.parentElement.appendChild(newList);
				})
		});

		document.querySelector("#clear-btn").addEventListener('click', (event) => {
			this.getAllGames();
		});
	}

	getAllGames() {
		const newList = htmlToElement('<div id="itemRow-all" class="row"> </div>');

		fetch(rhit.MONGO_URL + '/game')
			.then(response => response.json())
			.then((data) => {
				console.log('data   ', data);
				console.log('data.resultValue   ', data.returnValue);
				for (let val of data.returnValue) {
					console.log('ALL GAMES:   ', val.game_id);
					rhit.GetGameInfo(val.game_id).then(retData => {
						const newCard = this._createCard(retData);

						newList.appendChild(newCard);
					});
				}
			});

		// remove old quoteListContainer
		const oldList = document.querySelector("#itemRow-all");
		oldList.removeAttribute("id");
		oldList.hidden = true;

		// put in new quoteListContainer
		oldList.parentElement.appendChild(newList);
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
					console.log('disliked games   val  ', data.returnValue);
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

	getReviewedList() {
		const newList = htmlToElement('<div id="itemRow-review" class="row"> </div>');

		fetch(rhit.MONGO_URL + '/reviews?username=' + rhit.currUserUsername())
			.then(response => response.json())
			.then((data) => {
				console.log('data   ', data);
				console.log('data.resultValue   ', data.returnValue);
				for (let val of data.returnValue) {
					console.log('getting review list data   ', val);
					rhit.GetReviewInfo(val).then(retData => {
						const newCard = this._createReviewCard(retData);

						newList.appendChild(newCard);
					});
				}
			});

		// remove old quoteListContainer
		const oldList = document.querySelector("#itemRow-review");
		oldList.removeAttribute("id");
		oldList.hidden = true;

		// put in new quoteListContainer
		oldList.parentElement.appendChild(newList);
	}

	getRecommendedList() {
		const newList = htmlToElement('<div id="itemRow-recommended" class="row"> </div>');

		fetch(rhit.ORIENT_URL + '/recommend?userId=' + rhit.currUserUsername())
			.then(response => response.json())
			.then((data) => {
				console.log('data   ', data);
				console.log('data.resultValue   ', data.returnValue);
				for (let val of data.returnValue) {
					console.log('getting recommended list data   ', val);
					rhit.GetGameInfo(val).then(retData => {
						console.log('recc data   creating card with info   ', retData);
						const newCard = this._createCard(retData);

						newList.appendChild(newCard);
					});
				}
			});

		// remove old quoteListContainer
		const oldList = document.querySelector("#itemRow-recommended");
		oldList.removeAttribute("id");
		oldList.hidden = true;

		// put in new quoteListContainer
		oldList.parentElement.appendChild(newList);
	}

	_createCard(item) {
		console.log('item info  ', item);
		return htmlToElement(`
		<div id="${item.game_id}" class="col-md-4 card-with-non-favorite">
              <div class="card mb-4 box-shadow" data-item-id="${item.game_id}">
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

	_createReviewCard(item) {
		console.log('creating review card   ', item);
		if (item.recommended) {
			return htmlToElement(`
				<div id="${item.id}" class="col-md-4 card-with-non-favorite">
				<div class="card mb-4 box-shadow" data-item-id="${item.game_id}">
					<div class="card-title">${item.game_title}</div>
					<div class="card-text">
						<p>Recommended</p>
						<p>${item.review_text}</p>
					</div>
					</div>
				</div>
			`);
		} else {
			return htmlToElement(`
			<div id="${item.id}" class="col-md-4 card-with-non-favorite">
				<div class="card mb-4 box-shadow" data-item-id="${item.game_id}">
				<div class="card-title">${item.game_title}</div>
				<div class="card-text">
					<p>Not Recommended</p>
					<p>${item.review_text}</p>
				</div>
				</div>
			</div>
		`);
		}
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

rhit.GetReviewInfo = async function (id) {
	console.log('getting review info id   ', id);
	const review = await fetch(rhit.MONGO_URL + '/review/' + id.review_id).then(response => response.json());

	console.log(`review.returnValue.game_id`, review.returnValue);
	const gameTitle = rhit.GetTitleInfo(review.returnValue.game_title)

	return review.returnValue;
}

rhit.GetTitleInfo = async function (gameId) {
	const gameTitle = await fetch(rhit.MONGO_URL + '/game/title/' + gameId).then(response => response.json());

	console.log('gameTitle   ', gameTitle);
}

rhit.currUserUsername = function () {
	return localStorage.getItem(rhit.CURR_USER_KEY);
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