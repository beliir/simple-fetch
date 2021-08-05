const querystring = require('querystring')

module.exports = (req, res, next) => {
  req.url = querystring.unescape(req.url)

  if (req.url.includes('задачи')) {
    req.url = req.url.replace('задачи', 'todos')
  }

  switch (req.url) {
    case '/todos/private-request':
      const authToken = req.headers.authorization?.split('Bearer ')[1]

      if (!authToken) {
        return res.sendStatus(403)
      }

      if (authToken !== 'token') {
        return res.sendStatus(403)
      } else {
        return res.status(200).json({ message: 'Private response' })
      }
    case '/todos/too-long': {
      const timerId = setTimeout(() => {
        res.sendStatus(200)
        clearTimeout(timerId)
      }, 3000)
      break
    }
    case '/todos/another-long': {
      const timerId = setTimeout(() => {
        res.json({ message: 'Long awaited response' })
        clearTimeout(timerId)
      }, 3000)
      break
    }
    case '/todos/custom-error':
      return res.status(400).json({ message: 'Custom error!' })
    case '/todos/throw-exception':
      throw new Error('Error!')
    default:
      next()
  }
}
