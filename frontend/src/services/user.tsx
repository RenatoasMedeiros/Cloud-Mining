import { API_URL } from '../settings';

const loginURL = () => `${API_URL}/users/login`;

const registerURL = () => `${API_URL}/users/register`;

export {
    loginURL,
    registerURL,
};
