ALTER TABLE t_p54266347_multi_level_electron.products
ADD COLUMN photo_url TEXT;

COMMENT ON COLUMN t_p54266347_multi_level_electron.products.photo_url IS 'URL фотографии товара в S3';

CREATE UNIQUE INDEX products_naimenovanie_lower_idx
ON t_p54266347_multi_level_electron.products (LOWER(naimenovanie));
