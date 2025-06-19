import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SlicerName } from "../constants/slicers";
import { WebSocketStatus } from "../types/misc";

interface WebSocketState {
    ws: WebSocket | null; // WebSocket instance
    status: WebSocketStatus; // Current connection status
    messages: string[]; // List of messages received
}

const initialState: WebSocketState = {
    ws: null,
    status: WebSocketStatus.DISCONNECTED,
    messages: []
}

const userSlice = createSlice({
    name: SlicerName.Websocket,
    initialState: initialState,
    reducers: {
        setWebSocketInstance: (state, action: PayloadAction<WebSocket>) => {
            state.ws = action.payload;
            state.status = WebSocketStatus.CONNECTING;
        },
        setWebSocketStatus: (state, action: PayloadAction<WebSocketStatus>) => {
            state.status = action.payload;
        },
        setWebSocketMessages: (state, action: PayloadAction<string[]>) => {
            state.messages = action.payload;
        },
        addWebSocketMessage: (state, action: PayloadAction<string>) => {
            state.messages.push(action.payload);
        },
        closeWebSocket: (state) => {
            if (state.ws) {
                state.ws.close();
                state.ws = null;
            }
            state.status = WebSocketStatus.DISCONNECTED;
        }
    }
});

const { reducer: wsReducer, actions: { setWebSocketInstance, setWebSocketStatus, setWebSocketMessages, addWebSocketMessage, closeWebSocket } } = userSlice;

export type { WebSocketState };

export { wsReducer, setWebSocketInstance, setWebSocketStatus, setWebSocketMessages, addWebSocketMessage, closeWebSocket };
