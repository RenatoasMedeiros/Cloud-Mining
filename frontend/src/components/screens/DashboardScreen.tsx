import { ChangeEvent, FunctionComponent, useEffect, useState } from 'react';
import { ServersContext } from '../../controllers/ServersContext';
import { withServersContext } from '../../containers/withServersContext';
import { Server, ServerCreateRequest, ServerStatus } from '../../types/server';
import { Loader } from '../elements/Loader';
import { Button, FormControl, InputLabel, MenuItem, Modal, Select, SelectChangeEvent, TextField } from '@mui/material';
import { toast } from 'react-toastify';
import { AuthContext } from '../../controllers/AuthContext';
import { withAuthContext } from '../../containers/withAuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { AppRoute } from '../../constants/routes';
import { buildRoute } from '../../utils/route';

type Props = ServersContext & AuthContext;

const MineCraftVersions = [
    '1.19',
    '1.19.1',
    '1.19.2',
    '1.19.3',
    '1.19.4',
    '1.20',
    '1.20.1',
    '1.20.2',
    '1.20.3',
    '1.20.4',
    '1.20.5',
    '1.21',
    '1.21.1',
    '1.21.2',
    '1.21.3',
    '1.21.4',
    '1.21.5',
    '1.21.6',
]

const MemoryOptions = [
    '1G',
    '2G',
    '3G',
    '4G',
];

const DashboardScreenComponent: FunctionComponent<Props> = (props: Props) => {
    const { getAll, user, createServer } = props;

    const navigate = useNavigate();

    const [servers, setServers] = useState<Server[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [modalShow, setModalShow] = useState<boolean>(false);
    const [newServer, setNewServer] = useState<ServerCreateRequest>({
        memory: MemoryOptions[0],
        username: '',
        version: MineCraftVersions[0],
    });

    useEffect(() => {
        fetchServers();
    }, []);

    const fetchServers = async () => {
        const serversList = await getAll();

        setIsLoading(false);
        setServers(serversList);
    }

    const renderServerStatus = (status: ServerStatus) => (
        <div className={`index-screen__servers__server__status index-screen__servers__server__status--${status}`}></div>
    );

    const onNewServerNameChange = ({ currentTarget: { value } }: ChangeEvent<HTMLInputElement>) => {
        setNewServer((prev) => ({ ...prev, username: value }));
    };

    const mineCraftVersionChange = ({ target: { value } }: SelectChangeEvent) => {
        setNewServer((prev) => ({ ...prev, version: value }));
    }

    const mineCraftMemoryChange = ({ target: { value } }: SelectChangeEvent) => {
        setNewServer((prev) => ({ ...prev, memory: value }));
    }

    const renderServer = (server: Server) => {
        return (
            <Link to={buildRoute(AppRoute.SERVER, { name: server.name })} key={`${server.name}-${server.port}`} className="index-screen__servers__server">
                <>
                    <div className="index-screen__servers__server__details">
                        <strong>Server: {server.name}</strong>
                        <p>Version {server.version}</p>
                    </div>
                    {renderServerStatus(server.status)}
                </>
            </Link>
        );
    };

    const onShowModalClick = () => setModalShow(true);

    const onSeverServerClick = async () => {
        if (!user) {
            toast.error("You need to be authenticated to create a Server")
            return;
        }

        setIsLoading(true);

        const serverCreated = await createServer(newServer);

        setIsLoading(false);

        if (!serverCreated) {
            toast.error("Error while creating the server")
            return;
        }

        navigate(buildRoute(AppRoute.SERVER, { name: serverCreated.name }));
    };

    const newServerButton = () => {
        return (
            <Button
                variant='contained'
                onClick={onShowModalClick}
            >
                Start a new Server
            </Button>
        )
    }

    const renderServers = () => {        
        if (servers.length === 0) return (
            <div className='index-screen__no-servers'>
                {newServerButton()}
            </div>
        );

        return (
            <>
                <div className='index-screen__new-server'>
                    {newServerButton()}
                </div>
                <div className="index-screen__servers">
                    {servers.map(renderServer)}
                </div>
            </>
        )
    };

    return (
        <section className="index-screen">
            {isLoading && <Loader />}
            {!isLoading && renderServers()}
            <Modal
                className='dialog'
                onClose={() => setModalShow(false)}
                open={modalShow}
            >
                <div className="create-server__form">
                    <TextField
                        fullWidth
                        label="Server Name"
                        value={newServer.username}
                        onChange={onNewServerNameChange}
                    />

                    <FormControl fullWidth>
                        <InputLabel>Version</InputLabel>
                        <Select
                            MenuProps={{
                                disablePortal: true,
                                PaperProps: {
                                    style: {
                                        maxHeight: 200, // sets scrollable height
                                        zIndex: 1302,   // keeps it above modal
                                    }
                                }
                            }}
                            value={newServer.version}
                            label="Version"
                            onChange={mineCraftVersionChange}
                        >
                            {MineCraftVersions.map(value => (
                                <MenuItem key={value} value={value}>{value}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel>Memory</InputLabel>
                        <Select
                            MenuProps={{
                                disablePortal: true,
                                PaperProps: {
                                    style: {
                                        maxHeight: 200, // sets scrollable height
                                        zIndex: 1302,   // keeps it above modal
                                    }
                                }
                            }}
                            value={newServer.memory}
                            label="Memory"
                            onChange={mineCraftMemoryChange}
                        >
                            {MemoryOptions.map(value => (
                                <MenuItem key={value} value={value}>{value}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Button
                        variant='contained'
                        onClick={onSeverServerClick}
                    >
                        Create Server
                    </Button>
                </div>
            </Modal>
        </section>
    );
};

export const DashboardScreen = withServersContext(withAuthContext(DashboardScreenComponent));
