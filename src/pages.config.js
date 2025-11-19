import Dashboard from './pages/Dashboard';
import BloodMarkers from './pages/BloodMarkers';
import Home from './pages/Home';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Subscription from './pages/Subscription';
import app from './pages/_app';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "BloodMarkers": BloodMarkers,
    "Home": Home,
    "Settings": Settings,
    "Profile": Profile,
    "Subscription": Subscription,
    "_app": app,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};