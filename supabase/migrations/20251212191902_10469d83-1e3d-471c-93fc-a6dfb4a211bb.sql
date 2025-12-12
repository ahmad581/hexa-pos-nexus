-- First, delete existing features that don't match the system
DELETE FROM business_features;
DELETE FROM available_features;

-- Insert the actual features that match the system's FEATURE_ROUTE_MAP
INSERT INTO available_features (id, name, description, icon, category) VALUES
-- Restaurant Features
('menu-management', 'Menu Management', 'Manage menu items and categories', '📋', 'Restaurant'),
('table-management', 'Table Management', 'Manage restaurant tables and seating', '🪑', 'Restaurant'),
('order-management', 'Order Management', 'Handle customer orders', '🛒', 'Restaurant'),

-- Common Features
('inventory-management', 'Inventory Management', 'Track stock and inventory levels', '📦', 'Operations'),
('employee-management', 'Employee Management', 'Manage staff and employees', '👥', 'HR'),
('analytics-reporting', 'Analytics & Reporting', 'View business analytics and reports', '📊', 'Analytics'),
('call-center', 'Call Center', 'Handle customer calls and support', '📞', 'Customer Service'),

-- Hotel Features
('room-management', 'Room Management', 'Manage hotel rooms and availability', '🏨', 'Hospitality'),
('hotel-services', 'Hotel Services', 'Manage hotel services and amenities', '🛎️', 'Hospitality'),

-- Salon Features
('appointment-scheduling', 'Appointment Scheduling', 'Schedule and manage appointments', '📅', 'Scheduling'),
('stylist-management', 'Stylist Management', 'Manage stylists and staff', '💇', 'Salon'),

-- Retail Features
('product-management', 'Product Management', 'Manage products and catalog', '🏷️', 'Retail'),

-- Pharmacy Features
('prescription-management', 'Prescription Management', 'Handle prescriptions and medications', '💊', 'Healthcare'),

-- Gym Features
('member-management', 'Member Management', 'Manage gym members and memberships', '🏋️', 'Membership'),

-- Auto Repair Features
('service-management', 'Service Management', 'Manage services and repairs', '🔧', 'Auto Repair');