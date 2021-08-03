const simpleFetchCache = new Map()

let simpleFetchController = new window.AbortController()

const simpleFetch = async (options) => {
  let url = ''

  if (typeof options === 'string') {
    url = options
  } else {
    if (options?.url) {
      url = options.url
    }
  }

  if (simpleFetch.baseUrl) {
    if (!url) {
      url = simpleFetch.baseUrl
    } else {
      url =
        url.startsWith('/') || url.startsWith('?')
          ? `${simpleFetch.baseUrl}${url}`
          : `${simpleFetch.baseUrl}/${url}`
    }
  }

  if (options?.params) {
    url = Object.entries(options.params)
      .reduce((a, [k, v]) => {
        a += `&${k}=${v}`
        return a
      }, url)
      .replace('&', '?')
  }

  url = window.encodeURI(url)

  if (!url) {
    return console.error('URL not provided!')
  }

  let defaultOptions = {
    method: options?.method || 'GET',
    headers: options?.headers || {
      'Content-Type': 'application/json'
    },
    referrerPolicy: options?.referrerPolicy || 'no-referrer',
    customCache: options?.customCache ?? true,
    log: options?.log || false,
    signal: simpleFetchController.signal
  }

  if (simpleFetch.authToken) {
    defaultOptions.headers['Authorization'] = `Bearer ${simpleFetch.authToken}`
  }

  if (options?.body) {
    if (defaultOptions.headers['Content-Type'] === 'application/json') {
      defaultOptions.body = JSON.stringify(options.body)
    } else {
      defaultOptions.body = options.body
    }
  }

  if (typeof options === 'object') {
    defaultOptions = {
      ...options,
      ...defaultOptions
    }
  }

  if (defaultOptions.log) {
    console.log(
      `%c Options: ${JSON.stringify(defaultOptions, null, 2)}`,
      'color: blue'
    )
  }

  const isBodyNotProvided =
    (defaultOptions.method === 'POST' || defaultOptions.method === 'PUT') &&
    !defaultOptions.body

  if (isBodyNotProvided) {
    console.warn('Body not provided')
  }

  const handlers = options?.handlers

  if (handlers?.onAbort) {
    simpleFetchController.signal.addEventListener('abort', handlers.onAbort, {
      once: true
    })
  }

  const isCacheEnabled =
    defaultOptions.method === 'GET' && defaultOptions.customCache

  if (isCacheEnabled && simpleFetchCache.has(url)) {
    const data = simpleFetchCache.get(url)
    return handlers?.onSuccess ? handlers.onSuccess(data) : data
  }

  try {
    const response = await fetch(url, defaultOptions)

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

      if (defaultOptions.method === 'GET') {
        simpleFetchCache.set(url, result)

        if (defaultOptions.log) {
          console.log(simpleFetchCache)
        }
      }

      if (defaultOptions.log) {
        console.log(
          `%c Result: ${JSON.stringify(result, null, 2)}`,
          'color: green'
        )
      }

      return handlers?.onSuccess ? handlers.onSuccess(result) : result
    }

    result = {
      data: null,
      error: data,
      info
    }

    if (defaultOptions.log) {
      console.log(`%c Result: ${JSON.stringify(result, null, 2)}`, 'color: red')
    }

    return handlers?.onError ? handlers.onError(result) : result
  } catch (err) {
    if (handlers?.onError) {
      handlers.onError(err)
    }
    console.error(err)
  }
}

let simpleFetchBaseUrl = ''
Object.defineProperty(simpleFetch, 'baseUrl', {
  get: () => simpleFetchBaseUrl,
  set(url) {
    simpleFetchBaseUrl = url
  }
})

let simpleFetchAuthToken = ''
Object.defineProperty(simpleFetch, 'authToken', {
  get: () => simpleFetchAuthToken,
  set(token) {
    simpleFetchAuthToken = token
  }
})

simpleFetch.cancel = () => {
  simpleFetchController.abort()
  simpleFetchController = new window.AbortController()
}

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
    ...url
  })
}
