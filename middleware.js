const querystring = require('querystring')

module.exports = (req, res, next) => {
  req.url = querystring.unescape(req.url)
  if (req.url.includes('задачи')) {
    req.url = req.url.replace('задачи', 'todos')
  }
  if (req.url === '/todos/private-request') {
    const authToken = req.headers.authorization?.split('Bearer ')[1]
    if (!authToken) {
      return res.sendStatus(403)
    }
    if (authToken !== 'token') {
      return res.sendStatus(403)
    } else {
      return res.status(200).json({ message: 'Private response' })
    }
  }
  if (req.url === '/todos/too-long') {
    const timerId = setTimeout(() => {
      res.sendStatus(200)
      clearTimeout(timerId)
    }, 3000)
  } else if (req.url === '/todos/custom-error') {
    res.status(400).json({ message: 'Custom error!' })
  } else if (req.url === '/todos/throw-exception') {
    throw new Error('Error!')
  } else {
    next()
  }
}
