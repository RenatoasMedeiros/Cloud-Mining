import axios from "axios";
import { Component, ReactNode } from "react";
import { serverURL, serversURL, createServerURL } from "../services/server";
import { AppDispatch, RootState } from "../store";
import { connect } from "react-redux";
import { ServersProvider } from "./ServersContext";
import { Server, ServerCreateRequest, ServerStatus } from "../types/server";

interface OwnProps {
    children: ReactNode;
}

const statuses = [ServerStatus.ONLINE, ServerStatus.OFFLINE];

function getRandomStatus() {
    return statuses[Math.floor(Math.random() * statuses.length)];
}

function getRandomName() {
    const names = ['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta', 'iota', 'kappa', 'lambda', 'mu', 'nu', 'xi', 'omicron'];
    const idx = Math.floor(Math.random() * names.length);
    return `${names[idx]}-${Math.floor(Math.random() * 10000)}.cloudmine.me`;
}

type Props = OwnProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispachToProps>;

export class ServersController extends Component<Props> {
    createServer  = async (request: ServerCreateRequest): Promise<Server | null> => {
        try {
            const { data } = await axios.post<Server | null>(createServerURL(), { ...request });

            return data;
        } catch {
            return null;
        }
    }

    getAll  = async (): Promise<Server[]> => {
        try {
            const { data } = await axios.get<{ servers: Server[] | null }>(serversURL());

            console.log("data = ", data);
            

            if (!data || !data.servers) {
                return Array.from({ length: 15 }, (_, i) => ({
                    port: `${1000 + i}`,
                    version: getRandomName(),
                    name: getRandomName(),
                    status: getRandomStatus()
                }));
            }

            return data.servers;
        } catch {
            return Array.from({ length: 15 }, (_, i) => ({
                port: `${1000 + i}`,
                version: getRandomName(),
                name: getRandomName(),
                status: getRandomStatus()
            }));
        }
    }

    getServer  = async (serverName: string): Promise<Server | null> => {
        try {
            const { data } = await axios.get<Server>(serverURL(serverName));

            return data;
        } catch {
            return {
                port: '0001',
                name: 'rodrigo-minecloud.me',
                status: ServerStatus.ONLINE,
                version: 'asd'
            };
        }
    }

    render(): ReactNode {
        const { children } = this.props;

        return (
            <ServersProvider
                value={{
                    getAll: this.getAll,
                    createServer: this.createServer,
                    getServer: this.getServer,
                }}
            >
                {children}
            </ServersProvider>
        )
    }
}

const mapStateToProps = ({ }: RootState) => ({ });

const mapDispachToProps = (_: AppDispatch) => ({ });

export const ConnectedServersController = connect(mapStateToProps, mapDispachToProps)(ServersController);
