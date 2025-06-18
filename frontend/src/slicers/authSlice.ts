import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SlicerName } from "../constants/slicers";
import { User } from "../types/user";

interface AuthSliceState {
    user: User | null;
    token: string | null;
}

const authSliceState: AuthSliceState = {
    user: null,
    token: null,
}

const userSlice = createSlice({
    name: SlicerName.Authentication,
    initialState: authSliceState,
    reducers: {
        setUser: (state, { payload }: PayloadAction<User | null>) => {
            state.user = payload;
        },
        setToken: (state, { payload }: PayloadAction<string | null>) => {
            state.token = payload;
        },
    }
});

const { reducer: authReducer, actions: { setUser, setToken } } = userSlice;

export type { AuthSliceState };

export { authReducer, setUser, setToken };
