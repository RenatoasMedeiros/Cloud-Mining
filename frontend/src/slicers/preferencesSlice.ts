import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SlicerName } from "../constants/slicers";
import { AppTheme, Language } from "../types/misc";


interface PreferencesSliceState {
    theme: AppTheme;
    language: Language;
}

const preferencesSliceState: PreferencesSliceState = {
    theme: AppTheme.Dark,
    language: Language.EN,
}

const preferencesSlice = createSlice({
    name: SlicerName.Preferences,
    initialState: preferencesSliceState,
    reducers: {
        setTheme: (state, { payload }: PayloadAction<AppTheme>) => {
            state.theme = payload;
        },
        setLanguage: (state, { payload }: PayloadAction<Language>) => {
            state.language = payload;
        }
    }
});

const { reducer: preferencesReducer, actions: { setTheme, setLanguage } } = preferencesSlice;

export type { PreferencesSliceState };

export { preferencesReducer, setTheme, setLanguage };
