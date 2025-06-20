import { API_URL } from '../settings';

const serversURL = () => `${API_URL()}/servers`;

const serverURL = (serverId: string) => `${API_URL()}/servers/${serverId}`;

const createServerURL = () => `${API_URL()}/servers`;

export {
    createServerURL,
    serversURL,
    serverURL,
};
