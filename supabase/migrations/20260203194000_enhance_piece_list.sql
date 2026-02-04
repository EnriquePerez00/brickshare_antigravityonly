
alter table "public"."set_piece_list" add column "element_id" text;
alter table "public"."set_piece_list" add column "color_id" integer;
alter table "public"."set_piece_list" add column "is_spare" boolean default false;
alter table "public"."set_piece_list" add column "location" text;
