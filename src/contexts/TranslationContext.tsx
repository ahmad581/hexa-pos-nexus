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
  'nav.callCenter': { en: 'Call Center', ar: 'مركز الاتصالات' },
  'nav.inventory': { en: 'Inventory', ar: 'المخزون' },
  'nav.members': { en: 'Members', ar: 'الأعضاء' },
  'nav.appointments': { en: 'Appointments', ar: 'المواعيد' },
  'nav.rooms': { en: 'Rooms', ar: 'الغرف' },
  'nav.services': { en: 'Services', ar: 'الخدمات' },
  'nav.products': { en: 'Products', ar: 'المنتجات' },
  'nav.prescriptions': { en: 'Prescriptions', ar: 'الوصفات الطبية' },
  'nav.stylists': { en: 'Stylists', ar: 'المصففين' },
  
  // Login & Auth
  'auth.login': { en: 'Login', ar: 'تسجيل الدخول' },
  'auth.logout': { en: 'Logout', ar: 'تسجيل الخروج' },
  'auth.username': { en: 'Username', ar: 'اسم المستخدم' },
  'auth.password': { en: 'Password', ar: 'كلمة المرور' },
  'auth.welcomeBack': { en: 'Welcome back to Hexa POS', ar: 'مرحباً بك في هيكسا POS' },
  'auth.signInToContinue': { en: 'Sign in to your account to continue', ar: 'سجل دخولك للمتابعة' },
  'auth.rememberMe': { en: 'Remember me', ar: 'تذكرني' },
  'auth.forgotPassword': { en: 'Forgot your password?', ar: 'نسيت كلمة المرور؟' },
  'auth.demoCredentials': { en: 'Demo Credentials', ar: 'بيانات تجريبية' },
  'auth.quickLogin': { en: 'Quick Login', ar: 'دخول سريع' },
  'auth.loginAsOwner': { en: 'Log in as an Owner', ar: 'دخول كمالك' },
  'auth.loginAsMaster': { en: 'Log in as a Master', ar: 'دخول كخبير' },
  
  // Dashboard
  'dashboard.title': { en: 'Dashboard', ar: 'لوحة التحكم' },
  'dashboard.overview': { en: 'Business Overview', ar: 'نظرة عامة على الأعمال' },
  'dashboard.totalRevenue': { en: 'Total Revenue', ar: 'إجمالي الإيرادات' },
  'dashboard.totalOrders': { en: 'Total Orders', ar: 'إجمالي الطلبات' },
  'dashboard.activeCustomers': { en: 'Active Customers', ar: 'العملاء النشطون' },
  'dashboard.avgOrderValue': { en: 'Average Order Value', ar: 'متوسط قيمة الطلب' },
  'dashboard.recentActivity': { en: 'Recent Activity', ar: 'النشاط الحديث' },
  'dashboard.popularItems': { en: 'Popular Items', ar: 'العناصر الشائعة' },
  'dashboard.todayStats': { en: "Today's Statistics", ar: 'إحصائيات اليوم' },
  'dashboard.salesChart': { en: 'Sales Chart', ar: 'مخطط المبيعات' },
  
  // Orders
  'orders.title': { en: 'Orders', ar: 'الطلبات' },
  'orders.newOrder': { en: 'New Order', ar: 'طلب جديد' },
  'orders.allOrders': { en: 'All Orders', ar: 'جميع الطلبات' },
  'orders.status': { en: 'Status', ar: 'الحالة' },
  'orders.customer': { en: 'Customer', ar: 'العميل' },
  'orders.total': { en: 'Total', ar: 'الإجمالي' },
  'orders.time': { en: 'Time', ar: 'الوقت' },
  'orders.type': { en: 'Type', ar: 'النوع' },
  'orders.table': { en: 'Table', ar: 'الطاولة' },
  'orders.pending': { en: 'Pending', ar: 'معلق' },
  'orders.preparing': { en: 'Preparing', ar: 'قيد التحضير' },
  'orders.ready': { en: 'Ready', ar: 'جاهز' },
  'orders.delivered': { en: 'Delivered', ar: 'تم التوصيل' },
  'orders.cancelled': { en: 'Cancelled', ar: 'ملغى' },
  'orders.dineIn': { en: 'Dine In', ar: 'تناول في المطعم' },
  'orders.takeout': { en: 'Takeout', ar: 'طلب خارجي' },
  'orders.delivery': { en: 'Delivery', ar: 'توصيل' },
  'orders.viewDetails': { en: 'View Details', ar: 'عرض التفاصيل' },
  'orders.editOrder': { en: 'Edit Order', ar: 'تعديل الطلب' },
  'orders.printReceipt': { en: 'Print Receipt', ar: 'طباعة الفاتورة' },
  
  // Tables
  'tables.title': { en: 'Tables', ar: 'الطاولات' },
  'tables.available': { en: 'Available', ar: 'متاحة' },
  'tables.occupied': { en: 'Occupied', ar: 'مشغولة' },
  'tables.reserved': { en: 'Reserved', ar: 'محجوزة' },
  'tables.tableNumber': { en: 'Table', ar: 'طاولة' },
  'tables.capacity': { en: 'Capacity', ar: 'السعة' },
  'tables.guests': { en: 'guests', ar: 'ضيف' },
  'tables.takeOrder': { en: 'Take Order', ar: 'أخذ الطلب' },
  'tables.viewOrder': { en: 'View Order', ar: 'عرض الطلب' },
  'tables.clearTable': { en: 'Clear Table', ar: 'تفريغ الطاولة' },
  'tables.reserveTable': { en: 'Reserve Table', ar: 'حجز الطاولة' },
  
  // Employees
  'employees.title': { en: 'Employees', ar: 'الموظفين' },
  'employees.addEmployee': { en: 'Add Employee', ar: 'إضافة موظف' },
  'employees.name': { en: 'Name', ar: 'الاسم' },
  'employees.role': { en: 'Role', ar: 'المنصب' },
  'employees.department': { en: 'Department', ar: 'القسم' },
  'employees.salary': { en: 'Salary', ar: 'الراتب' },
  'employees.phone': { en: 'Phone', ar: 'الهاتف' },
  'employees.email': { en: 'Email', ar: 'البريد الإلكتروني' },
  'employees.hireDate': { en: 'Hire Date', ar: 'تاريخ التوظيف' },
  'employees.active': { en: 'Active', ar: 'نشط' },
  'employees.inactive': { en: 'Inactive', ar: 'غير نشط' },
  
  // Analytics
  'analytics.title': { en: 'Analytics', ar: 'التحليلات' },
  'analytics.salesReport': { en: 'Sales Report', ar: 'تقرير المبيعات' },
  'analytics.revenue': { en: 'Revenue', ar: 'الإيرادات' },
  'analytics.orders': { en: 'Orders', ar: 'الطلبات' },
  'analytics.customers': { en: 'Customers', ar: 'العملاء' },
  'analytics.products': { en: 'Products', ar: 'المنتجات' },
  'analytics.thisWeek': { en: 'This Week', ar: 'هذا الأسبوع' },
  'analytics.thisMonth': { en: 'This Month', ar: 'هذا الشهر' },
  'analytics.thisYear': { en: 'This Year', ar: 'هذا العام' },
  'analytics.growth': { en: 'Growth', ar: 'النمو' },
  'analytics.comparison': { en: 'Comparison', ar: 'المقارنة' },
  
  // Call Center
  'callCenter.title': { en: 'Call Center', ar: 'مركز الاتصالات' },
  'callCenter.incomingCall': { en: 'Incoming Call', ar: 'مكالمة واردة' },
  'callCenter.answer': { en: 'Answer', ar: 'رد' },
  'callCenter.decline': { en: 'Decline', ar: 'رفض' },
  'callCenter.onCall': { en: 'On Call', ar: 'في مكالمة' },
  'callCenter.takeOrder': { en: 'Take Order', ar: 'أخذ الطلب' },
  'callCenter.customerInfo': { en: 'Customer Information', ar: 'معلومات العميل' },
  'callCenter.phoneNumber': { en: 'Phone Number', ar: 'رقم الهاتف' },
  'callCenter.address': { en: 'Address', ar: 'العنوان' },
  
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