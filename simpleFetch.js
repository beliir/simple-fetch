const simpleFetchCache = new Map()

const generateRequestId = () => {
  const requestId = Math.random().toString(16).slice(2)
  if (simpleFetch.abortControllers[requestId]) {
    return generateRequestId()
  }
  simpleFetch.abortControllers[requestId] = new AbortController()
  simpleFetch.currentRequestId = requestId
  return requestId
}

const simpleFetch = async (options) => {
  let url = ''

  if (typeof options === 'string') {
    url = options
  } else {
    if (options?.url) {
      url = options.url
    }
  }

  const isSpecialCase =
    url.startsWith('/') ||
    url.startsWith('?') ||
    url.startsWith(':') ||
    url.lastIndexOf('/') === url.length - 1 ||
    url.lastIndexOf('?') === url.length - 1 ||
    url.lastIndexOf(':') === url.length - 1

  if (simpleFetch.baseUrl) {
    if (!url) {
      url = simpleFetch.baseUrl
    } else {
      url = isSpecialCase
        ? `${simpleFetch.baseUrl}${url}`
        : `${simpleFetch.baseUrl}/${url}`
    }
  }

  if (options?.params) {
    url = `${url}?${new URLSearchParams(options.params)}`
  }

  url = window.encodeURI(url)

  if (!url) {
    return console.error('URL not provided!')
  }

  const requestId = generateRequestId()

  let _options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    referrerPolicy: 'no-referrer',
    customCache: true,
    log: false,
    signal: simpleFetch.abortControllers[requestId].signal
  }

  if (typeof options === 'object') {
    _options = {
      ..._options,
      ...options
    }
  }

  if (
    _options.body &&
    _options.headers['Content-Type'] === 'application/json'
  ) {
    _options.body = JSON.stringify(_options.body)
  }

  if (simpleFetch.authToken) {
    _options.headers['Authorization'] = `Bearer ${simpleFetch.authToken}`
  }

  if (_options.log) {
    console.log(
      `%c Options: ${JSON.stringify(_options, null, 2)}`,
      'color: blue'
    )
  }

  if (
    (_options.method === 'POST' || _options.method === 'PUT') &&
    !_options.body
  ) {
    console.warn('Body not provided!')
  }

  const handlers = options?.handlers

  if (handlers?.onAbort) {
    simpleFetch.abortControllers[requestId].signal.addEventListener(
      'abort',
      handlers.onAbort,
      {
        once: true
      }
    )
  }

  if (
    _options.method === 'GET' &&
    _options.customCache &&
    simpleFetchCache.has(url)
  ) {
    const cachedData = simpleFetchCache.get(url)
    return handlers?.onSuccess ? handlers.onSuccess(cachedData) : cachedData
  }

  try {
    const response = await fetch(url, _options)

    const { status, statusText } = response

    const info = {
      headers: [...response.headers.entries()].reduce((a, [k, v]) => {
        a[k] = v
        return a
      }, {}),
      status,
      statusText,
      url: response.url
    }

    let data = null

    const contentTypeHeader = response.headers.get('Content-Type')

    if (contentTypeHeader) {
      if (contentTypeHeader.includes('json')) {
        data = await response.json()
      } else if (contentTypeHeader.includes('text')) {
        data = await response.text()

        if (data.includes('Error:')) {
          const errorMessage = data
            .match(/Error:.[^<]+/)[0]
            .replace('Error:', '')
            .trim()

          if (errorMessage) {
            data = errorMessage
          }
        }
      } else {
        data = response
      }
    } else {
      data = response
    }

    let result = null

    if (response.ok) {
      result = { data, error: null, info }

      if (_options.method === 'GET') {
        simpleFetchCache.set(url, result)

        if (_options.log) {
          console.log(simpleFetchCache)
        }
      }

      if (_options.log) {
        console.log(
          `%c Result: ${JSON.stringify(result, null, 2)}`,
          'color: green'
        )
      }

      delete simpleFetch.abortControllers[requestId]

      return handlers?.onSuccess ? handlers.onSuccess(result) : result
    }

    result = {
      data: null,
      error: data,
      info
    }

    if (_options.log) {
      console.log(`%c Result: ${JSON.stringify(result, null, 2)}`, 'color: red')
    }

    delete simpleFetch.abortControllers[requestId]

    return handlers?.onError ? handlers.onError(result) : result
  } catch (err) {
    if (handlers?.onError) {
      handlers.onError(err)
    }
    delete simpleFetch.abortControllers[requestId]
    console.error(err)
  }
}

Object.defineProperties(simpleFetch, {
  abortControllers: {
    value: [],
    writable: true
  },
  currentRequestId: {
    value: '',
    writable: true
  },
  cancel: {
    value(requestId) {
      if (requestId) {
        this.abortControllers[requestId].abort()
      } else {
        this.abortControllers[this.currentRequestId].abort()
      }
    }
  },
  baseUrl: {
    value: '',
    writable: true,
    enumerable: true
  },
  authToken: {
    value: '',
    writable: true,
    enumerable: true
  }
})

simpleFetch.get = (url, options) => {
  if (typeof url === 'string') {
    return simpleFetch({
      url,
      ...options
    })
  }
  return simpleFetch({
    ...url
  })
}

simpleFetch.post = (url, body, options) => {
  if (typeof url === 'string') {
    return simpleFetch({
      url,
      method: 'POST',
      body,
      ...options
    })
  }
  return simpleFetch({
    method: 'POST',
    body: url,
    ...body
  })
}

simpleFetch.update = (url, body, options) => {
  if (typeof url === 'string') {
    return simpleFetch({
      url,
      method: 'PUT',
      body,
      ...options
    })
  }
  return simpleFetch({
    method: 'PUT',
    body: url,
    ...body
  })
}

simpleFetch.remove = (url, options) => {
  if (typeof url === 'string') {
    return simpleFetch({
      url,
      method: 'DELETE',
      ...options
    })
  }
  return simpleFetch({
    method: 'DELETE',
    ...url
  })
}
