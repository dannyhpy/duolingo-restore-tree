const src = chrome.runtime.getURL('pageScript.js')

const script = document.createElement('script')
script.setAttribute('type', 'text/javascript')
script.setAttribute('src', src)

function main () {
  if (document.head == null) {
    setTimeout(main, 20)
  } else {
    document.head.appendChild(script)
  }
}

setTimeout(main, 20)