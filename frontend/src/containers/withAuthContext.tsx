import { ComponentType, FunctionComponent } from "react";
import { AuthConsumer, AuthContext } from "../controllers/AuthContext";
import { ConnectedAuthController } from "../controllers/AuthController";


export const withAuthContext = <P extends object>(Component: ComponentType<P>): FunctionComponent<Omit<P, keyof AuthContext>> => (props) => (
    <ConnectedAuthController>
        <AuthConsumer>
            {(context) => <Component {...props as P} {...context} />}
        </AuthConsumer>
    </ConnectedAuthController>
);
