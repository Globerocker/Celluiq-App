import Dashboard from './pages/Dashboard';
import BloodMarkers from './pages/BloodMarkers';
import Home from './pages/Home';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Subscription from './pages/Subscription';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "BloodMarkers": BloodMarkers,
    "Home": Home,
    "Settings": Settings,
    "Profile": Profile,
    "Subscription": Subscription,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};