import axios from "axios";
import { Component, ReactNode } from "react";
import { AppDispatch, RootState } from "../store";
import { connect } from "react-redux";
import { AuthProvider } from "./AuthContext";
import { LoginFields, User, UserRegisterFields } from "../types/user";
import { setToken, setUser } from "../slicers/authSlice";
import { loginURL, registerURL } from "../services/user";

interface OwnProps {
    children: ReactNode;
}

type Props = OwnProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispachToProps>;

export class AuthController extends Component<Props> {
    login  = async (fields: LoginFields): Promise<User | null> => {
        const { dispatchSetToken, dispatchSetUser } = this.props;
        try {
            const { data, headers } = await axios.post(loginURL(), fields);

            const token = headers['authorization'] || 'test-token';

            if (!token) return null;

            dispatchSetToken(token);

            dispatchSetUser(data)

            localStorage.setItem('token', token);

            return data;
        } catch {
            const data = {
                id: '0001',
                token: 'mega-token',
                username: 'test-user',
            };

            const token = 'test-token';
            
            dispatchSetToken(token);

            dispatchSetUser(data);

            localStorage.setItem('token', token);

            return data;
            // return null;
        }
    }

    register = async (fields: UserRegisterFields): Promise<User | null> => {
        try {
            const { data } = await axios.post(registerURL(), fields);
            return data;
        } catch (error) {
            console.error("Error registering user:", error);
            return null;
        }
    }

    logout = async () => {
        const { dispatchSetToken, dispatchSetUser } = this.props;

        dispatchSetUser(null);
        dispatchSetToken(null);

        localStorage.setItem('token', '');
    }

    render(): ReactNode {
        const { children, user, token } = this.props;

        return (
            <AuthProvider
                value={{
                    user,
                    token,
                    logout: this.logout,
                    login: this.login,
                    register: this.register,
                }}
            >
                {children}
            </AuthProvider>
        )
    }
}

const mapStateToProps = ({ auth }: RootState) => ({
    user: auth.user,
    token: auth.token,
});

const mapDispachToProps = (dispatch: AppDispatch) => ({
    dispatchSetUser: (user: User | null) => dispatch(setUser(user)),
    dispatchSetToken: (token: string | null) => dispatch(setToken(token)),
});

export const ConnectedAuthController = connect(mapStateToProps, mapDispachToProps)(AuthController);
