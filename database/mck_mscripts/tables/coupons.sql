-- --------------------------------------------------------
-- Host:                         carbonuat.cxivby4riwed.us-east-1.rds.amazonaws.com
-- Server version:               5.6.23-log - MySQL Community Server (GPL)
-- Server OS:                    Linux
-- HeidiSQL Version:             8.0.0.4396
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

-- Dumping structure for table wg_mscripts.coupons
DROP TABLE IF EXISTS `coupons`;
CREATE TABLE IF NOT EXISTS `coupons` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Primary Key of the table',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `batch_id` int(10) unsigned NOT NULL COMMENT 'FK for the ai_coupon_batches table',
  `coupon_id` varchar(100) NOT NULL COMMENT 'Coupon Identifier',
  `category_id` int(10) unsigned DEFAULT NULL COMMENT 'Coupon category',
  `subcategory_id` int(10) unsigned DEFAULT '0' COMMENT 'FK to the id column in ai_coupon_subcategories table',
  `brand_id` int(10) unsigned DEFAULT NULL COMMENT 'Brand of the coupon product',
  `product_name` varchar(500) DEFAULT NULL COMMENT 'Product Name of the coupon',
  `ad_caption` varchar(500) DEFAULT NULL COMMENT 'Caption for the coupon',
  `ad_desc` varchar(500) DEFAULT NULL COMMENT 'Description of the coupon',
  `barcode_image_url` varchar(500) DEFAULT NULL COMMENT 'Barcode Image URL for the coupon barcode',
  `ad_image_url` varchar(500) DEFAULT NULL COMMENT 'Image URL for the coupon',
  `ad_thumbnail_url` varchar(500) DEFAULT NULL COMMENT 'Image URL for the coupon thumbnail',
  `stores` varchar(500) DEFAULT NULL COMMENT 'CSV of the stores where this coupon is available',
  `zipcodes` varchar(500) DEFAULT NULL COMMENT 'CSV of the zipcodes where this coupon is available',
  `valid_from` datetime DEFAULT NULL COMMENT 'valid from date for the coupon',
  `valid_to` datetime DEFAULT NULL COMMENT 'valid TO date for the coupon',
  `price` varchar(45) DEFAULT NULL COMMENT 'Coupon price',
  `priority` int(10) unsigned NOT NULL COMMENT 'The position in which the coupon should be displayed',
  `created_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created',
  `created_by` varchar(10) NOT NULL COMMENT 'ID of the user who created this record',
  `updated_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created or updated',
  `last_updated_by` varchar(10) NOT NULL COMMENT 'ID of the user who created or last updated this record',
  PRIMARY KEY (`id`),
  KEY `FK_ai_coupons_1` (`client_id`),
  KEY `FK_ai_coupons_2` (`batch_id`),
  KEY `FK_ai_coupons_3` (`category_id`),
  KEY `FK_ai_coupons_4` (`subcategory_id`),
  KEY `FK_ai_coupons_5` (`brand_id`),
  KEY `Index_ai_coupons_6` (`batch_id`,`coupon_id`,`client_id`),
  CONSTRAINT `FK_coupons_batch_id` FOREIGN KEY (`batch_id`) REFERENCES `coupon_batches` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `FK_coupons_brand_id` FOREIGN KEY (`brand_id`) REFERENCES `coupon_brands` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `FK_coupons_category_id` FOREIGN KEY (`category_id`) REFERENCES `coupon_categories` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `FK_coupons_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `FK_coupons_subcategory_id` FOREIGN KEY (`subcategory_id`) REFERENCES `coupon_subcategories` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Stores the attribites of the coupons';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
