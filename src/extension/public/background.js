/* global firebase:false */

// Heads up!
//
// This file is not compiled with babel.  It is loaded directly into the background page for the extension.

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('BACKGROUND REQUEST', request)

  switch (request.type) {
    case 'firebase:initialize':
      try {
        firebase.app()
      } catch (err) {
        firebase.initializeApp(request.payload)
      }
      break

    case 'getAuthToken:google':
      chrome.identity.getAuthToken({ interactive: true }, function(token) {
        sendResponse({ payload: token })
      })
      break

    case 'getAuthToken:facebook': {
      var provider = new firebase.auth.FacebookAuthProvider()

      firebase
        .auth()
        .signInWithPopup(provider)
        .then(function(result) {
          console.log('BACKGROUND FACEBOOK RESULT', result)
          sendResponse({ payload: result.credential.accessToken })
        })
        .catch(function(error) {
          console.log('BACKGROUND FACEBOOK ERROR', error)
          sendResponse({ error })
        })
      break
    }

    default:
      break
  }

  // signal async use of sendResponse
  return true
})

chrome.browserAction.onClicked.addListener(function() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    var tab = tabs[0]

    if (!/https?:\/\/(.*)?realtor\.com\/realestateandhomes-detail/.test(tab.url)) {
      alert('This doesn\'t look like a Realtor.com listing page.')
    }

    chrome.tabs.sendMessage(tab.id, { type: 'toggleExtension' })
  })
})
