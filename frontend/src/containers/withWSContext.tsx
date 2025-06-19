import { ComponentType, FunctionComponent } from "react";
import { WSConsumer, WSContext } from "../controllers/WSContext";
import { ConnectedWSController } from "../controllers/WSController";


export const withWSContext = <P extends object>(Component: ComponentType<P>): FunctionComponent<Omit<P, keyof WSContext>> => (props) => (
    <ConnectedWSController>
        <WSConsumer>
            {(context) => <Component {...props as P} {...context} />}
        </WSConsumer>
    </ConnectedWSController>
);
