
CREATE TABLE t_p54266347_multi_level_electron.products (
    id                        SERIAL PRIMARY KEY,
    kod_kitay                 VARCHAR(100),
    naimenovanie              VARCHAR(500) NOT NULL,
    artikul                   VARCHAR(100),
    shtrikhkod                VARCHAR(50),
    zakup_tsena_yuan          NUMERIC(14, 4) DEFAULT 0,
    kurs_yuan                 NUMERIC(10, 4) DEFAULT 0,
    tsena_dostavki            NUMERIC(14, 2) DEFAULT 0,
    ves_tovara                NUMERIC(10, 3) DEFAULT 0,
    gabarity_upakovki         VARCHAR(100),
    kurs_dollara              NUMERIC(10, 4) DEFAULT 0,
    stavka_kg                 NUMERIC(10, 4) DEFAULT 0,
    stavka_kub                NUMERIC(10, 4) DEFAULT 0,
    sebestoimost              NUMERIC(14, 2) DEFAULT 0,
    fifo                      NUMERIC(14, 2) DEFAULT 0,
    lifo                      NUMERIC(14, 2) DEFAULT 0,
    prodazh_tsena_roznitsa    NUMERIC(14, 2) DEFAULT 0,
    prodazh_tsena_opt         NUMERIC(14, 2) DEFAULT 0,
    kolichestvo               INTEGER        DEFAULT 0,
    ostatok                   INTEGER        DEFAULT 0,
    summa                     NUMERIC(14, 2) DEFAULT 0,
    zakazano                  INTEGER        DEFAULT 0,
    otgruzheno                INTEGER        DEFAULT 0,
    vozvrat_postavshchiku     INTEGER        DEFAULT 0,
    vozvrat_ot_pokupatelya    INTEGER        DEFAULT 0,
    created_at                TIMESTAMP DEFAULT NOW(),
    updated_at                TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE  t_p54266347_multi_level_electron.products IS 'Товары магазина электроники';
COMMENT ON COLUMN t_p54266347_multi_level_electron.products.kod_kitay              IS 'Код товара Китай';
COMMENT ON COLUMN t_p54266347_multi_level_electron.products.naimenovanie           IS 'Наименование товара';
COMMENT ON COLUMN t_p54266347_multi_level_electron.products.artikul                IS 'Артикул';
COMMENT ON COLUMN t_p54266347_multi_level_electron.products.shtrikhkod             IS 'Штрихкод';
COMMENT ON COLUMN t_p54266347_multi_level_electron.products.zakup_tsena_yuan       IS 'Закупочная цена (юань)';
COMMENT ON COLUMN t_p54266347_multi_level_electron.products.kurs_yuan              IS 'Курс юаня';
COMMENT ON COLUMN t_p54266347_multi_level_electron.products.tsena_dostavki         IS 'Цена доставки';
COMMENT ON COLUMN t_p54266347_multi_level_electron.products.ves_tovara             IS 'Вес товара (кг)';
COMMENT ON COLUMN t_p54266347_multi_level_electron.products.gabarity_upakovki      IS 'Габариты упаковки';
COMMENT ON COLUMN t_p54266347_multi_level_electron.products.kurs_dollara           IS 'Курс доллара';
COMMENT ON COLUMN t_p54266347_multi_level_electron.products.stavka_kg              IS 'Ставка за кг';
COMMENT ON COLUMN t_p54266347_multi_level_electron.products.stavka_kub             IS 'Ставка за куб';
COMMENT ON COLUMN t_p54266347_multi_level_electron.products.sebestoimost           IS 'Себестоимость';
COMMENT ON COLUMN t_p54266347_multi_level_electron.products.fifo                   IS 'Метод ФИФО';
COMMENT ON COLUMN t_p54266347_multi_level_electron.products.lifo                   IS 'Метод ЛИФО';
COMMENT ON COLUMN t_p54266347_multi_level_electron.products.prodazh_tsena_roznitsa IS 'Продажная цена розница';
COMMENT ON COLUMN t_p54266347_multi_level_electron.products.prodazh_tsena_opt      IS 'Продажная цена опт';
COMMENT ON COLUMN t_p54266347_multi_level_electron.products.kolichestvo            IS 'Количество';
COMMENT ON COLUMN t_p54266347_multi_level_electron.products.ostatok                IS 'Остаток';
COMMENT ON COLUMN t_p54266347_multi_level_electron.products.summa                  IS 'Сумма';
COMMENT ON COLUMN t_p54266347_multi_level_electron.products.zakazano               IS 'Заказано';
COMMENT ON COLUMN t_p54266347_multi_level_electron.products.otgruzheno             IS 'Отгружено';
COMMENT ON COLUMN t_p54266347_multi_level_electron.products.vozvrat_postavshchiku  IS 'Возврат поставщику';
COMMENT ON COLUMN t_p54266347_multi_level_electron.products.vozvrat_ot_pokupatelya IS 'Возврат от покупателя';
