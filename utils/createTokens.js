import User from '../models/user.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const generateAccessToken = function (user) {
	return jwt.sign(
		{
			_id: user._id,
			email: user.email,
			username: user.username,
		},
		process.env.ACCESS_TOKEN_SECRET,
		{ expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
	);
};

const generateRefreshToken = function (user) {
	return jwt.sign(
		{
			_id: user._id,
		},
		process.env.REFRESH_TOKEN_SECRET,
		{ expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
	);
};


const generateAccessAndRefreshTokens = async (userId) => {
	try {
		const user = await User.findById(userId);

		const accessToken = await generateAccessToken(user);
		const refreshToken = await generateRefreshToken(user);

		// attach refresh token to the user document to avoid refreshing the access token with multiple refresh tokens
		user.refreshToken = refreshToken;

		await user.save({ validateBeforeSave: false });
		return { accessToken, refreshToken };
	} catch (error) {
	    console.log(error, 'Something went wrong while generating the access token');
	}
};

export default generateAccessAndRefreshTokens