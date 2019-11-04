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
rh.KEY_UID = "uid"
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
	constructor(url_uid) {
		this._ref = firebase.firestore().collection(rh.COLLECTION_CLASSES);
		this._documentSnapshots = [];
		this._unsubscribe = null;
		this._uid = url_uid;
	}

	beginListening(changeListener) {
		console.log("Listening for Adding Classes");
		let query = this._ref.orderBy(rh.KEY_LAST_TOUCHED, "desc").limit(50);
		if (this._uid) {
			query = query.where(rh.KEY_UID, "==", this._uid);
		}

		this._unsubscribe = query.onSnapshot((querySnapshot) => {
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
			[rh.KEY_LAST_TOUCHED]: firebase.firestore.Timestamp.now(),
			[rh.KEY_UID]: rh.schdulerAuthManager.uid
		}).then((docRef) => {
			console.log("Doc added with id", docRef.id);
		}).catch((error) => {
			console.log("Error!!!!!!!!", err);
		});

	}

	delete(id) {
		return this._ref.doc(id).delete().then(function () {
			console.log("Document successfully deleted!");
		}).catch(function (error) {
			console.error("Error removing document: ", error);
		});
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

		$("#menuLogOut").click((event) => {
			rh.schdulerAuthManager.signOut();
		});

		$("#menuFlowChart").click((event) => {
			window.open("https://www.rose-hulman.edu/academics/academic-departments/computer-science-software-engineering/_assets/pdfs/CS-Sample-Program.pdf");
		});

		$("#generateButton").click((event) => {
			$("#classRecommandContainer").append(this.createRecommandClassCard("230", "CSSE"));
		});
		$("#230Card").click((event) => {
			console.log("delte!!!");
			$("#230Card").hide();
		});
	}
	updateView() {
		$("#classList").removeAttr("id").hide();
		let $newList = $("<div></div>").attr("id", "classList");
		for (let k = 0; k < rh.mainpageManager.length; k++) {
			const $newCard = this.createClassCard(
				rh.mainpageManager.getCourseAtIndex(k)
			);
			$newList.append($newCard);
		}
		$("#classContainer").prepend($newList);
		console.log("Test");
	}

	createClassCard(classes) {
		const $newCard = $(
			`<div>
                <p><img id="fab" class="fabIcon" src="images/baseline_remove_circle_black_48dp.png" alt="button" />${classes.department} ${classes.course}</p>
            </div>`);

		$newCard.click((event) => {
			console.log("you have clicked", classes);
			rh.mainpageManager.delete(classes.id);
			if (rh.mainpageManager.length == 1) $("#classList").hide();
		});
		return $newCard;
	}

	createRecommandClassCard(course, department) {
		const $newCard = $(
			`<li  class="quote-card list-group-item" aria-disabled="true">
				<div  id="230Card" class="quote-card-quote" onmouseover="" style="cursor: pointer;">${department} ${course}</div>
				<div class="quote-card-movie blockquote-footer">DATA STRUCTURES AND ALGORITHM ANALYSIS</div>
			</li>`);
			$newCard.click((event) => {
				console.log("You have clicked", course);
				//rh.storage.setMovieQuoteId(movieQuote.id);
	
				window.open("https://www.rose-hulman.edu/academics/course-catalog/current/programs/Computer%20Science/csse-230.html");
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


			}, function (error) {
				// User not logged in!
				console.log("Failed");
			});
		});

	}

	signOut() {
		firebase.auth().signOut();
	}
}

rh.LoginPageController = class {
	constructor() {
		$("#loginButton").click((event) => {
			rh.schdulerAuthManager.signIn();
		})
	}
}

rh.Initialization = function () {
	var urlParams = new URLSearchParams(window.location.search);
	if ($("#login-page").length) {
		console.log("On the login page");
		new rh.LoginPageController();

	} else if ($("#main-page").length) {
		console.log("On the main page");
		const url_uid = urlParams.get('uid');
		console.log('url_uid :', url_uid);

		rh.mainpageManager = new rh.MainpageManager(url_uid);
		new rh.MainPageController();
	}
};

rh.CheckForRedirects = function () {
	if ($("#login-page").length && rh.schdulerAuthManager.isSignIn) {
		// window.location.href = "/mainPage.html";
		window.location.href = `/mainPage.html?uid=${rh.schdulerAuthManager.uid}`;
	}
	if (!$("#login-page").length && !rh.schdulerAuthManager.isSignIn) {
		window.location.href = "/";
	}
}


$(document).ready(() => {
	console.log("Ready");
	rh.schdulerAuthManager = new rh.SchdulerAuthManager();
	rh.schdulerAuthManager.beginListening(() => {
		rh.CheckForRedirects();
		rh.Initialization();
	});
});