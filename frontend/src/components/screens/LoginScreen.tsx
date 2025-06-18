import { ChangeEvent, FunctionComponent, useState } from 'react';
import { AuthContext } from '../../controllers/AuthContext';
import { withAuthContext } from '../../containers/withAuthContext';
import { LoginFields } from '../../types/user';
import { Button, TextField } from '@mui/material';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { AppRoute } from '../../constants/routes';

type Props = AuthContext;

const initialFields: LoginFields = {
    username: '',
    password: '',
}

const LoginScreenComponent: FunctionComponent<Props> = (props: Props) => {
    const { login } = props;

    const [fields, setFields] = useState<LoginFields>(initialFields);

    const navigate = useNavigate();

    const onLoginClick = async () => {
        const user = await login(fields);

        if (!user) {
            toast.error("Something went wrong")
        } else {
            navigate(AppRoute.INDEX);
        }
    };

    const onChange = ({ currentTarget: { name, value } }: ChangeEvent<HTMLInputElement>) => {
        setFields({
            ...fields,
            [name]: value
        });
    };

    return (
        <section className="login-screen">
            <section className='login-screen__content'>
                <h1>Login</h1>
                <div className='login-screen__content__group'>
                    <TextField
                        name='username'
                        label="Username"
                        variant="outlined"
                        onChange={onChange}
                    />
                </div>
                <div className='login-screen__content__group'>
                    <TextField
                        onChange={onChange}
                        name='password'
                        label="Password"
                        variant="outlined"
                        type='password'
                    />
                </div>
                <div className='login-screen__content__group'>
                    <Button
                        variant='contained'
                        onClick={onLoginClick}
                    >
                        Login
                    </Button>
                </div>
            </section>
        </section>
    );
};

export const LoginScreen = withAuthContext(LoginScreenComponent);
