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

-- Dumping structure for table wg_mscripts.efax_status_codes
DROP TABLE IF EXISTS `efax_status_codes`;
CREATE TABLE IF NOT EXISTS `efax_status_codes` (
  `status_code` int(10) unsigned NOT NULL COMMENT 'Error codes returned from the efax developer portal',
  `status_description` varchar(256) DEFAULT NULL COMMENT 'Status description of the Error codes returned from the efax portal',
  `status_code_class` varchar(3) DEFAULT NULL COMMENT 'Error code class which it belong to',
  `created_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created',
  `created_by` varchar(10) NOT NULL COMMENT 'ID of the user who created this record',
  `updated_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created or updated',
  `updated_by` varchar(10) NOT NULL COMMENT 'ID of the user who created or last updated this record',
  PRIMARY KEY (`status_code`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Table which contains all the efax status codes';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
