-- Add printer_ids column to menu_items table
-- This stores the IDs of printers that should print this specific item
-- The default printer always prints ALL items (handled in application logic)
ALTER TABLE public.menu_items 
ADD COLUMN printer_ids text[] DEFAULT '{}'::text[];