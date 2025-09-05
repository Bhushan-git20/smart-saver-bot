import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // Common
      "common.loading": "Loading...",
      "common.save": "Save",
      "common.cancel": "Cancel",
      "common.delete": "Delete",
      "common.edit": "Edit",
      "common.add": "Add",
      "common.submit": "Submit",
      "common.success": "Success",
      "common.error": "Error",
      
      // Navigation
      "nav.expenses": "Expenses",
      "nav.recurring": "Recurring",
      "nav.budget": "Budget", 
      "nav.chat": "AI Assistant",
      "nav.investments": "Investments",
      "nav.payments": "Payments",
      "nav.gamification": "Achievements",
      
      // Expense Tracker
      "expense.title": "Expense Tracker",
      "expense.addTransaction": "Add Transaction",
      "expense.totalIncome": "Total Income",
      "expense.totalExpenses": "Total Expenses",
      "expense.netBalance": "Net Balance",
      "expense.amount": "Amount",
      "expense.category": "Category",
      "expense.description": "Description",
      "expense.date": "Date",
      "expense.type": "Type",
      "expense.income": "Income",
      "expense.expense": "Expense",
      
      // Gamification
      "game.streakTitle": "Savings Streak",
      "game.streakDays": "{{count}} days in a row!",
      "game.badges": "Achievements",
      "game.badgeUnlocked": "Badge Unlocked!",
      "game.budgetMaster": "Budget Master",
      "game.budgetMasterDesc": "Stayed under budget for 3 months",
      "game.investor": "Smart Investor",
      "game.investorDesc": "Started tracking investments",
      "game.saveHero": "Save Hero",
      "game.saveHeroDesc": "Saved money for 7 days straight",
      
      // OCR
      "ocr.title": "Receipt Scanner",
      "ocr.uploadReceipt": "Upload Receipt Photo",
      "ocr.processing": "Processing receipt...",
      "ocr.extractedData": "Extracted Data",
      "ocr.verify": "Verify & Add Transaction",
      
      // Settings
      "settings.language": "Language",
      "settings.theme": "Theme",
      "settings.notifications": "Notifications",
      "settings.dataExport": "Export Data",
      "settings.dataImport": "Import Data",
    }
  },
  hi: {
    translation: {
      // Common
      "common.loading": "लोड हो रहा है...",
      "common.save": "सेव करें",
      "common.cancel": "रद्द करें",
      "common.delete": "हटाएं",
      "common.edit": "संपादित करें",
      "common.add": "जोड़ें",
      "common.submit": "जमा करें",
      "common.success": "सफल",
      "common.error": "त्रुटि",
      
      // Navigation
      "nav.expenses": "खर्चे",
      "nav.recurring": "नियमित",
      "nav.budget": "बजट",
      "nav.chat": "AI सहायक",
      "nav.investments": "निवेश",
      "nav.payments": "भुगतान",
      "nav.gamification": "उपलब्धियां",
      
      // Expense Tracker
      "expense.title": "खर्च ट्रैकर",
      "expense.addTransaction": "लेनदेन जोड़ें",
      "expense.totalIncome": "कुल आय",
      "expense.totalExpenses": "कुल खर्च",
      "expense.netBalance": "शुद्ध बैलेंस",
      "expense.amount": "राशि",
      "expense.category": "श्रेणी",
      "expense.description": "विवरण",
      "expense.date": "तारीख",
      "expense.type": "प्रकार",
      "expense.income": "आय",
      "expense.expense": "खर्च",
      
      // Gamification
      "game.streakTitle": "बचत की लकीर",
      "game.streakDays": "{{count}} दिन लगातार!",
      "game.badges": "उपलब्धियां",
      "game.badgeUnlocked": "बैज अनलॉक हुआ!",
      "game.budgetMaster": "बजट मास्टर",
      "game.budgetMasterDesc": "3 महीने तक बजट के अंतर्गत रहे",
      "game.investor": "स्मार्ट निवेशक",
      "game.investorDesc": "निवेश ट्रैकिंग शुरू की",
      "game.saveHero": "सेव हीरो",
      "game.saveHeroDesc": "7 दिन लगातार पैसे बचाए",
      
      // OCR
      "ocr.title": "रसीद स्कैनर",
      "ocr.uploadReceipt": "रसीद की फोटो अपलोड करें",
      "ocr.processing": "रसीद प्रोसेस हो रही है...",
      "ocr.extractedData": "निकाला गया डेटा",
      "ocr.verify": "सत्यापित करें और लेनदेन जोड़ें",
      
      // Settings
      "settings.language": "भाषा",
      "settings.theme": "थीम",
      "settings.notifications": "सूचनाएं",
      "settings.dataExport": "डेटा एक्सपोर्ट करें",
      "settings.dataImport": "डेटा इम्पोर्ट करें",
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Default language
    fallbackLng: 'en',
    debug: false,
    
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    }
  });

export default i18n;