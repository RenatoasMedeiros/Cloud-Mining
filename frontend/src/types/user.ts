type LoginFields = {
    username: string;
    password: string;
}

type UserRegisterFields = LoginFields;

type User = {
    id: string;
    token: string;
    username: string;
}

export type {
    User,
    LoginFields,
    UserRegisterFields
}