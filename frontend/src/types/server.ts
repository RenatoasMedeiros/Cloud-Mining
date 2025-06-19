export enum ServerStatus {
    ONLINE = 'ONLINE',
    OFFLINE = 'OFFLINE',
}

export interface Server {
    id: string;
    name: string;
    status: ServerStatus;
}

export type ServerCreateRequest = {
    name: string;
}


