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

-- Dumping structure for table wg_mscripts.coupon_batches
DROP TABLE IF EXISTS `coupon_batches`;
CREATE TABLE IF NOT EXISTS `coupon_batches` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Primary Key of the table',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `campaign_id` int(10) unsigned NOT NULL COMMENT 'FK for the campaigns table',
  `batch_id` varchar(100) DEFAULT NULL COMMENT 'Identifier of the batch',
  `batch_type` varchar(100) NOT NULL COMMENT 'Type of batch - coupons or banner ads',
  `batch_name` varchar(200) DEFAULT NULL COMMENT 'Name of the batch - identifier for the batch',
  `batch_image_thumbnail_url` varchar(500) DEFAULT NULL COMMENT 'Thumbnail URL for the batch',
  `batch_image_thumbnail_text` varchar(500) DEFAULT NULL COMMENT 'text for batch description - in case the URL is not specified',
  `batch_image_banner_url` varchar(500) DEFAULT NULL COMMENT 'Banner URL for the batch',
  `batch_image_banner_text` varchar(500) DEFAULT NULL COMMENT 'Text if image URL not specified for the banner',
  `valid_from` datetime NOT NULL COMMENT 'valid from date for the batch',
  `valid_to` datetime NOT NULL COMMENT 'valid TO date for the batch',
  `created_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created',
  `created_by` varchar(10) NOT NULL COMMENT 'ID of the user who created this record',
  `updated_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created or updated',
  `last_updated_by` varchar(10) NOT NULL COMMENT 'ID of the user who created or last updated this record',
  PRIMARY KEY (`id`),
  KEY `FK_ai_coupon_batches_1` (`client_id`),
  KEY `FK_ai_coupon_batches_2` (`campaign_id`),
  KEY `Index_ai_coupon_batches_3` (`batch_id`,`campaign_id`),
  CONSTRAINT `FK_coupon_batches_campaign_id` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `FK_coupon_batches_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Stores the batch attribites of the coupon batch';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
