const simpleFetchCache = new Map()

let simpleFetchController = new window.AbortController()

const simpleFetch = async (options) => {
  let url = ''

  if (typeof options === 'string') {
    url = options
  } else {
    url = options?.url
  }

  if (simpleFetch.baseUrl) {
    if (!url) {
      url = simpleFetch.baseUrl
    } else {
      url =
        url.indexOf('/') === 0
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
    referrerPolicy: 'no-referrer',
    customCache: options?.customCache ?? true,
    log: options?.log || false,
    signal: simpleFetchController.signal
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

  if (options?.log) {
    console.log(`%c Options: ${JSON.stringify(defaultOptions)}`, 'color: blue')
  }

  const handlers = options?.handlers

  if (handlers?.onAbort) {
    simpleFetchController.signal.addEventListener('abort', handlers.onAbort)
  }

  const issimpleFetchCacheEnabled =
    defaultOptions.method === 'GET' && defaultOptions.customCache

  if (issimpleFetchCacheEnabled && simpleFetchCache.has(url)) {
    const data = simpleFetchCache.get(url)
    return handlers?.onSuccess ? handlers.onSuccess(data) : data
  }

  const isBodyNotProvided =
    (defaultOptions.method === 'POST' || defaultOptions.method === 'PUT') &&
    !defaultOptions.body

  if (isBodyNotProvided) {
    console.warn('Body not provided')
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

    if (response.headers.get('Content-Type')?.includes('json')) {
      data = await response.json()
    } else if (response.headers.get('Content-Type')?.includes('text')) {
      data = await response.text()
    } else {
      data = response
    }

    let result = null

    if (response.ok) {
      result = { data, error: null, info }

      if (defaultOptions.method === 'GET') {
        simpleFetchCache.set(url, result)
        if (options?.log) {
          console.log(simpleFetchCache)
        }
      }

      if (options?.log) {
        console.log(`%c Result: ${JSON.stringify(result)}`, 'color: green')
      }

      return handlers?.onSuccess ? handlers.onSuccess(result) : result
    }

    result = {
      data: null,
      error: data,
      info
    }

    if (options?.log) {
      console.log(`%c Result: ${JSON.stringify(result)}`, 'color: red')
    }

    return result
  } catch (err) {
    if (handlers?.onError) {
      return handlers.onError(err)
    }
    console.error(err)
  }
}

let baseUrl = ''
Object.defineProperty(simpleFetch, 'baseUrl', {
  get: () => baseUrl,
  set: (url) => {
    baseUrl = url
  }
})

simpleFetch.cancel = () => {
  simpleFetchController.abort()
  simpleFetchController = new window.AbortController()
}

simpleFetch.get = (url, options) =>
  simpleFetch({
    url,
    ...options
  })

simpleFetch.post = (url, body, options) =>
  simpleFetch({
    url,
    method: 'POST',
    body,
    ...options
  })

simpleFetch.update = (url, body, options) =>
  simpleFetch({
    url,
    method: 'PUT',
    body,
    ...options
  })

simpleFetch.remove = (url, options) =>
  simpleFetch({
    url,
    method: 'DELETE',
    ...options
  })

export default simpleFetch
