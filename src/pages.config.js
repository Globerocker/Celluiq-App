import Dashboard from './pages/Dashboard';
import BloodMarkers from './pages/BloodMarkers';
import Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "BloodMarkers": BloodMarkers,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: Layout,
};