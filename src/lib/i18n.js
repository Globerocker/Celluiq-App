import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    en: {
        translation: {
            "welcome": "Welcome",
            "upload_blood_work": "Upload Blood Work",
            "analyzing": "Analyzing your health...",
            "dashboard_title": "Your Health Overview",
            "cross_sell_title": "Unlock More Insights",
            "cross_sell_desc": "Get a comprehensive blood panel in Mexico City.",
            "book_now": "Book Appointment"
        }
    },
    de: {
        translation: {
            "welcome": "Willkommen",
            "upload_blood_work": "Blutbild hochladen",
            "analyzing": "Analysiere deine Gesundheit...",
            "dashboard_title": "Deine Gesundheitsübersicht",
            "cross_sell_title": "Mehr Erkenntnisse freischalten",
            "cross_sell_desc": "Buche jetzt ein umfassendes Blutbild in Mexico City.",
            "book_now": "Termin vereinbaren"
        }
    },
    es: {
        translation: {
            "welcome": "Bienvenido",
            "upload_blood_work": "Cargar análisis de sangre",
            "analyzing": "Analizando tu salud...",
            "dashboard_title": "Resumen de salud",
            "cross_sell_title": "Descubre más",
            "cross_sell_desc": "Obtén un panel sanguíneo completo en Ciudad de México.",
            "book_now": "Reservar cita"
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
