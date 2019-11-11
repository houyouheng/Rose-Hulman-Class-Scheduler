/**
 * @fileoverview
 * Provides interactions for all pages in the UI.
 *
 * @author Youehng Hou and JaeJung Hyun
 */
var rh = rh || {};

rh.COLLECTION_CLASSES = "Classes";
rh.COLLECTION_CSSE = "CSSE";

rh.KEY_DEPARTMENT = "department";
rh.KEY_COURSE = "course";
rh.KEY_LAST_TOUCHED = "lastTouched";
rh.KEY_UID = "uid"

rh.KEY_NAME = "Name";
rh.KEY_DESCRIPTION = "Description";
rh.KEY_URL = "Url";
rh.KEY_PREREQUISITE = "Prerequisite";

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

rh.recommandClassName = class {
	constructor(id, name, description, url, prerequsite) {
		this.id = id;
		this.name = name;
		this.description = description;
		this.url = url;
		this.prerequsite = prerequsite;
	}
}

rh.MainpageManager = class {
	constructor(url_uid) {
		this._ref = firebase.firestore().collection(rh.COLLECTION_CLASSES);
		this._refCSSE = firebase.firestore().collection(rh.COLLECTION_CSSE);

		this._documentSnapshots = [];
		this._documentSnapshotsCSSE = [];
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
		//--------------------------------------------------------------------------------

		let query1 = this._refCSSE;

		this._unsubscribe = query1.onSnapshot((querySnapshot) => {
			querySnapshot.forEach((doc) => {
				this._documentSnapshotsCSSE = querySnapshot.docs;

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

	get recommandedLength() {
		return this._documentSnapshotsCSSE.length;
	}

	getCourseAtIndex(index) {
		return new rh.className(
			this._documentSnapshots[index].id,
			this._documentSnapshots[index].get(rh.KEY_DEPARTMENT),
			this._documentSnapshots[index].get(rh.KEY_COURSE)
		);
	}

	getRecommandCourseAtIndex(index) {
		//console.log(this._documentSnapshotsCSSE);
		return new rh.recommandClassName(
			this._documentSnapshotsCSSE[index].id,
			this._documentSnapshotsCSSE[index].get(rh.KEY_NAME),
			this._documentSnapshotsCSSE[index].get(rh.KEY_DESCRIPTION),
			this._documentSnapshotsCSSE[index].get(rh.KEY_URL),
			this._documentSnapshotsCSSE[index].get(rh.KEY_PREREQUISITE)
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
			this.generateListofClasses();
			// $("#classRecommandContainer").append(this.createRecommandClassCard("230", "CSSE"));
		});
		$("#230Card").click((event) => {
			console.log("delte!!!");
			$("#230Card").hide();
		});
		$("#inputDepartment").change((event) => {
			console.log('$("#inputDepartment").val() :', $("#inputDepartment").val());
			$("#inputCourse").remove();
			if ($("#inputDepartment").val() == "CSSE") {
				const $newDropdown = $(`
				<select id="inputCourse" class="custom-select">
					<option selected>Course</option>
					<option value="120">120</option>
					<option value="132">132</option>
					<option value="212">212</option>
					<option value="220">220</option>
					<option value="221">221</option>
					<option value="230">230</option>
					<option value="232">232</option>
					<option value="333">333</option>
					<option value="374">374</option>
					<option value="304">304</option>
					<option value="132">132</option>
					<option value="232">232</option>
					<option value="332">332</option>
					<option value="374">374</option>
					<option value="413">413</option>
					<option value="473">473</option>
					<option value="474">474</option>
				</select>`);
				$("#inputCourseDropdown").append($newDropdown);
			} else if ($("#inputDepartment").val() == "MA") {
				const $newDropdown = $(`
				<select id="inputCourse" class="custom-select">
					<option selected>Course</option>
					<option value="112">112</option>
					<option value="212">212</option>
					<option value="275">275</option>
					<option value="375">375</option>
				</select>`);
				$("#inputCourseDropdown").append($newDropdown);
			}else if ($("#inputDepartment").val() == "ME") {
				const $newDropdown = $(`
				<select id="inputCourse" class="custom-select">
					<option selected>Course</option>
					<option value="430">430</option>
				</select>`);
				$("#inputCourseDropdown").append($newDropdown);
			} else if ($("#inputDepartment").val() == "RH") {
				const $newDropdown = $(`
				<select id="inputCourse" class="custom-select">
					<option selected>Course</option>
					<option value="330">330</option>
				</select>`);
				$("#inputCourseDropdown").append($newDropdown);
			}
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
		if (rh.mainpageManager.length >= 1) {
			$("#classContainer").prepend($newList);
			//console.log("Prepend Test");
		}

		// console.log("Test");
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

	createRecommandClassCard(name, description, url) {
		const $newCard = $(
			`<li  class="quote-card list-group-item" aria-disabled="true">
				<div  class="quote-card-quote" onmouseover="" style="cursor: pointer;">${name}</div>
				<div class="quote-card-movie blockquote-footer">${description}</div>
			</li>`);
		$newCard.click((event) => {
			console.log("You have clicked", name);
			window.open(`${url}`);
		});
		return $newCard;
	}

	generateListofClasses() {
		//Get classes taken
		let showList = [];
		let takenClasses = [];
		for (let k = 0; k < rh.mainpageManager.length; k++) {
			takenClasses.push(rh.mainpageManager.getCourseAtIndex(k).department + rh.mainpageManager.getCourseAtIndex(k).course);
		}

		//Pull single recommand class from firebase
		for (let k = 0; k < rh.mainpageManager.recommandedLength; k++) {
			let recommandClass = rh.mainpageManager.getRecommandCourseAtIndex(k);

			//Pull Prereq classes
			let prerequsiteClasses = recommandClass.prerequsite;

			//Compare the Prereq classes and classes taken
			//if no pre 
			if (prerequsiteClasses[0] == "") {
				//add it to the list of shows
				showList.push(recommandClass);
				// console.log("Added: ", recommandClass);
			} else {
				//if more than 1 compare it
				let flag;
				for (let i = 0; i < prerequsiteClasses.length; i++) {
					flag = false;
					// console.log('prerequsiteClasses :' + i, prerequsiteClasses[i]);
					if (!takenClasses.includes(prerequsiteClasses[i])) {
						//Go to the next iteration
						flag = true;
						break;
					}
				}
				//add to the list
				if (!flag) {
					showList.push(recommandClass);
					console.log("Added: ", recommandClass);
				}
			}
		}

		//Create card for each classes and append card onto html
		$("#recommandClassList").removeAttr("id").hide();
		let $newList = $("<ul></ul>").attr("id", "recommandClassList");
		for (let j = 0; j < showList.length; j++) {
			const name = showList[j].name;
			const description = showList[j].description;
			const url = showList[j].url;
			var $card = this.createRecommandClassCard(name, description, url);
			$newList.append($card);
		}
		$("#classRecommandContainer").prepend($newList);
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