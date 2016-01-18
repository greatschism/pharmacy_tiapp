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

-- Dumping structure for table wg_mscripts.tables_encrypted
DROP TABLE IF EXISTS `tables_encrypted`;
CREATE TABLE IF NOT EXISTS `tables_encrypted` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `table_name` varchar(64) NOT NULL COMMENT 'Name of the table in transaction schema that contains encrypted column(s)',
  `column_csv` varchar(500) NOT NULL COMMENT 'Columns of the table <table_name> containing encrypted data, in comma separated format',
  `created_at` datetime NOT NULL COMMENT 'Created UTC Timestamp',
  `created_by` varchar(45) NOT NULL COMMENT 'Row entry created by user',
  `updated_at` datetime NOT NULL COMMENT 'Last updated at UTC Timestamp',
  `last_updated_by` varchar(45) NOT NULL COMMENT 'Last updated by user',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
