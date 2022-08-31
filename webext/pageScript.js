const base = {
  XMLHttpRequest: window.XMLHttpRequest
}

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