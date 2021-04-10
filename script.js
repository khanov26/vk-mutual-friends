let addInputButton = document.querySelector('.btn-add-input');
let searchButton = document.querySelector('.btn-search');
let mutualFriendsContainer = document.querySelector('.mutual-fiends');
let vk;

let clientId = '7286326';

addInputButton.addEventListener('click', event => {
	let li = document.createElement('li');
	li.classList.add('form-group', 'input-group');
	
	let input = document.createElement('input');
	input.classList.add('form-control', 'user-link');
	input.placeholder = 'https://vk.com/user_domain';
	li.append(input);

	let remove = document.createElement('button');
	remove.classList.add('btn-remove-input');
	remove.innerHTML = '&times;';
	li.append(remove);

	addInputButton.before(li);
});

document.querySelector('.inputs').addEventListener('click', event => {
	let target = event.target;
	if (target.classList.contains('btn-remove-input')) {
		target.parentElement.remove();
	}	
});

function showMutualFriends(mutualFriends) {
	for (let friend of mutualFriends) {
		let li = document.createElement("li");
		li.classList.add("form-group");

		let a = document.createElement("a");
		a.href = "https://vk.com/" + friend.domain;
		a.target = "_blank";

		let img = document.createElement("img");
		img.src = friend.photo_50;

		let span = document.createElement("span");
		span.innerHTML = friend.first_name + " " + friend.last_name;

		a.appendChild(img);
		a.appendChild(span);
		li.appendChild(a);
		mutualFriendsContainer.appendChild(li);
	}
}

function clearMutualFriendsContainer() {
	mutualFriendsContainer.innerHTML = "";
}

searchButton.addEventListener('click', async event => {
	clearMutualFriendsContainer();
	disableSearchButton();

	let linkPattern = /vk.com\/([\w\.]+)/;

	let friendsList = [];
	let inputs = document.querySelectorAll(".user-link");
	for (let input of inputs) {
		if (linkPattern.test(input.value)) {
			let userId;
			let nickname = input.value.match(linkPattern)[1];
			if (nickname.includes("id")) {
				userId = nickname.split("id")[1];
			} else {
				let response = await vk.call("users.get", {
					user_ids: nickname
				});
				if (response.error) {
					alert("Error");
					console.log(response.error_msg);
				}
				userId = response.response[0].id;
			}

			let response = await vk.call("friends.get", {
				user_id: userId,
				fields: "nickname,photo_50,domain"
			});
			let currentUserFriendsList = {};
			for (let friend of response.response.items) {
				if (friend.deactivated) continue;

				currentUserFriendsList[friend.id] = {
					first_name: friend.first_name,
					last_name: friend.last_name,
					photo_50: friend.photo_50,
					domain: friend.domain
				};
			}
			friendsList.push(currentUserFriendsList);
		}
	}
	console.log(friendsList);
	if (!friendsList.length) console.log("empty");
	let mutualFriends = [];
	outer: for (let friendId in friendsList[0]) {
		for (let i = 1; i < friendsList.length; i++) {
			if (!friendsList[i].hasOwnProperty(friendId)) {
				continue outer;
			}
		}
		mutualFriends.push(friendsList[0][friendId]);
	}

	showMutualFriends(mutualFriends);
	enableSearchButton();
});

function disableSearchButton() {
	searchButton.disabled = true;
	searchButton.lastChild.nodeValue = 'Загрузка...';
	searchButton.firstElementChild.classList.remove('d-none');
}

function enableSearchButton() {
	searchButton.disabled = false;
	searchButton.lastChild.nodeValue = 'Поиск';
	searchButton.firstElementChild.classList.add('d-none');
}

function parse(needle, subject) {
	let regex = new RegExp(`${needle}=([^&]+)`);
	let result = subject.match(regex);
	return result[1] || null;
}

function init() {
	let token = localStorage.getItem("token");
	let expires = localStorage.getItem("expires");

	if (!token || expires < Date.now()) {
		if (location.href.includes("access_token")) {
			token = parse("access_token", location.href);
			expires = +parse("expires_in", location.href) * 1000 + Date.now();
			localStorage.setItem("token", token);
			localStorage.setItem("expires", expires);
			vk = new VK({token: token});
		} else {
			vk = new VK({appId: "7286326"});
		}
	} else {
		vk = new VK({token: token});
	}

}

window.addEventListener("load", init);