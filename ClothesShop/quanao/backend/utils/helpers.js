export const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000);
}

export const generateCodeExpired = () => {
  return new Date(Date.now() + 10 * 60 * 1000);
}