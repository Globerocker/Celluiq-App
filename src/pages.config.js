import Home from './pages/Home';
import Settings from './pages/Settings';
import Subscription from './pages/Subscription';
import Onboarding from './pages/Onboarding';
import ShoppingList from './pages/ShoppingList';
import Notifications from './pages/Notifications';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Settings": Settings,
    "Subscription": Subscription,
    "Onboarding": Onboarding,
    "ShoppingList": ShoppingList,
    "Notifications": Notifications,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};