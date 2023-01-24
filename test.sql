DROP TRIGGER IF EXISTS before_product_update;
DELIMITER $$ CREATE TRIGGER before_product_update BEFORE
UPDATE ON products FOR EACH ROW BEGIN
INSERT INTO products_tmp
SET title = OLD.title,
  content = OLD.content,
  date = NOW();
END $$ DELIMITER;
