const base = {
  fetch: unsafeWinow.fetch,
  XMLHttpRequest: window.XMLHttpRequest
}

window.fetch = new Proxy(base.fetch, {
  apply (target, thisArg, argumentList) {
    return target.apply(thisArg, argumentList).then((res) => {
      const url = argumentList[0]
      if (typeof url !== 'string') return res
      return new Proxy(res, {
        get (target2, prop, receiver) {
          if (typeof target2[prop] === 'function') {
            if (prop === 'text') {
              return new Proxy(target2[prop], {
                apply (target3, thisArg2, argumentList2) {
                  return target3.apply(target2, argumentList2).then((body) => {
                    if (url.match(/\/2017-06-30\/users\/\d+/)) {
                      try {
                        const json = JSON.parse(body)
                        if ('currentCourse' in json) {
                          delete json.currentCourse.path
                        }
                        return JSON.stringify(json)
                      } catch (err) {
                        return body
                      }
                    }
                    return body
                  })
                }
              })
            }
            return target2[prop].bind(target2)
          }
          return target2[prop]
        }
      })
    })
  }
})

window.XMLHttpRequest = new Proxy(base.XMLHttpRequest, {
  construct (target) {
    const xhr = new target()

    return new Proxy(xhr, xhrHandler)
  }
})

const xhrHandler = {
  get (target, propertyKey, _receiver) {
    switch (propertyKey) {
      case 'response':
        const rXhr = target.__rollbar_xhr
        if (
          rXhr.method === 'GET'
          && rXhr.url.match(/\/2017-06-30\/users\/\d+/)
        ) {
          const response = target.response
          if (response == null) return
          
          if ('currentCourse' in response) {
            delete response.currentCourse.path
          }

          return response
        }
        return target[propertyKey]

      default:
        return typeof target[propertyKey] === 'function'
          ? target[propertyKey].bind(target)
          : target[propertyKey]
    }
  },

  set (target, propertyKey, propertyValue, _receiver) {
    target[propertyKey] = propertyValue
    return true
  }
}
