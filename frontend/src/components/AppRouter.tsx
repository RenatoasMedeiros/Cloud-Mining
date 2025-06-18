import { FunctionComponent, useEffect, useState } from 'react'
import { RegisterScreen } from './screens/RegisterScreen';
import { Sidebar } from './elements/Sidebar';
import { LoginScreen } from './screens/LoginScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { ServerScreen } from './screens/ServerScreen';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppRoute } from '../constants/routes';
import { Topbar } from './elements/Topbar';
import { ToastContainer } from 'react-toastify';
import { withAuthContext } from '../containers/withAuthContext';
import { AuthContext } from '../controllers/AuthContext';

export const AppRouterComponent: FunctionComponent<AuthContext> = (props) => {
    const { user } = props;

    const [isAuthenticated, setIsAuthenticated] = useState(!!user);
    
    useEffect(() => {
        setIsAuthenticated(!!user);
    }, [user]);

    const renderRoutes = () => {
        if (isAuthenticated) {
            return (
                <>
                    <Route path={AppRoute.LOGIN} element={<LoginScreen />} />
                    <Route path={AppRoute.SERVER} element={<ServerScreen />} />
                    <Route path={AppRoute.INDEX} element={<DashboardScreen />} />
                </>
            )
        }

        return (
            <>
                <Route path={AppRoute.REGISTER} element={<RegisterScreen />} />
                {[AppRoute.LOGIN, '*'].map((path) => <Route path={path} key={path} element={<LoginScreen />} />)}
            </>
        );
    };

    return (
        <BrowserRouter>
            <ToastContainer />
            <div className='app-router'>
                <Sidebar />
                <div className='screen'>
                    <Topbar />
                    <Routes>
                        {renderRoutes()}
                    </Routes>
                </div>
            </div>
        </BrowserRouter>
    )
};

export const AppRouter = withAuthContext(AppRouterComponent); 