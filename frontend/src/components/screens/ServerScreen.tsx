import { FunctionComponent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ContentCopy } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { AppRoute } from '../../constants/routes';
import { ServersContext } from '../../controllers/ServersContext';
import { Server, ServerStatus } from '../../types/server';
import { withServersContext } from '../../containers/withServersContext';
import { Loader } from '../elements/Loader';
import { Tooltip } from '@mui/material';

const ServerScreenComponent: FunctionComponent<ServersContext> = (props) => {
    const { getServer } = props;

    const { name } = useParams();
    const navigate = useNavigate();

    const [server, setServer] = useState<Server | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [toolTipText, setToolTipText] = useState<string>('Copy');

    if (!name) {
        toast.error("Server not found");
        navigate(AppRoute.INDEX);
        return;
    }

    useEffect(() => {
        fetchServer();
    }, []);

    const fetchServer = async () => {
        setLoading(true);

        const serverResult = await getServer(name);

        setLoading(false);

        if (!serverResult) {
            toast.error("Server not found");
            navigate(AppRoute.INDEX);
            return;
        }

        setServer(serverResult);
    }

    const copyToClipBoard = async (name: string) => {
        try {
            await navigator.clipboard.writeText(name);

            setToolTipText('Copied');

            setTimeout(() => setToolTipText('Copy'), 1000)
        } catch (error) {
        }
    }

    const renderServerStatus = (status: ServerStatus) => <div className={`server-screen__content__details__status server-screen__content__details__status--${status}`}></div>

    return (
        <section className="server-screen">
            {loading && <Loader />}
            {server && (
                <>
                    <div className='server-screen__header'>
                        <Tooltip title={toolTipText} placement="top">
                            <p onClick={() => copyToClipBoard(server.name)}>{server.name}</p>
                        </Tooltip>
                        <Tooltip title={toolTipText} placement="top">
                            <ContentCopy onClick={() => copyToClipBoard(server.name)} />
                        </Tooltip>
                    </div>
                    <div className='server-screen__content'>
                        <div className='server-screen__content__details'>
                            <p>Status:</p>
                            <span>{server.status}</span>
                            {renderServerStatus(server.status)}
                        </div>
                        <div className='server-screen__content__details'>
                            <p>Version:</p>
                            <span>{server.version}</span>
                        </div>
                        <div className='server-screen__content__details'>
                            <p>Port:</p>
                            <span>{server.port}</span>
                        </div>
                    </div>
                </>
            )}
        </section>
    );
};

export const ServerScreen = withServersContext(ServerScreenComponent);
