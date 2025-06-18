import { ComponentType, FunctionComponent } from "react";
import { ServersConsumer, ServersContext } from "../controllers/ServersContext";
import { ConnectedServersController } from "../controllers/ServersController";


export const withServersContext = <P extends object>(Component: ComponentType<P>): FunctionComponent<Omit<P, keyof ServersContext>> => (props) => (
    <ConnectedServersController>
        <ServersConsumer>
            {(context) => <Component {...props as P} {...context} />}
        </ServersConsumer>
    </ConnectedServersController>
);
