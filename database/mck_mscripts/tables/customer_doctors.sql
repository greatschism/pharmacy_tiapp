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

-- Dumping structure for table wg_mscripts.customer_doctors
DROP TABLE IF EXISTS `customer_doctors`;
CREATE TABLE IF NOT EXISTS `customer_doctors` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK of the table',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `customer_id` int(10) unsigned NOT NULL COMMENT 'FK to the customers table',
  `master_doctor_id` int(10) unsigned DEFAULT NULL COMMENT 'ID from the master doctors table if user does a search and add',
  `first_name` varchar(100) DEFAULT NULL COMMENT 'First Name of the doctor',
  `last_name` varchar(100) DEFAULT NULL COMMENT 'Last name of the doctor',
  `speciality_id` int(10) unsigned DEFAULT NULL COMMENT 'ID from the code values table corresponding to the speciality',
  `qualification_id` int(10) unsigned DEFAULT NULL COMMENT 'ID from the code values table corresponding to the qualification',
  `address_1` varchar(255) DEFAULT NULL COMMENT 'Address Line 1',
  `address_2` varchar(45) DEFAULT NULL COMMENT 'Address Line 2',
  `city` varchar(45) DEFAULT NULL COMMENT 'City of the doctor',
  `state` varchar(45) DEFAULT NULL COMMENT '2 letter abbreviated State ',
  `zip` varchar(10) DEFAULT NULL COMMENT 'zip code of the doctor location',
  `notes` varchar(255) DEFAULT NULL COMMENT 'Text field for notes',
  `created_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created',
  `created_by` varchar(10) NOT NULL COMMENT 'ID of the user who created this record',
  `updated_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created or updated',
  `last_updated_by` varchar(10) NOT NULL COMMENT 'ID of the user who created or last updated this record',
  `doctor_dea` varchar(50) DEFAULT NULL COMMENT 'Doctors DEA',
  `faxareacode` varchar(45) DEFAULT NULL COMMENT 'Doctors fax area code',
  `faxphone` varchar(45) DEFAULT NULL COMMENT 'Doctors fax phone number',
  `phone` varchar(100) DEFAULT NULL COMMENT 'Phone number of the doctor',
  `image_url` varchar(1000) DEFAULT NULL,
  `organisation_name` varchar(100) DEFAULT NULL COMMENT 'Name of the organisation which the doctor belongs to ',
  `doctor_type` varchar(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_customer_doctors_client_id` (`client_id`),
  KEY `FK_customer_doctors_customer_id` (`customer_id`),
  CONSTRAINT `FK_customer_doctors_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_customer_doctors_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Mapping table for the customers and doctors added';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
