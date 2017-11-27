/* global firebase:false */

// Heads up!
//
// This file is not compiled with babel.  It is loaded directly into the background page for the extension.

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('BACKGROUND REQUEST', request)

  switch (request.type) {
    case 'firebase:initialize': {
      try {
        firebase.app()
      } catch (err) {
        firebase.initializeApp(request.payload)
      }
      break
    }

    case 'getAuthToken:google': {
      var googleProvider = new firebase.auth.GoogleAuthProvider()

      firebase
        .auth()
        .signInWithPopup(googleProvider)
        .then(function(result) {
          console.log('BACKGROUND google RESULT', result)
          sendResponse({ payload: result.credential.accessToken })
        })
        .catch(function(error) {
          console.log('BACKGROUND google ERROR', error)
          sendResponse({ error })
        })
      break
    }

    case 'getAuthToken:facebook': {
      var facebookProvider = new firebase.auth.FacebookAuthProvider()

      firebase
        .auth()
        .signInWithPopup(facebookProvider)
        .then(function(result) {
          console.log('BACKGROUND facebook RESULT', result)
          sendResponse({ payload: result.credential.accessToken })
        })
        .catch(function(error) {
          console.log('BACKGROUND facebook ERROR', error)
          sendResponse({ error })
        })
      break
    }

    default:
      console.error('BACKGROUND unhandled request.type', '"' + request.type + '"')
      break
  }

  // signal async use of sendResponse
  return true
})

chrome.browserAction.onClicked.addListener(function() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    var tab = tabs[0]

    if (!/https?:\/\/(.*)?realtor\.com\/realestateandhomes-detail/.test(tab.url)) {
      alert("This doesn't look like a Realtor.com listing page.")
    }

    chrome.tabs.sendMessage(tab.id, { type: 'toggleExtension' })
  })
})
