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

-- Dumping structure for table wg_mscripts.feedback_text
DROP TABLE IF EXISTS `feedback_text`;
CREATE TABLE IF NOT EXISTS `feedback_text` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(10) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `feedback_status` tinyint(4) DEFAULT '0',
  `feedback` varchar(256) DEFAULT NULL,
  `device_id` varchar(1000) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `created_by` varchar(45) DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `updated_by` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='To Save feedback from the customer';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
