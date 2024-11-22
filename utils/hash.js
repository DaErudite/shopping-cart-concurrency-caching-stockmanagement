import bcrypt from 'bcryptjs';


export const hash = async (data) => {
	const salt = await bcrypt.genSalt(10);
	const hash = await bcrypt.hash(data, salt);
	return hash;
};

export const verifyHash = async (data, password) => {
	const match = await bcrypt.compare(data, password);
	return match;
};