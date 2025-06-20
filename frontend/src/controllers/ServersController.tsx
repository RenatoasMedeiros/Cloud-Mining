import axios from "axios";
import { Component, ReactNode } from "react";
import { serverURL, serversURL, createServerURL } from "../services/server";
import { AppDispatch, RootState } from "../store";
import { connect } from "react-redux";
import { ServersProvider } from "./ServersContext";
import { Server, ServerCreateRequest } from "../types/server";

interface OwnProps {
    children: ReactNode;
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

            if (!data || !data.servers) return [];

            return data.servers;
        } catch {
            return [];
        }
    }

    getServer  = async (serverName: string): Promise<Server | null> => {
        try {
            const { data } = await axios.get<Server>(serverURL(serverName));

            return data;
        } catch {
            return null;
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
