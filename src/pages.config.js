import Home from './pages/Home';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Subscription from './pages/Subscription';
import Onboarding from './pages/Onboarding';
import ShoppingList from './pages/ShoppingList';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Settings": Settings,
    "Profile": Profile,
    "Subscription": Subscription,
    "Onboarding": Onboarding,
    "ShoppingList": ShoppingList,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};