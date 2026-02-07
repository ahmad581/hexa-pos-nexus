-- Update menu-management to be a universal/shared feature by changing its category to Operations
UPDATE available_features 
SET category = 'Operations', 
    description = 'Manage menu items, products, and service catalogs'
WHERE id = 'menu-management';