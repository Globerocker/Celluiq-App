import Home from './pages/Home';
import Settings from './pages/Settings';
import Subscription from './pages/Subscription';
import Onboarding from './pages/Onboarding';
import ShoppingList from './pages/ShoppingList';
import Notifications from './pages/Notifications';
import Splash from './pages/Splash';
import OnboardingComplete from './pages/OnboardingComplete';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Settings": Settings,
    "Subscription": Subscription,
    "Onboarding": Onboarding,
    "ShoppingList": ShoppingList,
    "Notifications": Notifications,
    "Splash": Splash,
    "OnboardingComplete": OnboardingComplete,
}

export const pagesConfig = {
    mainPage: "Onboarding",
    Pages: PAGES,
    Layout: __Layout,
};