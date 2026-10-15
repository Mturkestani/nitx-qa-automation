// The two addresses, in one place. They are read when called, after .env is loaded.
export const baseUrl = () => process.env.BASE_URL ?? 'https://practicesoftwaretesting.com';
export const apiUrl = () => process.env.API_URL ?? 'https://api.practicesoftwaretesting.com';
