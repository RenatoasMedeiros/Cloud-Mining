import { Login, AppRegistration, Home, Logout } from '@mui/icons-material';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { FunctionComponent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRoute } from '../../constants/routes';
import { AuthContext } from '../../controllers/AuthContext';
import { withAuthContext } from '../../containers/withAuthContext';

type Props = AuthContext;

export const SidebarComponent: FunctionComponent<Props> = (props) => {
    const { user, logout } = props;

    const [isAuthenticated, setIsAuthenticated] = useState(!!user);

    useEffect(() => {
        setIsAuthenticated(!!user);
    }, [user]);

    const navigate = useNavigate();

    const handleNavigation = (route: AppRoute) => {
        navigate(route);
    }

    const requestLogout = () => {
        navigate(AppRoute.INDEX);
        logout();
    }

    return (
        <section className="side-bar">
            <List>
                {isAuthenticated && (
                    <>
                        <ListItem disablePadding>
                            <ListItemButton
                                onClick={() => handleNavigation(AppRoute.INDEX)}
                            >
                                <ListItemIcon><Home /></ListItemIcon>
                                <ListItemText primary="All" />
                            </ListItemButton>
                        </ListItem>
                    </>
                )}
                {!isAuthenticated && (
                    <>
                        <ListItem disablePadding>
                            <ListItemButton
                                onClick={() => handleNavigation(AppRoute.REGISTER)}
                            >
                                <ListItemIcon><AppRegistration /></ListItemIcon>
                                <ListItemText primary="Register" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton
                                onClick={() => handleNavigation(AppRoute.LOGIN)}
                            >
                                <ListItemIcon><Login /></ListItemIcon>
                                <ListItemText primary="Login" />
                            </ListItemButton>
                        </ListItem>
                    </>
                )}
            </List>
            {isAuthenticated && (
                <List>
                    <ListItem disablePadding>
                        <ListItemButton
                            onClick={requestLogout}
                        >
                            <ListItemIcon><Logout /></ListItemIcon>
                            <ListItemText primary="Logout" />
                        </ListItemButton>
                    </ListItem>
                </List>
            )}
        </section>
    );
};

export const Sidebar = withAuthContext(SidebarComponent);
