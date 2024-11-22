import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
//import crypto from 'crypto';
import User from '../models/user.js';
import Product from '../models/product.js'
//import OTP from '../models/Otp.js';
import jwt from 'jsonwebtoken';
import createTokens from '../utils/createTokens.js';
//import { uploader } from '../utils/cloudinary.js';
import asyncHandler from '../utils/asyncHandler.js';
import { hash, verifyHash } from '../utils/hash.js';
import Cart from '../models/cart.js'
import updateProductStock from '../updateProductStock.js';



export const registerUser = async (req, res) => {
	const { username, email, password } = req.body;
	try {
		const existingUser = await User.findOne({ email });

		// To handle the 409 status code, typically indicating a conflict, you might want to implement it in scenarios where there's a conflict with the current state of the resource.
		// For example, if you're trying to create a new user with an email or username that already exists, it would result in a conflict.
		if (existingUser) {
			return res.status(409).json({ error: 'Email Address already Exists' });
		}

		const hashedPassword = await hash(password);

		const user = await User.create({
			username,
			email,
			password: hashedPassword,
		});

		//create a unique instance of a cart
		const cart = await Cart.create({
			userId: user._id
		})

		// Remove password from the response
		user.password = undefined;

		res.status(200).json({
			user,
			statusCode: 200,
			success: true,
			message: 'Account created successfully, Login to continue',
			cart: cart
		});
	} catch (error) {
		console.error('Error in signinUser:', error);
		throw new ApiError(500, 'Internal server error');
	}
};

export const getUser = async (req, res) => {
	const id = req.params.id || req.user._id;
	try {
		const user = await User.findById(id).select('-password');
		if (!user) {
			return res.status(401).json({ message: 'Invalid user id' });
		}
		return res.status(200).json(user);
	} catch (error) {
		console.log(error);
		return res
			.status(500)
			.json({ error: error.message || 'Internal server error.' });
	}
};

// // login user

export const loginUser = async (req, res) => {
	const { email, password } = req.body;

	try {
		if (!email || !password) {
			return res
				.status(400)
				.json({ message: 'Email and password are required fields.' });
		}
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(401).json({ message: 'Invalid email or password.' });
		}

		const match = await bcrypt.compare(password, user.password);
		if (!match) {
			return res
				.status(401)
				.json({ message: 'Email or password is incorrect.' });
		}

		const { accessToken, refreshToken } = await createTokens(user._id);
		const newUser = await User.findOne({ _id: user._id }).select('-password');

		const options = {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
		};

		return res
			.status(200)
			.cookie('accessToken', accessToken, options) // set the access token in the cookie
			.cookie('refreshToken', refreshToken, options)
			.json({
				user: newUser,
				accessToken,
				refreshToken,
				statusCode: 200,
				success: true,
				message: 'Logged in successfully.',
			});
	} catch (error) {
		console.error('Error in signinUser:', error);
		return res
			.status(500)
			.json({ error: error.message || 'Internal server error.' });
	}
};


// // signinUser
export const signinUser = async (req, res) => {
	const { name, email, password } = req.body;
	try {
		const existingUser = await User.findOne({ email });

		// To handle the 409 status code, typically indicating a conflict, you might want to implement it in scenarios where there's a conflict with the current state of the resource.
		// For example, if you're trying to create a new user with an email or username that already exists, it would result in a conflict.
		if (existingUser) {
			return res.status(409).json({ error: 'Email Address already Exists' });
		}

		const hashedPassword = await hash(password);

		const user = await User.create({
			name,
			email,
			password: hashedPassword,
		});
		// Remove password from the response
		user.password = undefined;

		res.status(200).json({
			user,
			statusCode: 200,
			success: true,
			message: 'Account created successfully, Login to continue',
		});
	} catch (error) {
		console.error('Error in signinUser:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
};

export const logoutUser = asyncHandler(async (req, res) => {
	await User.findByIdAndUpdate(
		req.user._id,
		{
			$set: {
				refreshToken: undefined,
			},
		},
		{ new: true }
	);

	const options = {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
	};

	return res
		.status(200)
		.clearCookie('accessToken', options)
		.clearCookie('refreshToken', options)
		.json({ message: 'User logged out successfully' });
});


