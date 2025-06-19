export enum ServerStatus {
    ONLINE = 'online',
    OFFLINE = 'offline',
}

export interface Server {
    name: string;
    version: string;
    status: ServerStatus;
    port: string;
}

export type ServerCreateRequest = {
    username: string;
    version: string;
    memory: string;
}


