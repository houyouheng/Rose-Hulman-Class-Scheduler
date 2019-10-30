/**
 * @fileoverview
 * Provides interactions for all pages in the UI.
 *
 * @author Youehng Hou and JaeJung Hyun
 */
var rh = rh || {};

rh.COLLECTION_CLASSES = "Classes";
rh.KEY_DEPARTMENT = "department";
rh.KEY_COURSE = "course";
rh.KEY_LAST_TOUCHED = "lastTouched";
rh.ROSEFIRE_REGISTRY_TOKEN = "6c0ca7cf-3d91-4559-aecc-ffa8fb5aee76";

rh.mainpageManager = null;
rh.schdulerAuthManager = null;

rh.className = class {
	constructor(id, department, course) {
		this.id = id;
		this.department = department;
		this.course = course;
	}
}

rh.MainpageManager = class {
	constructor() {
		this._ref = firebase.firestore().collection(rh.COLLECTION_CLASSES);
		this._documentSnapshots = [];
		this._unsubscribe = null;
	}

	beginListening(changeListener) {
		console.log("Listening for Adding Classes");

		this._unsubscribe = this._ref.orderBy(rh.KEY_LAST_TOUCHED, "desc").limit(50).onSnapshot((querySnapshot) => {
			querySnapshot.forEach((doc) => {
				this._documentSnapshots = querySnapshot.docs;

				if (changeListener) {
					changeListener();
				}
			});
		})
	}

	add(department, course) {
		this._ref.add({
			[rh.KEY_DEPARTMENT]: department,
			[rh.KEY_COURSE]: course,
			[rh.KEY_LAST_TOUCHED]: firebase.firestore.Timestamp.now()
		}).then((docRef) => {
			console.log("Doc added with id", docRef.id);
		}).catch((error) => {
			console.log("Error!!!!!!!!", err);
		});

	}

	delete() {

	}

	get length() {
		return this._documentSnapshots.length;
	}

	getCourseAtIndex(index) {
		return new rh.className(
			this._documentSnapshots[index].id,
			this._documentSnapshots[index].get(rh.KEY_DEPARTMENT),
			this._documentSnapshots[index].get(rh.KEY_COURSE)
		);
	}

}

rh.MainPageController = class {
	constructor() {
		rh.mainpageManager.beginListening(this.updateView.bind(this));

		$("#addClassDialog").on("show.bs.modal", function (e) {
			$("#inputDepartment").val("");
			$("#inputCourse").val("");
		});

		$("#addClassDialog").on("shown.bs.modal", function (e) {
			$("#inputDepartment").trigger("focus");
		});

		$("#submitAddClass").click((event) => {
			const department = $("#inputDepartment").val();
			const course = $("#inputCourse").val();
			rh.mainpageManager.add(department, course);
			$("#inputDepartment").val("");
			$("#inputCourse").val("");
		});
	}
	updateView() {
		$("#quoteList").removeAttr("id").hide();

		let $newList = $("<ul></ul>").attr("id", "quoteList").addClass("list-group");
		for (let k = 0; k < rh.fbMovieQuotesManager.length; k++) {
			const $newCard = this.createQuoteCard(
				rh.fbMovieQuotesManager.getMovieQuoteAtIndex(k)
			);
			$newList.append($newCard);
		}
		$("#quoteListContainer").append($newList);
	}

	createQuoteCard(movieQuote) {
		const $newCard = $(
			`<li id="${movieQuote.id}" class="quote-card list-group-item" aria-disabled="true">
				<div class="quote-card-quote">${movieQuote.quote}</div>
				<div class="quote-card-movie text-right blockquote-footer">${movieQuote.movie}</div>
			</li>`);

		$newCard.click((event) => {
			console.log("you have clicked", movieQuote);
			window.location.href = `/moviequote.html?id=${movieQuote.id}`;
		});
		return $newCard;
	}
}

rh.SchdulerAuthManager = class {
	constructor() {
		this._user = null;
	}
	get uid() {
		return this._user.uid;
	}

	get isSignIn() {
		return !!this._user;
	}

	beginListening(changeListener) {
		console.log("Listening");
		firebase.auth().onAuthStateChanged((user) => {
			this._user = user;
			changeListener();
		});
	}

	signIn() {
		console.log("Signing in");
		Rosefire.signIn(rh.ROSEFIRE_REGISTRY_TOKEN, (err, rfUser) => {
			if (err) {
				console.log("Rosefire error.", err);
				return;
			}
			console.log("Rosefire login worked!", rfUser);
			firebase.auth().signInWithCustomToken(rfUser.token).then(function (authData) {
				window.location.href = "/mainPage.html";

			}, function (error) {
				// User not logged in!
				console.log("Failed");
			});
		});

	}

	signOut() {

	}
}

rh.LoginPageController = class {
	constructor() {
		$("#loginButton").click((event) => {
			rh.schdulerAuthManager.signIn();
		})
	}
}

$(document).ready(() => {
	console.log("Ready");
	rh.schdulerAuthManager = new rh.SchdulerAuthManager();
	if ($("#login-page").length) {
		console.log("On the login page");
		new rh.LoginPageController();

	} else if ($("#main-page").length) {
		console.log("On the main page");
		rh.mainpageManager = new rh.MainpageManager();
		new rh.MainPageController();
	}
});