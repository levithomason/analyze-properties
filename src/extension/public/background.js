// Heads up!
//
// This file is not compiled with babel.  It is loaded directly into the background page for the extension.

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.type) {
    case 'getAuthToken':
      chrome.identity.getAuthToken({ interactive: true }, token => {
        sendResponse({ payload: token })
      })
      break
    default:
      break
  }

  // signal async use of sendResponse
  return true
})

chrome.browserAction.onClicked.addListener(function() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { type: 'toggleExtension' })
  })
})
