import axios from "axios";

const setupInterceptor = () => {
    axios.interceptors.request.use(
        (config) => {

            const newConfig = config;

            newConfig.headers.Accept = 'application/json';

            newConfig.headers["Content-Type"] = 'application/json';

            const bearerToken = localStorage.getItem('token');

            if (bearerToken) newConfig.headers.Authorization = `Bearer ${bearerToken ?? ''}`;

            return newConfig;
        },
        (err) => Promise.reject(err),
    );
};

const setup = () => {
    axios.create({ withCredentials: true });
    setupInterceptor();
}

export { setup };
