-- ============================================================
-- Smart Retail SaaS — Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS smart_retail_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE smart_retail_db;

-- ============================================================
-- 1. STORES
-- ============================================================
CREATE TABLE stores (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    store_name  VARCHAR(150)   NOT NULL,
    gst_number  VARCHAR(20)    NULL,
    default_tax_rate DECIMAL(5,2) NOT NULL DEFAULT 18.00,
    address     VARCHAR(500)   NULL,
    phone       VARCHAR(20)    NULL,
    created_at  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- 2. OWNERS
-- ============================================================
CREATE TABLE owners (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    owner_name  VARCHAR(100)  NOT NULL,
    email       VARCHAR(255)  NOT NULL,
    password    VARCHAR(255)  NOT NULL,
    role        VARCHAR(20)   NOT NULL DEFAULT 'OWNER',
    store_id    BIGINT        NOT NULL,
    created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_owner_email (email),
    CONSTRAINT fk_owner_store FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_owner_store ON owners(store_id);

-- ============================================================
-- 3. CATEGORIES
-- ============================================================
CREATE TABLE categories (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)  NOT NULL,
    description VARCHAR(500)  NULL,
    store_id    BIGINT        NOT NULL,
    created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_category_name_store (name, store_id),
    CONSTRAINT fk_category_store FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_category_store ON categories(store_id);

-- ============================================================
-- 4. PRODUCTS
-- ============================================================
CREATE TABLE products (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(200)  NOT NULL,
    description VARCHAR(500)  NULL,
    price       DECIMAL(12,2) NOT NULL,
    barcode     VARCHAR(50)   NULL,
    stock_qty   INT           NOT NULL DEFAULT 0,
    low_stock_threshold INT   NOT NULL DEFAULT 10,
    category_id BIGINT        NULL,
    store_id    BIGINT        NOT NULL,
    created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_barcode_store (barcode, store_id),
    CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    CONSTRAINT fk_product_store    FOREIGN KEY (store_id)    REFERENCES stores(id) ON DELETE CASCADE,
    CONSTRAINT chk_stock_non_negative CHECK (stock_qty >= 0)
) ENGINE=InnoDB;

CREATE INDEX idx_product_store   ON products(store_id);
CREATE INDEX idx_product_barcode ON products(barcode);
CREATE INDEX idx_product_name    ON products(name);

-- ============================================================
-- 5. CUSTOMERS
-- ============================================================
CREATE TABLE customers (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)  NOT NULL,
    email       VARCHAR(255)  NULL,
    phone       VARCHAR(20)   NULL,
    store_id    BIGINT        NOT NULL,
    created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_customer_email_store (email, store_id),
    CONSTRAINT fk_customer_store FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_customer_store ON customers(store_id);

-- ============================================================
-- 6. BILLS
-- ============================================================
CREATE TABLE bills (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    bill_number     VARCHAR(30)    NOT NULL,
    customer_id     BIGINT         NULL,
    subtotal        DECIMAL(14,2)  NOT NULL DEFAULT 0.00,
    item_discount   DECIMAL(14,2)  NOT NULL DEFAULT 0.00,
    bill_discount   DECIMAL(14,2)  NOT NULL DEFAULT 0.00,
    taxable_amount  DECIMAL(14,2)  NOT NULL DEFAULT 0.00,
    tax_rate        DECIMAL(5,2)   NOT NULL DEFAULT 18.00,
    tax_amount      DECIMAL(14,2)  NOT NULL DEFAULT 0.00,
    total_amount    DECIMAL(14,2)  NOT NULL DEFAULT 0.00,
    status          VARCHAR(20)    NOT NULL DEFAULT 'COMPLETED',
    store_id        BIGINT         NOT NULL,
    created_at      TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_bill_number_store (bill_number, store_id),
    CONSTRAINT fk_bill_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    CONSTRAINT fk_bill_store    FOREIGN KEY (store_id)    REFERENCES stores(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_bill_store    ON bills(store_id);
CREATE INDEX idx_bill_customer ON bills(customer_id);

-- ============================================================
-- 7. BILL ITEMS
-- ============================================================
CREATE TABLE bill_items (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    bill_id      BIGINT        NOT NULL,
    product_id   BIGINT        NOT NULL,
    product_name VARCHAR(200)  NOT NULL,
    quantity     INT           NOT NULL,
    unit_price   DECIMAL(12,2) NOT NULL,
    discount     DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    line_total   DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    CONSTRAINT fk_billitem_bill    FOREIGN KEY (bill_id)    REFERENCES bills(id) ON DELETE CASCADE,
    CONSTRAINT fk_billitem_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE INDEX idx_billitem_bill ON bill_items(bill_id);

-- ============================================================
-- 8. OFFERS
-- ============================================================
CREATE TABLE offers (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(200)  NOT NULL,
    description VARCHAR(1000) NULL,
    discount    DECIMAL(5,2)  NOT NULL,
    valid_from  DATE          NULL,
    valid_till  DATE          NOT NULL,
    active      BOOLEAN       NOT NULL DEFAULT TRUE,
    store_id    BIGINT        NOT NULL,
    created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_offer_store FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_offer_store ON offers(store_id);
CREATE INDEX idx_offer_valid ON offers(valid_till);
