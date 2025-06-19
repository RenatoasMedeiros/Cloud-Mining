import { ChangeEvent, FunctionComponent, useEffect, useState } from 'react';
import { ServersContext } from '../../controllers/ServersContext';
import { withServersContext } from '../../containers/withServersContext';
import { Server, ServerCreateRequest, ServerStatus } from '../../types/server';
import { Loader } from '../elements/Loader';
import { Button, Modal, TextField } from '@mui/material';
import { toast } from 'react-toastify';
import { AuthContext } from '../../controllers/AuthContext';
import { withAuthContext } from '../../containers/withAuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { AppRoute } from '../../constants/routes';
import { buildRoute } from '../../utils/route';

type Props = ServersContext & AuthContext;

const DashboardScreenComponent: FunctionComponent<Props> = (props: Props) => {
    const { getAll, user, createServer } = props;

    const navigate = useNavigate();

    const [servers, setServers] = useState<Server[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [modalShow, setModalShow] = useState<boolean>(false);
    const [newServer, setNewServer] = useState<ServerCreateRequest>({ name: '' });

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
        setNewServer({ name: value });
    };

    const renderServer = (server: Server) => {
        return (
            <Link to={buildRoute(AppRoute.SERVER, { id: server.id })} key={server.id} className="index-screen__servers__server">
                <>
                    <div className="index-screen__servers__server__details">
                        <strong>Server: {server.name}</strong>
                        <p>{server.id}</p>
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

        navigate(buildRoute(AppRoute.SERVER, { id: serverCreated.id }));
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
                <div className='create-server'>
                    <div className='create-server__title'>
                        Create a new server
                    </div>
                    <div>
                        <TextField
                            label="Server name"
                            value={newServer.name}
                            onChange={onNewServerNameChange}
                        />
                    </div>
                    
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
