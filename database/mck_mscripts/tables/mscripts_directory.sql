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

-- Dumping structure for table wg_mscripts.mscripts_directory
DROP TABLE IF EXISTS `mscripts_directory`;
CREATE TABLE IF NOT EXISTS `mscripts_directory` (
  `ad_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `first_name` varchar(245) DEFAULT NULL,
  `last_name` varchar(245) NOT NULL,
  `email_address` varchar(245) NOT NULL,
  `email_verified` tinyint(1) NOT NULL,
  `password` varchar(500) NOT NULL,
  `created_by` varchar(45) NOT NULL,
  `created_at` datetime NOT NULL,
  `last_updated_by` varchar(45) NOT NULL,
  `last_updated_at` datetime NOT NULL,
  `username` varchar(45) NOT NULL,
  `otp` varchar(45) DEFAULT NULL,
  `otp_expiry` datetime DEFAULT NULL,
  `secret_question_id` varchar(10) DEFAULT NULL,
  `secret_answer` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`ad_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
