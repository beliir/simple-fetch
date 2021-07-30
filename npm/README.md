# Simple Fetch

### Utility for easy use of the <a href="https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API">Fetch API</a>

- Returns final (parsed to JSON, text or raw) result, including custom errors
- Can be cancelled (for example, if the request takes too long)
- Contains `baseUrl` setter

## Installation

```bash
yarn add very-simple-fetch
# or
npm i very-simple-fetch
```

## Usage

```js
import simpleFetch from 'very-simple-fetch'

const getTodos = async () => {
  const todos = await simpleFetch('https://jsonplaceholder.typicode.com/todos')
  console.table(todos)
}
getTodos()
```

[More examples on CodeSanbox](https://codesandbox.io/s/simple-fetch-1o2k)

## You can import module directly from GitHub Pages

```js
import simpleFetch from 'https://harryheman.github.io/simple-fetch/simpleFetch.js'
```

Note: this module contains optional chaining and nullish coalescing operators, so be sure that your environment supports this features.

## Signature of the main function

```js
simpleFetch(options: string | object)
// alias for simpleFetch.get()
```

## Signatures of helper functions

```js
// GET
simpleFetch.get(url: string, options: object)
// POST
simpleFetch.post(url: string, body: any, options: object)
// PUT
simpleFetch.update(url: string, body: any, options: object)
// DELETE
simpleFetch.remove(url: string, options: object)
```

## Cancellation of the request

```js
simpleFetch.cancel()
```

## Setting base URL

```js
simpleFetch.baseUrl = 'https://some-url.com'
```

## Options

- <a href="https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#parameters" target="_blank">common</a>
- custom:
  - params: object - this object is converted to encoded search parameters that are appended to the URL:
    - key: string
    - value: string
  - customCache: boolean - if `true`, result of the GET-request will be stored in the local cache  - <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map">Map</a>. Result of the same request will be retrieved from this cache until `customCache` is set to `false`
  - log: boolean - if `true`, options, cache and result will be output to the concole
  - handlers: object:
    - onSuccess: function
    - onError: function
    - onAbort: function

## Response

- data: any | null - result of the response or `null` if there war an error
- error: null | any - `null` or custom error
- info: object:
  - headers: object
  - status: number,
  - statusText: string
  - url: string

Utility returns something even if an exception was thrown.
