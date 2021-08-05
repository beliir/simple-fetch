import { createTodo } from './utils.js'

simpleFetch.baseUrl = 'http://localhost:5000/задачи'

export const getCachedTodos = async () => {
  const response = await simpleFetch.get({
    log: true
  })

  response.data.forEach((todo) => {
    createTodo(todo)
  })
}

export const getTodosFromServer = async () => {
  const onSuccess = ({ data }) => {
    data.forEach((todo) => {
      createTodo(todo)
    })
  }

  await simpleFetch({
    customCache: false,
    handlers: { onSuccess }
  })
}

export const getTodoById = async (todoId) => {
  const { data } = await simpleFetch.get(todoId)
  createTodo(data)
}

export const getFirstTwoTodosDesc = async () => {
  const onSuccess = ({ data }) => {
    data.forEach((todo) => {
      createTodo(todo)
    })
  }

  await simpleFetch({
    params: {
      _sort: 'id',
      _order: 'desc',
      _limit: 2
    },
    handlers: { onSuccess },
    log: true
  })
}

export const addTodo = async (text) => {
  const id = Math.random().toString(16).replace('0.', '')
  const todo = {
    id,
    text,
    done: false
  }
  await simpleFetch.post(todo)
}

export const updateTodo = async (todoId) => {
  const { data: existingTodo } = await simpleFetch.get(todoId, {
    customCache: false
  })
  const newTodo = { ...existingTodo, done: !existingTodo.done }
  await simpleFetch.update(todoId, newTodo)
}

export const removeTodo = async (todoId) => {
  await simpleFetch.remove(todoId)
}

export const setAuthToken = () => {
  simpleFetch.authToken = 'token'
}

export const sendPrivateRequest = async () => {
  const { data, error } = await simpleFetch.get('/private-request', {
    customCache: false,
    log: true
  })
  if (error) {
    console.error(error)
  } else {
    console.log(data)
  }
}

const sendAnotherLongRequest = async () => {
  const { data } = await simpleFetch('/another-long')
  console.log(data)
}

export const sendTooLongRequest = async () => {
  const onAbort = () => {
    console.log('Request aborted!')
  }
  const onError = (err) => {
    console.error(err.message)
  }

  simpleFetch({
    url: '/too-long',
    handlers: {
      onAbort,
      onError
    }
  })

  const { currentRequestId } = simpleFetch

  sendAnotherLongRequest()

  const timerId = setTimeout(() => {
    simpleFetch.cancel(currentRequestId)
    clearTimeout(timerId)
  }, 2000)
}

export const getCustomError = async () => {
  const response = await simpleFetch('custom-error')
  console.log(response.error)
}

export const throwException = async () => {
  const { error } = await simpleFetch('throw-exception')
  console.log(error)
}
