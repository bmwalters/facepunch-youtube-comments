let showYouTube = function() {
	document.querySelector("#facepunchContainer").style.display = "none"
	document.querySelector("ytd-comments").style.display = "block"
}

let showFacepunch = function() {
	document.querySelector("#facepunchContainer").style.display = "block"
	document.querySelector("ytd-comments").style.display = "none"
}

let createFacepunchSection = function() {
	let facepunchSection = document.createElement("div")
	facepunchSection.id = "facepunchContainer"
	document.querySelector("#main").insertBefore(facepunchSection, document.querySelector("#meta").nextSibling)
}

let populateFacepunchInfo = function(info) {

}

let populateFacepunchComments = function(response) {
	let facepunchSection = document.querySelector("#facepunchContainer")

	for (let comment of response.Posts) {
		let commentElement = document.createElement("div")
		commentElement.classList.add("facepunchComment")

		let imageContainer = document.createElement("div")
		imageContainer.classList.add("facepunchProfileImageContainer")
		commentElement.appendChild(imageContainer)

		let profileImage = document.createElement("img")
		profileImage.classList.add("facepunchProfileImage")

		if (comment.Icon) {
			profileImage.src = `https://cdn.facepunch.com/images/get/${comment.Icon.toString(36)}`
		}

		imageContainer.appendChild(profileImage)

		let container = document.createElement("div")
		container.classList.add("facepunchContentContainer")
		commentElement.appendChild(container)

		let nameAndDate = document.createElement("div")
		nameAndDate.classList.add("facepunchNameAndDateContainer")
		container.appendChild(nameAndDate)

		let name = document.createElement("p")
		name.classList.add("facepunchUsername")
		name.innerText = comment.Username
		nameAndDate.appendChild(name)

		let date = document.createElement("p")
		date.classList.add("facepunchDate")
		date.innerText = comment.Created
		nameAndDate.appendChild(date)

		let text = document.createElement("p")
		text.classList.add("facepunchText")
		text.innerText = comment.Text
		container.appendChild(text)

		facepunchSection.appendChild(commentElement)
	}
}

let createTabs = function() {
	let tabsNode = document.createElement("paper-tabs")
	tabsNode.id = "commentTabs"
	tabsNode.setAttribute("selected", "0")

	let youtubeTab = document.createElement("paper-tab")
	youtubeTab.innerText = "YouTube"
	tabsNode.appendChild(youtubeTab)

	let facepunchTab = document.createElement("paper-tab")
	facepunchTab.innerText = "Facepunch"
	tabsNode.appendChild(facepunchTab)

	tabsNode.addEventListener("iron-select", (e) => {
		if (youtubeTab.classList.contains("iron-selected")) {
			showYouTube()
		} else {
			showFacepunch()
		}
	})

	document.querySelector("#main").insertBefore(tabsNode, document.querySelector("#meta").nextSibling)
}

let fetchFacepunchData = function() {
	let videoID = (new URLSearchParams((new URL(window.location)).search)).get("v")
	fetch(`https://lab.facepunch.com/api/search/results/?text=${videoID}&offset=0&rows=10`)
		.then((response) => response.json())
		.then((data) => {
			let threadID

			for (let result of data.Results) {
				if (result.PostNumber == 1) {
					threadID = result.Thread.ThreadId
					break
				}
			}

			if (threadID) {
				return Promise.all([
					fetch(`https://lab.facepunch.com/api/thread/info/${threadID.toString(36)}`),
					fetch(`https://lab.facepunch.com/api/post/get/${threadID.toString(36)}/30/0`)
				])
			}
		})
		.then(([info, posts]) => Promise.all([info.json(), posts.json()]))
		.then(([info, posts]) => {
			populateFacepunchInfo(info)
			populateFacepunchComments(posts)
		})
}

let main = function() {
	createFacepunchSection()
	createTabs()
	fetchFacepunchData()
}

if (document.querySelector("ytd-comments")) {
	main()
} else {
	let interval

	interval = setInterval(() => {
		if (document.querySelector("ytd-comments")) {
			clearInterval(interval)

			main()
		}
	}, 200)
}
