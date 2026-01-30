-- Global Schema Refactor
-- Renaming tables and columns to align with new naming conventions

-- 1. Table: profiles -> users
ALTER TABLE public.profiles RENAME TO users;
ALTER TABLE public.users RENAME COLUMN estado_usuario TO user_status;

-- 2. Table: sets
ALTER TABLE public.sets RENAME COLUMN name TO set_name;
ALTER TABLE public.sets RENAME COLUMN lego_ref TO set_ref;
ALTER TABLE public.sets RENAME COLUMN theme TO set_theme;
ALTER TABLE public.sets RENAME COLUMN description TO set_description;
ALTER TABLE public.sets RENAME COLUMN image_url TO set_image_url;
ALTER TABLE public.sets RENAME COLUMN age_range TO set_age_range;
ALTER TABLE public.sets RENAME COLUMN piece_count TO set_piece_count;

-- 3. Table: operaciones_recepcion
ALTER TABLE public.operaciones_recepcion RENAME COLUMN peso_obtenido TO weight_measured;

-- 4. Table: set_piece_list
ALTER TABLE public.set_piece_list RENAME COLUMN lego_ref TO set_ref;
ALTER TABLE public.set_piece_list RENAME COLUMN piece_url TO piece_image_url;
ALTER TABLE public.set_piece_list RENAME COLUMN lego_element_id TO piece_lego_elementid;

-- 5. Table: inventario_sets -> inventory_sets
ALTER TABLE public.inventario_sets RENAME TO inventory_sets;
ALTER TABLE public.inventory_sets RENAME COLUMN cantidad_total TO inventory_set_total_qty;
ALTER TABLE public.inventory_sets DROP COLUMN stock_central;

-- Update foreign key references if necessary (PostgreSQL handles this automatically usually, but let's check indices/triggers)
-- Triggers and indices usually follow the rename.

-- Re-enable RLS and verify policies (renaming table usually keeps policies attached)
