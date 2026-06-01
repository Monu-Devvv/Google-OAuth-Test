import express from 'express'
import session from 'express-session'
import passport from 'passport'
import dotenv from 'dotenv'
import './auth/google.js'

dotenv.config()

const app = express()

const PORT = 3000

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
  })
)

app.use(passport.initialize())
app.use(passport.session())

app.get('/', (req, res) => {
  res.send('<a href="/auth/google">Login with Google</a>')
})

app.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
)

app.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/',
    successRedirect: '/profile',
  })
)

function authCheck(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/')
}

app.get('/profile', authCheck, (req, res) => {
  res.send(`
    <h1>Welcome ${req.user.displayName}</h1>
    <img src="${req.user.photos?.[0]?.value || ''}" />
    <br />
    <a href="/logout">Logout</a>
  `)
})

app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/')
  })
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})