/**
 * @fileoverview
 * Provides interactions for all pages in the UI.
 *
 * @author Youehng Hou and JaeJung Hyun
 */
var rh = rh || {};

rh.ROSEFIRE_REGISTRY_TOKEN = "6c0ca7cf-3d91-4559-aecc-ffa8fb5aee76";

rh.schdulerAuthManager = null;

rh.FbMovieQuotesManager = class {
	constructor() {
		this._ref = firebase.firestore().collection(rh.COLLECTION_MOVIEQUOTES);
		this._documentSnapshots = [];
		this._unsubscribe = null;
	}
	beginListening(changeListener) {
		console.log("Listening for Movie quotes");

		this._unsubscribe = this._ref.orderBy(rh.KEY_LAST_TOUCHED, "desc").limit(50).onSnapshot((querySnapshot) => {
			querySnapshot.forEach((doc) => {
				this._documentSnapshots = querySnapshot.docs;
				// console.log("Updated " + this._documentSnapshots.length + " movie quotes");

				if (changeListener) {
					changeListener();
				}
			});
		})
	}
	stopListening() {

	}
	add(quotes, movie) {
		this._ref.add({
			[rh.KEY_QUOTE]: quotes,
			[rh.KEY_MOVIE]: movie,
			[rh.KEY_LAST_TOUCHED]: firebase.firestore.Timestamp.now()
		}).then((docRef) => {
			console.log("Doc added with id", docRef.id);
		}).catch((error) => {
			console.log("Error!!!!!!!!", err);
		});

	}
	delete(id) {

	}
	get length() {
		return this._documentSnapshots.length;
	}
	// getQuoteAtIndex(index) {
	// 	return this._documentSnapshots[index].id;
	// }
	// getIdAtIndex(index) {
	// 	return this._documentSnapshots[index].get(rh.KEY_QUOTE);
	// }
	// getMovieAtIndex(index) {
	// 	return this._documentSnapshots[index].get(rh.KEY_MOVIE);
	// }

	getMovieQuoteAtIndex(index) {
		return new rh.movieQuote(
			this._documentSnapshots[index].id,
			this._documentSnapshots[index].get(rh.KEY_QUOTE),
			this._documentSnapshots[index].get(rh.KEY_MOVIE)
		);
	}

}

rh.ListPageController = class {
	constructor() {
		rh.fbMovieQuotesManager.beginListening(this.updateView.bind(this));

		$("#addQuotesdialog").on("show.bs.modal", function (e) {
			$("#inputQuote").val("");
			$("#inputMovie").val("");
		});

		$("#addQuotesdialog").on("shown.bs.modal", function (e) {
			$("#inputQuote").trigger("focus");
		});

		$("#submitAddQuote").click((event) => {
			const quote = $("#inputQuote").val();
			const movie = $("#inputMovie").val();
			rh.fbMovieQuotesManager.add(quote, movie);
			$("#inputQuote").val("");
			$("#inputMovie").val("");
		});
	}
	updateView() {
		// console.log("The model object has changed. I need to use it!", this);
		$("#quoteList").removeAttr("id").hide();

		let $newList = $("<ul></ul>").attr("id", "quoteList").addClass("list-group");
		for (let k = 0; k < rh.fbMovieQuotesManager.length; k++) {
			const $newCard = this.createQuoteCard(
				// rh.fbMovieQuotesManager.getIdAtIndex(k),
				// rh.fbMovieQuotesManager.getMovieAtIndex(k),
				// rh.fbMovieQuotesManager.getQuoteAtIndex(k)
				rh.fbMovieQuotesManager.getMovieQuoteAtIndex(k)
			);
			$newList.append($newCard);
		}
		$("#quoteListContainer").append($newList);
	}

	createQuoteCard(movieQuote) {
		// const $newCard = $("#quoteCardTemplate").clone().attr("id", movieQuote.id).removeClass("invisible");
		// $newCard.find(".quote-card-quote").text(movieQuote.quote);
		// $newCard.find(".quote-card-movie").text(movieQuote.movie);

		const $newCard = $(
			`<li id="${movieQuote.id}" class="quote-card list-group-item" aria-disabled="true">
				<div class="quote-card-quote">${movieQuote.quote}</div>
				<div class="quote-card-movie text-right blockquote-footer">${movieQuote.movie}</div>
			</li>`);

		$newCard.click((event) => {
			console.log("you have clicked", movieQuote);
			// rh.storage.setMovieQuoteId(movieQuote.id);
			//Nav away to the new page
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
	}
});