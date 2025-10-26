const bcrypt = require('bcrypt');
const saltRounds = 10;

export const hashPasswordHelper = async (password: string) => {
    return await bcrypt.hash(password, saltRounds);
}

export const comparePasswordHelper = async (password: string, hashPassword: string) => {
    return await bcrypt.compare(password, hashPassword);
}

export const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000);
}

export const getExpirationTime = (minutes: number = 10) => {
    const date = new Date();
    date.setMinutes(date.getMinutes() + minutes);
    return date;
};