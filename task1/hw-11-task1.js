let userList

function getUserList () {
	return fetch("https://api.github.com/users?since=250")
    	.then( responce => responce.json() )
}
function getUserRepos (user) {
	return fetch( user.repos_url )
		.then (response => response.json())
}
function getReposName (repos){
	var name = ""
	repos.forEach( reposName => name += reposName.name + "; ")
	return name
}
function insertAvatar (src){
	var img = document.body.appendChild(
		document.createElement("img")
	)
	img.src = src
	img.width = "100"
}
function insertText (text) {
	var p = document.body.appendChild(
		document.createElement("p")
	)
	p.innerHTML = text
}

async function getUsersData (  ) {
	var userList = await getUserList().then (response => response )
	for (var user of userList){
		insertText("Login: " + user.login)
		insertAvatar(user.avatar_url)
		var __repos = getReposName( 
			await getUserRepos(user).then( response => response)
		)
		insertText("Repos name: " + __repos)
	}
}
getUsersData()

