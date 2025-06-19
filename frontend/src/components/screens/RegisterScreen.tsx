import { ChangeEvent, FunctionComponent, useState } from 'react';
import { AuthContext } from '../../controllers/AuthContext';
import { withAuthContext } from '../../containers/withAuthContext';
import { UserRegisterFields } from '../../types/user';
import { Button, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AppRoute } from '../../constants/routes';

type Props = AuthContext;

const initialFields: UserRegisterFields = {
    username: '',
    password: '',
}

const RegisterScreenComponent: FunctionComponent<Props> = (props: Props) => {
    const { register } = props;

    const [fields, setFields] = useState<UserRegisterFields>(initialFields);

    const navigate = useNavigate();

    const registerUser = async () => {
        const userCreated = await register(fields);

        if (!userCreated) {
            toast.error("Something went wrong")
        } else {
            navigate(AppRoute.LOGIN);
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
                <h1>Register</h1>
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
                        onClick={registerUser}
                    >
                        Register
                    </Button>
                </div>
            </section>
        </section>
    );
};

export const RegisterScreen = withAuthContext(RegisterScreenComponent);
