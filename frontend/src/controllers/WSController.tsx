import { Component, ReactNode } from "react";
import { AppDispatch, RootState } from "../store";
import { connect } from "react-redux";
import { WSProvider } from "./WSContext";
import { setWebSocketMessages, setWebSocketStatus } from "../slicers/wsSlice";
import { WebSocketStatus } from "../types/misc";
import { WS_URL } from "../settings";

interface OwnProps {
    children: ReactNode;
}

interface State {
    socket: WebSocket | null;
    isConnected: boolean;
}

type Props = OwnProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispachToProps>;

export class WSController extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            socket: null,
            isConnected: false
        };
    }    

    componentDidMount() {
        this.connectWebSocket();
    }

    componentWillUnmount() {
        this.closeConnection();
    }

    connectWebSocket = () => {
        const socket = new WebSocket(WS_URL); // WebSocket URL (modify if needed)

        socket.onopen = () => {
            console.log("WebSocket connected.");
            this.setState({ isConnected: true });
            this.props.dispatchSetWebSocketStatus(WebSocketStatus.CONNECTED);
        };

        socket.onclose = () => {
            console.log("WebSocket disconnected.");
            this.setState({ isConnected: false });
            this.props.dispatchSetWebSocketStatus(WebSocketStatus.DISCONNECTED);
        };

        socket.onerror = (error) => {
            console.error("WebSocket error:", error);
            // Optionally update Redux state for error handling
            this.props.dispatchSetWebSocketStatus(WebSocketStatus.ERROR);
        };

        socket.onmessage = (message) => {
            console.log("Received message:", message.data);

            this.props.dispatchSetWebSocketMessages([ message.data ])
        };

        this.setState({ socket });
    }

    sendMessage = (message: string) => {
        const { socket, isConnected } = this.state;
        if (socket && isConnected) {
            socket.send(message);
            console.log("Message sent:", message);
        } else {
            console.error("WebSocket is not connected.");
        }
    }

    closeConnection = () => {
        const { socket } = this.state;
        if (socket) {
            socket.close();
            this.setState({ socket: null, isConnected: false });
            this.props.dispatchSetWebSocketStatus(WebSocketStatus.DISCONNECTED);
        }
    }

    render(): ReactNode {
        const { children, messages } = this.props;
        const { isConnected } = this.state;

        return (
            <WSProvider
                value={{
                    messages,
                    isConnected,
                    closeConnection: this.closeConnection,
                    connectWebSocket: this.closeConnection,
                    sendMessage: this.sendMessage,
                }}
            >
                {children}
            </WSProvider>
        )
    }
}

const mapStateToProps = ({ websocket }: RootState) => ({
    messages: websocket.messages,
});

const mapDispachToProps = (dispatch: AppDispatch) => ({
    dispatchSetWebSocketStatus: (status: WebSocketStatus) => dispatch(setWebSocketStatus(status)),
    dispatchSetWebSocketMessages: (messages: string[]) => dispatch(setWebSocketMessages(messages)),
});

export const ConnectedWSController = connect(mapStateToProps, mapDispachToProps)(WSController);
