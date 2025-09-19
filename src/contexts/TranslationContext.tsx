import React, { createContext, useContext, ReactNode } from 'react';
import { useSettings } from './SettingsContext';

interface Translations {
  [key: string]: {
    en: string;
    ar: string;
  };
}

const translations: Translations = {
  // Navigation & General
  'nav.dashboard': { en: 'Dashboard', ar: 'لوحة التحكم' },
  'nav.orders': { en: 'Orders', ar: 'الطلبات' },
  'nav.menu': { en: 'Menu', ar: 'القائمة' },
  'nav.tables': { en: 'Tables', ar: 'الطاولات' },
  'nav.employees': { en: 'Employees', ar: 'الموظفين' },
  'nav.analytics': { en: 'Analytics', ar: 'التحليلات' },
  'nav.settings': { en: 'Settings', ar: 'الإعدادات' },
  
  // Menu Page
  'menu.title': { en: 'Menu', ar: 'القائمة' },
  'menu.categories': { en: 'Menu Categories', ar: 'فئات القائمة' },
  'menu.selectCategory': { en: 'Select a category to browse items', ar: 'اختر فئة لتصفح العناصر' },
  'menu.allItems': { en: 'All Items', ar: 'جميع العناصر' },
  'menu.backToCategories': { en: 'Back to Categories', ar: 'العودة للفئات' },
  'menu.searchInCategory': { en: 'Search items in this category...', ar: 'ابحث عن العناصر في هذه الفئة...' },
  'menu.addToOrder': { en: 'Add to Order', ar: 'أضف للطلب' },
  'menu.markAvailable': { en: 'Mark Available', ar: 'متوفر' },
  'menu.markSoldOut': { en: 'Mark Sold Out', ar: 'نفد المخزون' },
  'menu.available': { en: 'Available', ar: 'متوفر' },
  'menu.unavailable': { en: 'Unavailable', ar: 'غير متوفر' },
  'menu.soldOut': { en: 'Sold Out', ar: 'نفد المخزون' },
  'menu.noItemsFound': { en: 'No items found in this category.', ar: 'لا توجد عناصر في هذه الفئة.' },
  'menu.itemsAvailable': { en: 'items available', ar: 'عنصر متوفر' },
  'menu.items': { en: 'items', ar: 'عنصر' },
  
  // Categories
  'category.burgers': { en: 'Burgers', ar: 'البرغر' },
  'category.pizza': { en: 'Pizza', ar: 'البيتزا' },
  'category.salads': { en: 'Salads', ar: 'السلطات' },
  'category.mains': { en: 'Main Courses', ar: 'الأطباق الرئيسية' },
  
  // Settings
  'settings.title': { en: 'Settings', ar: 'الإعدادات' },
  'settings.configure': { en: 'Configure your POS system', ar: 'قم بتكوين نظام نقاط البيع الخاص بك' },
  'settings.general': { en: 'General Settings', ar: 'الإعدادات العامة' },
  'settings.interface': { en: 'Interface Settings', ar: 'إعدادات الواجهة' },
  'settings.menuDesign': { en: 'Menu Design', ar: 'تصميم القائمة' },
  'settings.language': { en: 'Language', ar: 'اللغة' },
  'settings.modernDesign': { en: 'Modern Design', ar: 'التصميم العصري' },
  'settings.simpleDesign': { en: 'Simple Design', ar: 'التصميم البسيط' },
  'settings.modernDesc': { en: 'Category-first navigation with modern card layout', ar: 'تنقل يركز على الفئات مع تخطيط بطاقات عصري' },
  'settings.simpleDesc': { en: 'Split-screen design with categories at bottom', ar: 'تصميم شاشة منقسمة مع الفئات في الأسفل' },
  'settings.englishDesc': { en: 'English - Left to right interface', ar: 'الإنجليزية - واجهة من اليسار إلى اليمين' },
  'settings.arabicDesc': { en: 'Arabic - Right to left interface', ar: 'العربية - واجهة من اليمين إلى اليسار' },
  'settings.saveAll': { en: 'Save All Settings', ar: 'حفظ جميع الإعدادات' },
  
  // Order Management
  'order.editOrder': { en: 'Edit Order', ar: 'تعديل الطلب' },
  'order.takingOrderFor': { en: 'Taking order for', ar: 'تسجيل طلب لـ' },
  'order.editingExisting': { en: 'Editing existing order - modify items and details', ar: 'تعديل طلب موجود - تعديل العناصر والتفاصيل' },
  'order.cancelEdit': { en: 'Cancel Edit', ar: 'إلغاء التعديل' },
  'order.saveChanges': { en: 'Save Changes', ar: 'حفظ التغييرات' },
  'order.endCall': { en: 'End Call', ar: 'إنهاء المكالمة' },
  
  // Common
  'common.search': { en: 'Search', ar: 'بحث' },
  'common.save': { en: 'Save', ar: 'حفظ' },
  'common.cancel': { en: 'Cancel', ar: 'إلغاء' },
  'common.edit': { en: 'Edit', ar: 'تعديل' },
  'common.delete': { en: 'Delete', ar: 'حذف' },
  'common.add': { en: 'Add', ar: 'إضافة' },
};

interface TranslationContextType {
  t: (key: string) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { language } = useSettings();
  
  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation[language] || translation.en;
  };

  return (
    <TranslationContext.Provider value={{ t }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};