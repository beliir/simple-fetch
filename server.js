const express = require('express')
const cors = require('cors')

const app = express()

app.use(cors())
app.use(express.static('public'))
app.get('*', (req, res) => {
  res.sendFile(`${__dirname}${req.url}`)
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log('Server ready 🚀')
})
