-- LOCAL SYNTHETIC DATABASE ONLY. Never run against production.
\set ON_ERROR_STOP on
BEGIN;
\i /dev-server/docs/pending-migrations/009_regular_price_retention/01_apply.sql
INSERT INTO mf_styles(style_code,is_outlet,raw,published,hidden_by_admin) VALUES
('139',false,'{"variants":[{"nomenclatures":[{"productSizeCode":"1394412","outlet":10},{"productSizeCode":"1394413","outlet":10},{"productSizeCode":"1394414","outlet":10}]}]}',true,false),
('PROMO',true,'{}',true,false),('NEW',false,'{}',true,false);
INSERT INTO mf_variants(sku,style_code,color_code,size,size_name) VALUES
('1394412','139','44','XS','XS'),('1394413','139','44','S','S'),('1394414','139','44','M','M'),('PROMO1','PROMO','01','S','S'),('NEW1','NEW','02','S','S');
INSERT INTO mf_prices(sku,wholesale_price,retail_price,currency) VALUES
('1394412',4.73,8.2775,'EUR'),('1394413',4.73,8.2775,'EUR'),('1394414',4.73,8.2775,'EUR'),('PROMO1',4.73,8.2775,'EUR'),('NEW1',5.25,9.1875,'EUR');
INSERT INTO catalog_variant_prices(source,sku,style_code,color_code,size,retail_price,currency,updated_at) VALUES
('mf','1394413','139','44','S',9.19,'EUR','2026-10-01'),
('mf','1394414','139','44','M',7.80,'EUR','2026-10-01'),
('mf','PROMO1','PROMO','01','S',10,'EUR','2026-10-01');
INSERT INTO ru_prices(style_code,retail_price,currency) VALUES('RTEST',10,'EUR');
CREATE TEMP TABLE held_before AS SELECT * FROM catalog_variant_prices;
SELECT refresh_catalog_prices();
DO $test$ BEGIN
 IF EXISTS ((SELECT * FROM held_before EXCEPT SELECT * FROM catalog_variant_prices)) THEN RAISE EXCEPTION 'promo rows not byte-for-byte retained'; END IF;
 IF EXISTS(SELECT 1 FROM catalog_variant_prices WHERE sku='1394412') THEN RAISE EXCEPTION 'unknown XS invented from 4.73/other size'; END IF;
 IF (SELECT retail_price FROM catalog_variant_prices WHERE sku='NEW1') IS DISTINCT FROM 9.19::numeric THEN RAISE EXCEPTION 'normal new MF frozen'; END IF;
 IF (SELECT retail_price FROM catalog_variant_prices WHERE sku='RTEST') IS DISTINCT FROM 17::numeric THEN RAISE EXCEPTION 'RU 1.70 flow changed'; END IF;
 IF (SELECT min_price FROM catalog_price_ranges WHERE source='mf' AND style_code='139') IS DISTINCT FROM 7.80::numeric THEN RAISE EXCEPTION 'held legacy relabelled/repriced'; END IF;
END $test$;
-- Missing candidate during confirmed promo also retains exact same-SKU public row.
UPDATE mf_prices SET wholesale_price=NULL,retail_price=NULL WHERE sku='1394413';
SELECT refresh_catalog_prices();
DO $test$ BEGIN
 IF (SELECT retail_price FROM catalog_variant_prices WHERE sku='1394413') IS DISTINCT FROM 9.19::numeric THEN RAISE EXCEPTION 'promo missing candidate deleted hold'; END IF;
END $test$;
-- Sale ends: original normal unit flow resumes, not a permanent freeze.
UPDATE mf_styles SET raw='{}' WHERE style_code='139';
UPDATE mf_prices SET wholesale_price=6,retail_price=10.5 WHERE sku='1394413';
SELECT refresh_catalog_prices();
DO $test$ BEGIN
 IF (SELECT retail_price FROM catalog_variant_prices WHERE sku='1394413') IS DISTINCT FROM 10.5::numeric THEN RAISE EXCEPTION 'sale-end normal flow frozen'; END IF;
END $test$;
ROLLBACK;
-- Exact original definitions and empty synthetic tables restored.
SELECT md5(pg_get_functiondef('refresh_catalog_prices()'::regprocedure))='70fe11431867e526b6c12957762bd5f3' AS refresh_rolled_back,
md5(pg_get_viewdef('catalog_items'::regclass,true))='26917678018e447c4c1d0c0e8acf1d9f' AS view_rolled_back,
(SELECT count(*) FROM catalog_variant_prices)=0 AS rows_rolled_back;
