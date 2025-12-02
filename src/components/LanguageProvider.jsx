import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    // Navigation
    settings: "Settings",
    profile: "Profile",
    home: "Home",
    backToHome: "Back to Home",
    
    // Home Page
    yourCelluiqScore: "YOUR CELLUIQ SCORE",
    outstandingProgress: "Outstanding progress this week. Your biomarkers are trending toward optimal ranges.",
    uploadFirstBlood: "Upload your first blood test to get started",
    markers: "Markers",
    stack: "Stack",
    nutrition: "Nutrition",
    routine: "Routine",
    
    // Blood Markers
    uploadResults: "Upload Results",
    optimal: "Optimal",
    suboptimal: "Suboptimal",
    needAttention: "Need Attention",
    optimalRange: "Optimal range",
    addManually: "Add manually",
    showAll: "Show all",
    noMarkersFound: "No markers found",
    newTestRecommended: "New blood test recommended",
    lastTestDaysAgo: "Your last test was {days} days ago. We recommend a check every 3 months.",
    uploadNewResult: "Upload new result",
    orderTest: "Order test",
    welcomeToCelluiq: "Welcome to CELLUIQ",
    uploadFirstBloodDesc: "Upload your first blood test and receive personalized health recommendations",
    uploadBloodTest: "Upload blood test",
    pdfPngJpg: "PDF, PNG or JPG",
    orderBloodTest: "Order blood test",
    completePanel: "Complete panel from €89",
    attention: "Attention",
    showing: "Showing",
    optimalMarkers: "optimal markers",
    suboptimalMarkers: "suboptimal markers",
    criticalMarkers: "critical markers",
    
    // Supplement Stack
    basedOnBloodwork: "Based on your blood work",
    markersNeedAttention: "markers need attention",
    checkDosage: "Check dosage",
    orderBundle: "Order Personalized Bundle",
    comingSoon: "AM/PM Stack Coming Soon",
    comingSoonDesc: "30-day supplement packs, personalized and delivered",
    morningStack: "Morning Stack",
    takeWithBreakfast: "Take with breakfast",
    eveningStack: "Evening Stack",
    takeBeforeBed: "Take before bed",
    noSupplementsYet: "No supplements added yet",
    noRecommendationsYet: "No recommendations yet",
    uploadForSupplements: "Upload your blood test to receive personalized supplement recommendations.",
    
    // Nutrition
    basedOnBiomarkers: "Based on latest biomarkers",
    personalizedForYou: "Personalized for you",
    markersNeedingAttention: "markers need attention",
    generateShoppingList: "Generate Shopping List",
    noRecommendationsNutrition: "No recommendations yet",
    uploadForNutrition: "Upload your blood test to receive personalized nutrition recommendations.",
    nutritionRecommendations: "Nutrition Recommendations",
    databaseBeingBuilt: "Based on your suboptimal markers, we can give you personalized nutrition recommendations. The database is currently being built.",
    
    // Food Categories
    proteinCat: "Protein",
    vegetablesCat: "Vegetables",
    fruitsCat: "Fruits",
    grainsCat: "Grains",
    dairyCat: "Dairy",
    fatsCat: "Healthy Fats",
    nutsSeeds: "Nuts & Seeds",
    legumesCat: "Legumes",
    seafoodCat: "Seafood",
    herbsSpices: "Herbs & Spices",
    beveragesCat: "Beverages",
    otherCat: "Other",
    
    // Routine
    yourDailyRoutine: "Your Daily Routine",
    routineDescription: "Personalized habits to optimize your biomarkers",
    morningRoutine: "Morning Routine",
    eveningRoutine: "Evening Routine",
    exerciseRoutine: "Exercise",
    completed: "completed",
    coldShower: "Cold Shower",
    coldShowerDesc: "2-3 minutes cold water to boost cortisol and immune system",
    morningSunlight: "Morning Sunlight",
    morningSunlightDesc: "Get natural light exposure within 30 min of waking",
    breathingExercise: "Breathing Exercise",
    breathingExerciseDesc: "Box breathing or Wim Hof method for stress reduction",
    noScreens: "No Screens",
    noScreensDesc: "Avoid blue light 1 hour before sleep for better melatonin",
    meditation: "Meditation",
    meditationDesc: "Mindfulness practice to reduce cortisol and stress",
    dailyWalk: "Daily Walk",
    dailyWalkDesc: "Low-intensity movement for cardiovascular health",
    strengthTraining: "Strength Training",
    strengthTrainingDesc: "Resistance training to boost testosterone and metabolism",
    hiitTraining: "HIIT Training",
    hiitTrainingDesc: "High-intensity intervals for HGH and metabolic boost",
    magnesiumRoutine: "Magnesium Routine",
    magnesiumRoutineDesc: "Take magnesium 30 min before sleep for better rest",
    intermittentFasting: "Intermittent Fasting",
    intermittentFastingDesc: "16:8 fasting window for autophagy and energy",
    optimize: "Optimize",
    reduce: "Reduce",
    daily: "Daily",
    personalizedRoutine: "Personalized for You",
    personalizedRoutineDesc: "This routine is based on your profile, goals, and blood markers.",
    
    // Settings
    subscription: "Subscription",
    manageSubscription: "Manage Subscription",
    manageSubscriptionDesc: "Manage your supplement subscription plan",
    connectedDevices: "Connected Devices",
    syncFitnessData: "Sync your fitness data for personalized recommendations",
    preferences: "Preferences",
    language: "Language",
    darkMode: "Dark Mode",
    enabled: "Enabled",
    disabled: "Disabled",
    notifications: "Notifications",
    getHealthReminders: "Get health reminders",
    privacySecurity: "Privacy & Security",
    manageYourData: "Manage your data",
    logout: "Logout",
    editProfile: "Edit profile",
    aboutYou: "About You",
    gender: "Gender",
    male: "Male",
    female: "Female",
    ageRange: "Age Range",
    activityLevel: "Activity Level",
    dietLabel: "Diet",
    goal: "Goal",
    unlockWithPro: "Unlock with Pro",
    upgradeToPro: "Upgrade to Pro",
    allFeaturesFor: "All features for €9/month",
    lastBloodTests: "Recent Blood Tests",
    tests: "Tests",
    score: "Score",
    marker: "Marker",
    save: "Save",
    cancel: "Cancel",
    saving: "Saving...",
    select: "Select",
    name: "Name",
    
    // Activity Levels
    sedentary: "Sedentary",
    lightActive: "Lightly active",
    moderateActive: "Moderately active",
    veryActive: "Very active",
    athlete: "Athlete",
    
    // Diet Options
    omnivore: "Omnivore",
    vegetarian: "Vegetarian",
    vegan: "Vegan",
    keto: "Keto",
    paleo: "Paleo",
    
    // Goals
    peakPerformance: "Peak Performance",
    longevity: "Longevity & Anti-Aging",
    moreEnergy: "More Energy",
    weightManagement: "Weight Management",
    betterSleep: "Better Sleep",
    mentalClarity: "Mental Clarity",
    muscleGain: "Muscle Gain",
    fasterRecovery: "Faster Recovery",
    
    // Pro Modal
    upgradeToProTitle: "Upgrade to Pro",
    unlockFeatures: "Unlock all premium features and take control of your health",
    startProTrial: "Start Pro Trial",
    cancelAnytime: "Cancel anytime. 7-day free trial.",
    proFeature1: "Evening supplement recommendations",
    proFeature2: "Personalized nutrition plan",
    proFeature3: "Health device integrations",
    proFeature4: "Priority support",
    proFeature5: "Advanced biomarker insights",
    
    // Blood Marker Detail
    yourStatus: "Your Status",
    celluiqOptimal: "CELLUIQ Optimal",
    clinicalRange: "Clinical Range",
    possibleSymptoms: "Possible Symptoms",
    supplementRecommendation: "Supplement Recommendation",
    form: "Form",
    nutritionRecommendation: "Nutrition Recommendation",
    lifestyleChanges: "Lifestyle Changes",
    warnings: "Warnings",
    studiesAndSources: "Studies & Sources",
    medicalDisclaimer: "This information does not replace medical advice. Always discuss changes with your doctor.",
    asOf: "As of",
    
    // Supplement Modal
    recommendedDosage: "Recommended Dosage",
    determineIndividually: "Determine individually",
    recommendedForm: "Recommended form",
    howItWorks: "How it Works",
    intakeTime: "Intake Time",
    eveningBeforeSleep: "Evening before sleep",
    morningWithFattyMeal: "Morning with fatty meal",
    onEmptyOrWithVitC: "On empty stomach or with Vitamin C",
    withFattyMeal: "With fatty meal",
    withAMeal: "Take with a meal",
    notes: "Notes",
    whyThisSupplement: "Why this supplement?",
    basedOnYourLevel: "Based on your",
    canHelpOptimize: "level, this supplement can help optimize your values.",
    low: "low",
    elevated: "elevated",
    
    // Food Modal
    healthBenefits: "Health Benefits",
    influencedBiomarkers: "Influenced Biomarkers",
    dailyAmount: "Daily Amount",
    weeklyAmount: "Weekly Amount",
    bestIntakeTime: "Best Intake Time",
    optimalCombinations: "Optimal Combinations",
    morning: "Morning",
    afternoon: "Afternoon",
    evening: "Evening",
    anytime: "Anytime",
    withMeal: "With a meal",
    beforeWorkout: "Before workout",
    afterWorkout: "After workout",
    
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
    quietHours: "Quiet Hours",
    quietHoursDesc: "No notifications during this time",
    from: "From",
    to: "To",
    manageNotifications: "Manage your notifications",
  },
  de: {
    // Navigation
    settings: "Einstellungen",
    profile: "Profil",
    home: "Startseite",
    backToHome: "Zurück zur Startseite",
    
    // Home Page
    yourCelluiqScore: "DEIN CELLUIQ SCORE",
    outstandingProgress: "Hervorragender Fortschritt diese Woche. Deine Biomarker tendieren zu optimalen Bereichen.",
    uploadFirstBlood: "Lade dein erstes Blutbild hoch um zu starten",
    markers: "Marker",
    stack: "Stack",
    nutrition: "Ernährung",
    routine: "Routine",
    
    // Blood Markers
    uploadResults: "Ergebnisse hochladen",
    optimal: "Optimal",
    suboptimal: "Suboptimal",
    needAttention: "Achtung",
    optimalRange: "Optimaler Bereich",
    addManually: "Manuell hinzufügen",
    showAll: "Alle anzeigen",
    noMarkersFound: "Keine Marker gefunden",
    newTestRecommended: "Neuer Bluttest empfohlen",
    lastTestDaysAgo: "Dein letzter Test war vor {days} Tagen. Für optimale Ergebnisse empfehlen wir alle 3 Monate einen Check.",
    uploadNewResult: "Neues Ergebnis hochladen",
    orderTest: "Test bestellen",
    welcomeToCelluiq: "Willkommen bei CELLUIQ",
    uploadFirstBloodDesc: "Lade dein erstes Blutbild hoch und erhalte personalisierte Gesundheitsempfehlungen",
    uploadBloodTest: "Blutbild hochladen",
    pdfPngJpg: "PDF, PNG oder JPG",
    orderBloodTest: "Bluttest bestellen",
    completePanel: "Komplettes Panel ab 89€",
    attention: "Achtung",
    showing: "Zeigt",
    optimalMarkers: "optimale Marker",
    suboptimalMarkers: "suboptimale Marker",
    criticalMarkers: "kritische Marker",
    
    // Supplement Stack
    basedOnBloodwork: "Basierend auf deinem Blutbild",
    markersNeedAttention: "Marker benötigen Aufmerksamkeit",
    checkDosage: "Dosierung prüfen",
    orderBundle: "Personalisiertes Bundle bestellen",
    comingSoon: "AM/PM Stack Coming Soon",
    comingSoonDesc: "30-Tage Supplement-Pakete, personalisiert und geliefert",
    morningStack: "Morning Stack",
    takeWithBreakfast: "Mit Frühstück einnehmen",
    eveningStack: "Evening Stack",
    takeBeforeBed: "Vor dem Schlafengehen",
    noSupplementsYet: "Noch keine Supplements hinzugefügt",
    noRecommendationsYet: "Noch keine Empfehlungen",
    uploadForSupplements: "Lade dein Blutbild hoch, um personalisierte Supplement-Empfehlungen zu erhalten.",
    
    // Nutrition
    basedOnBiomarkers: "Basierend auf neuesten Biomarkern",
    personalizedForYou: "Personalisiert für dich",
    markersNeedingAttention: "Marker brauchen Aufmerksamkeit",
    generateShoppingList: "Einkaufsliste generieren",
    noRecommendationsNutrition: "Noch keine Empfehlungen",
    uploadForNutrition: "Lade dein Blutbild hoch, um personalisierte Ernährungsempfehlungen zu erhalten.",
    nutritionRecommendations: "Ernährungsempfehlungen",
    databaseBeingBuilt: "Basierend auf deinen suboptimalen Markern können wir dir personalisierte Ernährungsempfehlungen geben. Die Datenbank wird gerade aufgebaut.",
    
    // Food Categories
    proteinCat: "Protein",
    vegetablesCat: "Gemüse",
    fruitsCat: "Obst",
    grainsCat: "Getreide",
    dairyCat: "Milchprodukte",
    fatsCat: "Gesunde Fette",
    nutsSeeds: "Nüsse & Samen",
    legumesCat: "Hülsenfrüchte",
    seafoodCat: "Meeresfrüchte",
    herbsSpices: "Kräuter & Gewürze",
    beveragesCat: "Getränke",
    otherCat: "Sonstige",
    
    // Routine
    yourDailyRoutine: "Deine Tägliche Routine",
    routineDescription: "Personalisierte Gewohnheiten zur Optimierung deiner Biomarker",
    morningRoutine: "Morgen-Routine",
    eveningRoutine: "Abend-Routine",
    exerciseRoutine: "Bewegung",
    completed: "erledigt",
    coldShower: "Kalte Dusche",
    coldShowerDesc: "2-3 Minuten kaltes Wasser für Cortisol und Immunsystem",
    morningSunlight: "Morgenlicht",
    morningSunlightDesc: "Natürliches Licht innerhalb von 30 Min nach dem Aufwachen",
    breathingExercise: "Atemübung",
    breathingExerciseDesc: "Box-Atmung oder Wim Hof Methode zur Stressreduktion",
    noScreens: "Keine Bildschirme",
    noScreensDesc: "Blaues Licht 1 Stunde vor dem Schlaf vermeiden",
    meditation: "Meditation",
    meditationDesc: "Achtsamkeitspraxis zur Reduktion von Cortisol und Stress",
    dailyWalk: "Täglicher Spaziergang",
    dailyWalkDesc: "Bewegung niedriger Intensität für Herzgesundheit",
    strengthTraining: "Krafttraining",
    strengthTrainingDesc: "Widerstandstraining für Testosteron und Stoffwechsel",
    hiitTraining: "HIIT Training",
    hiitTrainingDesc: "Hochintensive Intervalle für HGH und Metabolismus",
    magnesiumRoutine: "Magnesium-Routine",
    magnesiumRoutineDesc: "Magnesium 30 Min vor dem Schlaf für bessere Erholung",
    intermittentFasting: "Intervallfasten",
    intermittentFastingDesc: "16:8 Fastenfenster für Autophagie und Energie",
    optimize: "optimieren",
    reduce: "reduzieren",
    daily: "Täglich",
    personalizedRoutine: "Personalisiert für dich",
    personalizedRoutineDesc: "Diese Routine basiert auf deinem Profil, Zielen und Blutwerten.",
    
    // Settings
    subscription: "Abonnement",
    manageSubscription: "Abonnement verwalten",
    manageSubscriptionDesc: "Verwalte dein Supplement-Abonnement",
    connectedDevices: "Verbundene Geräte",
    syncFitnessData: "Synchronisiere Fitness-Daten für personalisierte Empfehlungen",
    preferences: "Einstellungen",
    language: "Sprache",
    darkMode: "Dunkler Modus",
    enabled: "Aktiviert",
    disabled: "Deaktiviert",
    notifications: "Benachrichtigungen",
    getHealthReminders: "Gesundheitserinnerungen erhalten",
    privacySecurity: "Datenschutz & Sicherheit",
    manageYourData: "Verwalte deine Daten",
    logout: "Abmelden",
    editProfile: "Profil bearbeiten",
    aboutYou: "Über dich",
    gender: "Geschlecht",
    male: "Männlich",
    female: "Weiblich",
    ageRange: "Altersgruppe",
    activityLevel: "Aktivitätslevel",
    dietLabel: "Ernährung",
    goal: "Ziel",
    unlockWithPro: "Mit Pro freischalten",
    upgradeToPro: "Upgrade auf Pro",
    allFeaturesFor: "Alle Features für 9€/Monat",
    lastBloodTests: "Letzte Bluttests",
    tests: "Tests",
    score: "Score",
    marker: "Marker",
    save: "Speichern",
    cancel: "Abbrechen",
    saving: "Speichern...",
    select: "Auswählen",
    name: "Name",
    
    // Activity Levels
    sedentary: "Wenig aktiv",
    lightActive: "Leicht aktiv",
    moderateActive: "Moderat aktiv",
    veryActive: "Sehr aktiv",
    athlete: "Athlet",
    
    // Diet Options
    omnivore: "Mischkost",
    vegetarian: "Vegetarisch",
    vegan: "Vegan",
    keto: "Keto",
    paleo: "Paleo",
    
    // Goals
    peakPerformance: "Peak Performance",
    longevity: "Longevity & Anti-Aging",
    moreEnergy: "Mehr Energie",
    weightManagement: "Gewichtsmanagement",
    betterSleep: "Besserer Schlaf",
    mentalClarity: "Mentale Klarheit",
    muscleGain: "Muskelaufbau",
    fasterRecovery: "Schnellere Regeneration",
    
    // Pro Modal
    upgradeToProTitle: "Upgrade auf Pro",
    unlockFeatures: "Schalte alle Premium-Features frei und übernimm die Kontrolle über deine Gesundheit",
    startProTrial: "Pro Testversion starten",
    cancelAnytime: "Jederzeit kündbar. 7 Tage kostenlos.",
    proFeature1: "Abend-Supplement-Empfehlungen",
    proFeature2: "Personalisierter Ernährungsplan",
    proFeature3: "Health-Geräte-Integrationen",
    proFeature4: "Prioritäts-Support",
    proFeature5: "Erweiterte Biomarker-Insights",
    
    // Blood Marker Detail
    yourStatus: "Dein Status",
    celluiqOptimal: "CELLUIQ Optimal",
    clinicalRange: "Klinischer Bereich",
    possibleSymptoms: "Mögliche Symptome",
    supplementRecommendation: "Supplement Empfehlung",
    form: "Form",
    nutritionRecommendation: "Ernährungsempfehlung",
    lifestyleChanges: "Lifestyle Änderungen",
    warnings: "Warnhinweise",
    studiesAndSources: "Studien & Quellen",
    medicalDisclaimer: "Diese Informationen ersetzen keine ärztliche Beratung. Besprich Änderungen immer mit deinem Arzt.",
    asOf: "Stand",
    
    // Supplement Modal
    recommendedDosage: "Empfohlene Dosierung",
    determineIndividually: "Individuell bestimmen",
    recommendedForm: "Empfohlene Form",
    howItWorks: "Wirkungsweise",
    intakeTime: "Einnahmezeitpunkt",
    eveningBeforeSleep: "Abends vor dem Schlafengehen",
    morningWithFattyMeal: "Morgens mit fetthaltiger Mahlzeit",
    onEmptyOrWithVitC: "Nüchtern oder mit Vitamin C",
    withFattyMeal: "Mit fetthaltiger Mahlzeit",
    withAMeal: "Mit einer Mahlzeit einnehmen",
    notes: "Hinweise",
    whyThisSupplement: "Warum dieses Supplement?",
    basedOnYourLevel: "Basierend auf deinem",
    canHelpOptimize: "Wert kann dieses Supplement helfen, deine Werte zu optimieren.",
    low: "niedrigen",
    elevated: "erhöhten",
    
    // Food Modal
    healthBenefits: "Gesundheitsvorteile",
    influencedBiomarkers: "Beeinflusste Biomarker",
    dailyAmount: "Tägliche Menge",
    weeklyAmount: "Wöchentliche Menge",
    bestIntakeTime: "Beste Einnahmezeit",
    optimalCombinations: "Optimale Kombinationen",
    morning: "Morgens",
    afternoon: "Nachmittags",
    evening: "Abends",
    anytime: "Jederzeit",
    withMeal: "Mit einer Mahlzeit",
    beforeWorkout: "Vor dem Training",
    afterWorkout: "Nach dem Training",
    
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
    quietHours: "Ruhezeiten",
    quietHoursDesc: "Keine Benachrichtigungen während dieser Zeit",
    from: "Von",
    to: "Bis",
    manageNotifications: "Verwalte deine Benachrichtigungen",
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageInternal] = useState(() => {
    return localStorage.getItem('language') || 'de';
  });

  const setLanguage = (lang) => {
    setLanguageInternal(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    window.dispatchEvent(new Event('languageChange'));
  };

  useEffect(() => {
    document.documentElement.lang = language;
    
    const handleLanguageChange = () => {
      const stored = localStorage.getItem('language');
      if (stored && stored !== language) {
        setLanguageInternal(stored);
      }
    };
    window.addEventListener('languageChange', handleLanguageChange);
    return () => window.removeEventListener('languageChange', handleLanguageChange);
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations.de[key] || key;
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