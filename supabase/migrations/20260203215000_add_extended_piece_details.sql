
alter table "public"."set_piece_list" add column "part_cat_id" integer;
alter table "public"."set_piece_list" add column "year_from" integer;
alter table "public"."set_piece_list" add column "year_to" integer;
alter table "public"."set_piece_list" add column "is_trans" boolean default false;
