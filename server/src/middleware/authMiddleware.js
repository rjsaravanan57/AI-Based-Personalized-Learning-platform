import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization
    console.log('Authorization Header:', authHeader)
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null

    if (!token) {
      console.warn('Missing Bearer token for request to', req.originalUrl)
      return res.status(401).json({ error: 'Not authorized, token missing' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    console.log('JWT decoded user id:', decoded?.id)

    const user = await User.findById(decoded.id).select('-password')
    if (!user) {
      console.warn('Token valid but user not found for id:', decoded.id)
      return res.status(401).json({ error: 'Invalid token' })
    }

    req.user = user
    next()
  } catch (error) {
    console.error('Auth middleware error:', error.message)
    res.status(401).json({ error: 'Token verification failed' })
  }
}

export function authorize(roles = []) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    next()
  }
}

export default protect
