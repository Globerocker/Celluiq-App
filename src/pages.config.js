import Dashboard from './pages/Dashboard';
import BloodMarkers from './pages/BloodMarkers';
import Home from './pages/Home';
import Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "BloodMarkers": BloodMarkers,
    "Home": Home,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: Layout,
};