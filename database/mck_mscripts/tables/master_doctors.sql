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

-- Dumping structure for table wg_mscripts.master_doctors
DROP TABLE IF EXISTS `master_doctors`;
CREATE TABLE IF NOT EXISTS `master_doctors` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK of the table',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `first_name` varchar(60) NOT NULL COMMENT 'First Name of the Doctor',
  `last_name` varchar(60) NOT NULL COMMENT 'Last Name of the Doctor',
  `speciality_id` int(10) unsigned NOT NULL COMMENT 'FK to the speciality table',
  `qualification_id` int(10) unsigned DEFAULT NULL COMMENT 'FK to the qualification table',
  `phone` varchar(30) NOT NULL COMMENT 'Phone Number of the Doctor',
  `address_1` varchar(255) NOT NULL COMMENT 'Address Line 1 of the Doctor Address',
  `address_2` varchar(45) DEFAULT NULL COMMENT 'Address Line 2 of the Doctor Address',
  `city` varchar(45) NOT NULL COMMENT 'City',
  `state` varchar(45) NOT NULL COMMENT 'State',
  `zip` varchar(10) NOT NULL COMMENT 'Zip Code of the Doctor',
  `created_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created',
  `created_by` varchar(10) NOT NULL COMMENT 'ID of the user who created this record',
  `updated_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created or updated',
  `last_updated_by` varchar(10) NOT NULL COMMENT 'ID of the user who created or last updated this record',
  `doctor_dea` varchar(50) NOT NULL COMMENT 'Doctor dea',
  `faxareacode` varchar(45) DEFAULT NULL COMMENT 'Doctor fax areacode',
  `faxphone` varchar(45) DEFAULT NULL COMMENT 'Doctor fax phone',
  PRIMARY KEY (`id`),
  KEY `FK_master_doctors_client_id` (`client_id`),
  CONSTRAINT `FK_master_doctors_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Stores the approved Doctors';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
