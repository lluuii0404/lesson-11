'use strict'

document.body.children[0].remove()
document.body.style = `
    font-family: monospace, Arial;
    font-size: 14px;
`

let lastUpdate

let getData = function ( ref ) {
    return fetch ( 'http://localhost:3000/' + ref )
        .then ( response => response.json () )
}
let appElem = ( tagName, container ) => 
    ( container ? container : document.body )
        .appendChild ( document.createElement ( tagName ) )


let _name, _lastName, _email, _photoURL, okBTN, src;
let visibilityON =  ` visibility: visible; `
let visibilityOFF =  ` visibility: hidden; `
let wrapper = appElem("div")
wrapper.style = `
    max-width: 95vw;
`
//background-color: #e9e9e9;
let registrBtn = appElem("button", wrapper)
registrBtn.innerText = "Регистрация"
registrBtn.style = `
    position: relation;
    padding: 10px 40px;
    border-radius: 20px;
    overflow: auto;
    font-size: 20px;
    outline: none;
`

registrBtn.onclick = function (event) {
    wrapper.style = `
        height: 100vh;
        transition: 0.6s ease-in-out;
        background-color: #4ac3b080;
    `
    registrBtn.style = visibilityOFF

    createRegistForm ()
        
}

function createRegistForm () {
     let inpStl = `
        display: block;
        position: relative;
        margin: 5px 0;
        padding: 5px;
        top: 20vh;
        left: 10vw;
        font-size: 20px; 
        overflow: auto;
        outline: none;
        width: 70%;
        mim-width: 200px;
        
    `
    _name = appElem("input", wrapper)
    _name.placeholder = " Enter your Name"
    _name.id = "name"
    _name.style = inpStl

    _lastName = appElem("input", wrapper)
    _lastName.placeholder = " Enter your Lastname"
    _lastName.id = "lastname"
    _lastName.style = inpStl

    _email = appElem("input", wrapper)
    _email.placeholder = " Enter your E-mail"
    _email.id = "e-mail"
    _email.style = inpStl

    _photoURL = appElem("input", wrapper)
    _photoURL.type = "file"
    _photoURL.id = "photoURL"
    _photoURL.style = inpStl
    

    okBTN = appElem("button", wrapper)
    okBTN.innerText = "OK"
    okBTN.id = "okBTN"
    okBTN.style = inpStl + `
        border-radius: 20px;
        overflow: auto;
        outline: none;
    `
    
    _photoURL.addEventListener('change', getPhotoURL)
    okBTN.addEventListener('click', addNewUser)
}

function getPhotoURL ( event ) {
    if (event.target.files[0].type.indexOf("image/") === 0)
        return src = URL.createObjectURL( event.target.files[0] )
}

function addNewUser ( event ) {
    
    let __name = document.getElementById("name")
    let __lastName = document.getElementById("lastname")
    let __email = document.getElementById("e-mail")
    let __photoURL = src

    if (__name.value === "" || 
        __lastName.value === "" ||
        __email.value === "" ||
        __photoURL === undefined) {
            throw "You don't enter your data"
            return
    }

    fetch ( 'http://localhost:3000/users', {
        method: 'POST',
        body: JSON.stringify ({
            name: __name.value,
            lastName: __lastName.value,
            email: __email.value,
            photoURL: __photoURL
        }),
        headers: {
            "Content-type": "application/json"
        }
    })

    document.getElementById("name").value = ""
    document.getElementById("lastname").value = ""
    document.getElementById("e-mail").value = ""
    document.getElementById("photoURL").value = ""

    wrapper.style = `height: 0`
    
    document.getElementById("name").style = visibilityOFF
    document.getElementById("lastname").style = visibilityOFF
    document.getElementById("e-mail").style = visibilityOFF
    document.getElementById("photoURL").style = visibilityOFF
    document.getElementById("okBTN").style = visibilityOFF
    
    createChat()
}

let chat
let messages
let users

let currentUser

let chatInput = appElem ( 'input' )
let stlChtInpt = `
    position: fixed;
    left: 20px;
    width: 80%;
    bottom: 10px;
    border: inset 1px;
    background-color: #af9;
    overflow: auto;
    outline: none;
    visibility: hidden;
`
chatInput.style = stlChtInpt

let stlCht = `
        position: fixed;
        top: 30px;
        left: 20px;
        right: 20px;
        bottom: 70px;
        border: inset 1px;
        overflow: auto;
        padding: 10px;
        visibility: hidden;
    `
let buildChat = function () {
    chat = appElem ( 'section' )
    chat.style = stlCht
}

let initChat = async function () {
    chat.innerHTML = ""
    messages.forEach ( message => {
        let user = users.filter ( x => x.id === message.userId )[0]
        chat.appendChild (
            ( function () {
                let cont = appElem ( 'div' )
                let ava = appElem ( 'img', cont )
                ava.src = user.photoURL
                ava.width = "40"
                ava.title = ` ${user.name} ${user.lastName}`
                appElem ( 'span', cont ).innerHTML = ` <small>  ${user.name} ${user.lastName} <br> 
                                                                ${message.date} ${message.time}</small>`
                appElem ( 'p', cont ).innerText = message.body
                return cont
            }) ( user )
        )
    })
}

let updateChat = async function () {
    
    let updated = await getData ( "lastUpdate" )
    let currentUserId

    if ( lastUpdate &&
         updated.data === lastUpdate.data && 
         updated.time === lastUpdate.time )
        return

    await Promise.all ( [
        getData ( "users" ).then ( x => users = x ) , 
        getData ( "messages" ).then ( x => messages = x )
    ] )
    if ( !currentUser ) {
        currentUser = users [ users.length - 1
            //Math.floor ( M`ath.random () * users.length )
        ]
        currentUserId = currentUser.id
    }

    initChat ()

    lastUpdate = {
        data: updated.data,
        time: updated.time
    }

    chat.scrollTop = chat.scrollHeight
}


function createChat () {

    buildChat ()
    updateChat ()

    chatInput.style = stlChtInpt + visibilityON
    chat.style = stlCht + visibilityON


    setTimeout ( function () {
        chat.scrollTop = chat.scrollHeight
    }, 200 )

    let interval = setInterval ( function () {
        updateChat ()
    }, 500 )

    chatInput.onchange = function ( event ) {

        let postTime = new Date().toLocaleString ().split ( ', ' )
        fetch ( 'http://localhost:3000/lastUpdate', {
            method: 'POST',
            body: JSON.stringify ({
                data: postTime [0],
                time: postTime [1]
            }),
            headers: {
                "Content-type": "application/json"
            }
        })
        fetch ( 'http://localhost:3000/messages', {
            method: 'POST',
            body: JSON.stringify ({
                date: postTime [0],
                time: postTime [1],
                userId: currentUser.id,
                body: event.target.value
            }),
            headers: {
                "Content-type": "application/json"
            }
        })
        event.target.value = ""
    }

}
