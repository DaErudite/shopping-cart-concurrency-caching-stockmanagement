import jwt from 'jsonwebtoken';
import User from '../models/user.js';



export const requireAuth = async (req, res, next) => {
	// verify user is authenticated
	const { authorization } = req.headers;
	const token =
		req.cookies?.accessToken ||
		authorization?.split(' ')[1] ||
		req.header('Authorization')?.replace('Bearer ', '');

	if (!token) {
		return res.status(401).json({ error: 'Authorization token required' });
	}
	try {
		const { _id } = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
		const user = await User.findOne({ _id }).select('-password -refreshToken');
		if (!user) {
			return res.status(401).json({ error: 'Invalid access token' });
		}
		req.user = user;
		next();
	} catch (error) {
		console.log(error);
		res.status(401).json({ error: 'Request is not authorized' });
	}
};