import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    // Navigation & Header
    settings: "Settings",
    profile: "Profile",
    home: "Home",
    
    // Home Page
    yourCelluiqScore: "YOUR CELLUIQ SCORE",
    outstandingProgress: "Outstanding progress this week. Your biomarkers are trending toward optimal ranges.",
    markers: "Markers",
    stack: "Stack",
    nutrition: "Nutrition",
    
    // Blood Markers
    bloodMarkers: "Blood Markers",
    latestResults: "Latest Results",
    uploadResults: "Upload Results",
    optimal: "Optimal",
    suboptimal: "Suboptimal",
    needAttention: "Need Attention",
    optimalRange: "Optimal range",
    
    // Nutrition Section
    weeklyTarget: "Weekly Target",
    protein: "PROTEIN",
    carbs: "CARBS",
    fats: "FATS",
    fiber: "FIBER",
    basedOnBiomarkers: "Based on latest biomarkers",
    showAffordable: "Show affordable alternatives",
    estimatedCost: "Estimated",
    weeklyAmount: "Weekly Amount",
    dailyRecommendation: "Daily Recommendation",
    addToShoppingList: "Add to Shopping List",
    
    // Supplement Stack
    supplementStack: "Supplement Stack",
    daySupply: "30-Day Supply",
    personalizedBlend: "Personalized Blend",
    dailyIntake: "Daily Intake",
    whatsIncluded: "What's included",
    recommendedAddons: "Recommended Add-ons",
    
    // Settings
    manageAccount: "Manage your account and preferences",
    subscription: "Subscription",
    manageSubscription: "Manage Subscription",
    manageSubscriptionDesc: "Manage your supplement subscription plan",
    connectedDevices: "Connected Devices",
    syncFitnessData: "Sync your fitness data for personalized recommendations",
    preferences: "Preferences",
    language: "Language",
    darkMode: "Dark Mode",
    currentlyEnabled: "Currently enabled",
    notifications: "Notifications",
    getHealthReminders: "Get health reminders",
    privacySecurity: "Privacy & Security",
    manageYourData: "Manage your data",
    logout: "Logout",
    
    // Profile
    healthJourney: "Your health journey overview",
    bloodTests: "Blood Tests",
    healthScore: "Health Score",
    daysActive: "Days Active",
    achievements: "Achievements",
    totalImprovement: "Total Improvement",
    daysTracked: "Days Tracked",
    recentActivity: "Recent Activity",
    about: "About",
    age: "Age",
    height: "Height",
    weight: "Weight",
    goal: "Goal",
    
    // Dashboard
    healthDashboard: "Health Dashboard",
    trackWellness: "Track your wellness journey in one place",
    overview: "Overview",
    vitalSigns: "Vital Signs",
    medications: "Medications",
    
    // Common
    backToHome: "Back to Home",
    backToSettings: "Back to Settings",
    viewProfile: "View Profile",
    save: "Save",
    
    // Notifications
    bloodTestReminder: "Blood Test Reminder",
    bloodTestReminderDesc: "Reminder every 3 months for new test",
    supplementReminder: "Supplement Reminder",
    supplementReminderDesc: "Daily intake reminder",
    weeklyReport: "Weekly Report",
    weeklyReportDesc: "Summary of your progress",
    newRecommendations: "New Recommendations",
    newRecommendationsDesc: "Notification for new tips",
    shoppingReminder: "Shopping Reminder",
    shoppingReminderDesc: "Weekly shopping list",
    eveningRoutine: "Evening Routine",
    eveningRoutineDesc: "Reminder for evening supplements",
    quietHours: "Quiet Hours",
    quietHoursDesc: "No notifications during this time",
    from: "From",
    to: "To",
    manageNotifications: "Manage your notifications",
  },
  de: {
    // Navigation & Header
    settings: "Einstellungen",
    profile: "Profil",
    home: "Startseite",
    
    // Home Page
    yourCelluiqScore: "IHR CELLUIQ SCORE",
    outstandingProgress: "Hervorragender Fortschritt diese Woche. Ihre Biomarker tendieren zu optimalen Bereichen.",
    markers: "Marker",
    stack: "Stack",
    nutrition: "Ernährung",
    
    // Blood Markers
    bloodMarkers: "Blutwerte",
    latestResults: "Neueste Ergebnisse",
    uploadResults: "Ergebnisse hochladen",
    optimal: "Optimal",
    suboptimal: "Suboptimal",
    needAttention: "Aufmerksamkeit erforderlich",
    optimalRange: "Optimaler Bereich",
    
    // Nutrition Section
    weeklyTarget: "Wochenziel",
    protein: "PROTEIN",
    carbs: "KOHLENHYDRATE",
    fats: "FETTE",
    fiber: "BALLASTSTOFFE",
    basedOnBiomarkers: "Basierend auf neuesten Biomarkern",
    showAffordable: "Günstige Alternativen anzeigen",
    estimatedCost: "Geschätzt",
    weeklyAmount: "Wochenmenge",
    dailyRecommendation: "Tägliche Empfehlung",
    addToShoppingList: "Zur Einkaufsliste hinzufügen",
    
    // Supplement Stack
    supplementStack: "Supplement Stack",
    daySupply: "30-Tage-Vorrat",
    personalizedBlend: "Personalisierte Mischung",
    dailyIntake: "Tägliche Einnahme",
    whatsIncluded: "Was enthalten ist",
    recommendedAddons: "Empfohlene Ergänzungen",
    
    // Settings
    manageAccount: "Verwalten Sie Ihr Konto und Ihre Einstellungen",
    subscription: "Abonnement",
    manageSubscription: "Abonnement verwalten",
    manageSubscriptionDesc: "Verwalten Sie Ihr Supplement-Abonnement",
    connectedDevices: "Verbundene Geräte",
    syncFitnessData: "Synchronisieren Sie Ihre Fitness-Daten für personalisierte Empfehlungen",
    preferences: "Einstellungen",
    language: "Sprache",
    darkMode: "Dunkler Modus",
    currentlyEnabled: "Derzeit aktiviert",
    notifications: "Benachrichtigungen",
    getHealthReminders: "Gesundheitserinnerungen erhalten",
    privacySecurity: "Datenschutz & Sicherheit",
    manageYourData: "Verwalten Sie Ihre Daten",
    logout: "Abmelden",
    
    // Profile
    healthJourney: "Ihr Gesundheitsweg im Überblick",
    bloodTests: "Bluttests",
    healthScore: "Gesundheitsscore",
    daysActive: "Aktive Tage",
    achievements: "Erfolge",
    totalImprovement: "Gesamtverbesserung",
    daysTracked: "Verfolgte Tage",
    recentActivity: "Letzte Aktivität",
    about: "Über",
    age: "Alter",
    height: "Größe",
    weight: "Gewicht",
    goal: "Ziel",
    
    // Dashboard
    healthDashboard: "Gesundheits-Dashboard",
    trackWellness: "Verfolgen Sie Ihre Wellness-Reise an einem Ort",
    overview: "Übersicht",
    vitalSigns: "Vitalzeichen",
    medications: "Medikamente",
    
    // Common
    backToHome: "Zurück zur Startseite",
    backToSettings: "Zurück zu Einstellungen",
    viewProfile: "Profil anzeigen",
    save: "Speichern",
    
    // Notifications
    bloodTestReminder: "Bluttest-Erinnerung",
    bloodTestReminderDesc: "Erinnerung alle 3 Monate für neuen Test",
    supplementReminder: "Supplement-Erinnerung",
    supplementReminderDesc: "Tägliche Einnahme-Erinnerung",
    weeklyReport: "Wöchentlicher Bericht",
    weeklyReportDesc: "Zusammenfassung deiner Fortschritte",
    newRecommendations: "Neue Empfehlungen",
    newRecommendationsDesc: "Benachrichtigung bei neuen Tipps",
    shoppingReminder: "Einkaufs-Erinnerung",
    shoppingReminderDesc: "Wöchentliche Einkaufsliste",
    eveningRoutine: "Abend-Routine",
    eveningRoutineDesc: "Erinnerung für Abend-Supplements",
    quietHours: "Ruhezeiten",
    quietHoursDesc: "Keine Benachrichtigungen während dieser Zeit",
    from: "Von",
    to: "Bis",
    manageNotifications: "Verwalte deine Benachrichtigungen",
  },
  es: {
    // Navigation & Header
    settings: "Configuración",
    profile: "Perfil",
    home: "Inicio",
    
    // Home Page
    yourCelluiqScore: "TU PUNTUACIÓN CELLUIQ",
    outstandingProgress: "Progreso excepcional esta semana. Tus biomarcadores tienden a rangos óptimos.",
    markers: "Marcadores",
    stack: "Stack",
    nutrition: "Nutrición",
    
    // Blood Markers
    bloodMarkers: "Marcadores Sanguíneos",
    latestResults: "Últimos Resultados",
    uploadResults: "Subir Resultados",
    optimal: "Óptimo",
    suboptimal: "Subóptimo",
    needAttention: "Necesita Atención",
    optimalRange: "Rango óptimo",
    
    // Nutrition Section
    weeklyTarget: "Objetivo Semanal",
    protein: "PROTEÍNA",
    carbs: "CARBOHIDRATOS",
    fats: "GRASAS",
    fiber: "FIBRA",
    basedOnBiomarkers: "Basado en últimos biomarcadores",
    showAffordable: "Mostrar alternativas asequibles",
    estimatedCost: "Estimado",
    weeklyAmount: "Cantidad Semanal",
    dailyRecommendation: "Recomendación Diaria",
    addToShoppingList: "Añadir a la Lista de Compras",
    
    // Supplement Stack
    supplementStack: "Stack de Suplementos",
    daySupply: "Suministro de 30 Días",
    personalizedBlend: "Mezcla Personalizada",
    dailyIntake: "Ingesta Diaria",
    whatsIncluded: "Qué incluye",
    recommendedAddons: "Complementos Recomendados",
    
    // Settings
    manageAccount: "Gestiona tu cuenta y preferencias",
    subscription: "Suscripción",
    manageSubscription: "Gestionar Suscripción",
    manageSubscriptionDesc: "Gestiona tu plan de suscripción de suplementos",
    connectedDevices: "Dispositivos Conectados",
    syncFitnessData: "Sincroniza tus datos de fitness para recomendaciones personalizadas",
    preferences: "Preferencias",
    language: "Idioma",
    darkMode: "Modo Oscuro",
    currentlyEnabled: "Actualmente habilitado",
    notifications: "Notificaciones",
    getHealthReminders: "Recibir recordatorios de salud",
    privacySecurity: "Privacidad y Seguridad",
    manageYourData: "Gestiona tus datos",
    logout: "Cerrar Sesión",
    
    // Profile
    healthJourney: "Tu viaje de salud en resumen",
    bloodTests: "Análisis de Sangre",
    healthScore: "Puntuación de Salud",
    daysActive: "Días Activos",
    achievements: "Logros",
    totalImprovement: "Mejora Total",
    daysTracked: "Días Registrados",
    recentActivity: "Actividad Reciente",
    about: "Acerca de",
    age: "Edad",
    height: "Altura",
    weight: "Peso",
    goal: "Objetivo",
    
    // Dashboard
    healthDashboard: "Panel de Salud",
    trackWellness: "Rastrea tu viaje de bienestar en un solo lugar",
    overview: "Resumen",
    vitalSigns: "Signos Vitales",
    medications: "Medicamentos",
    
    // Common
    backToHome: "Volver al Inicio",
    backToSettings: "Volver a Configuración",
    viewProfile: "Ver Perfil",
    save: "Guardar",
    
    // Notifications
    bloodTestReminder: "Recordatorio de Análisis",
    bloodTestReminderDesc: "Recordatorio cada 3 meses para nuevo análisis",
    supplementReminder: "Recordatorio de Suplementos",
    supplementReminderDesc: "Recordatorio diario de ingesta",
    weeklyReport: "Informe Semanal",
    weeklyReportDesc: "Resumen de tu progreso",
    newRecommendations: "Nuevas Recomendaciones",
    newRecommendationsDesc: "Notificación de nuevos consejos",
    shoppingReminder: "Recordatorio de Compras",
    shoppingReminderDesc: "Lista de compras semanal",
    eveningRoutine: "Rutina Nocturna",
    eveningRoutineDesc: "Recordatorio de suplementos nocturnos",
    quietHours: "Horas de Silencio",
    quietHoursDesc: "Sin notificaciones durante este tiempo",
    from: "Desde",
    to: "Hasta",
    manageNotifications: "Gestiona tus notificaciones",
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('language') || 'de';
  });

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};