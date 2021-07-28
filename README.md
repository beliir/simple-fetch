# Simple Fetch

### Utility for easy use of the <a href="https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API">Fetch API</a>

- Returns final (parsed to JSON, text or raw) result, including custom errors
- Can be cancelled (for example, if the request takes too long)
- Contains `baseUrl` setter

## Structure of the project

```
- public
  - scripts
    - actions.js
    - index.js - click handler
    - utils.js - helper function for creating todo item
  - index.html
  - style.css
- middleware.js - custom routes for json-server
- server.js - express-server for avoiding CORS
- simpleFetch.js
- todos.json - mock data
```

## Run of the project

```bash
git clone https://github.com/harryheman/simple-fetch.git

cd simple-fetch

# install dependencies
yarn
# or
npm i

# run json-server and express-server
yarn dev
# or
npm run dev
```

[Project on CodeSanbox]()

## You can use the module directly by importing it from GitHub Pages

```js
import simpleFetch from 'https://harryheman.github.io/simple-fetch/public/simpleFetch.js'

const getTodos = async () => {
  const todos = await simpleFetch('https://jsonplaceholder.typicode.com/todos')
  console.table(todos)
}
getTodos()
```

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
