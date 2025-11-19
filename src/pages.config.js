import Dashboard from './pages/Dashboard';
import BloodMarkers from './pages/BloodMarkers';
import Home from './pages/Home';
import Settings from './pages/Settings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "BloodMarkers": BloodMarkers,
    "Home": Home,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};