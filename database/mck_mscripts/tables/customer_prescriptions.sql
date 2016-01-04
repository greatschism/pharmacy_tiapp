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

-- Dumping structure for table wg_mscripts.customer_prescriptions
DROP TABLE IF EXISTS `customer_prescriptions`;
CREATE TABLE IF NOT EXISTS `customer_prescriptions` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK of the table',
  `customer_id` int(10) unsigned NOT NULL COMMENT 'FK to the customers table',
  `rx_number` varchar(60) NOT NULL COMMENT 'The RX ID of the prescription',
  `anticipated_refill_date` datetime DEFAULT NULL COMMENT 'Anticipated refill date for the prescription',
  `expiration_date` datetime DEFAULT NULL COMMENT 'Expiration date of the prescription',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `created_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created',
  `created_by` varchar(10) NOT NULL COMMENT 'ID of the user who created this record',
  `updated_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created or updated',
  `last_updated_by` varchar(10) NOT NULL COMMENT 'ID of the user who created or last updated this record',
  `days` varchar(20) DEFAULT NULL COMMENT 'Days field in PDX patient service',
  `filled` datetime DEFAULT NULL COMMENT 'filled field in PDX patient service - prescription last filled date',
  `prescribing_doctor_name` varchar(200) DEFAULT NULL COMMENT 'Prescribing doctors name',
  `quantity` varchar(20) DEFAULT NULL COMMENT 'quantity field in PDX patient service',
  `ref_aut` varchar(20) DEFAULT NULL COMMENT 'ref_aut field in PDX patient service',
  `ref_rem` varchar(20) DEFAULT NULL COMMENT 'Number of refills remaining for the prescription',
  `presc_drug_name` varchar(200) DEFAULT NULL COMMENT 'Prescription drug name',
  `sched` varchar(20) DEFAULT '6' COMMENT 'sched field in PDX patient service',
  `sg_code` varchar(45) DEFAULT NULL COMMENT 'sg_code field in PDX patient service',
  `sig_text` varchar(200) DEFAULT NULL COMMENT 'Dosage descriptiion for a prescription',
  `first` datetime DEFAULT NULL COMMENT 'first field in PDX patient service',
  `store_ncpdp_id` varchar(100) DEFAULT NULL COMMENT 'Store ncpdpid where the refill has been activated',
  `presc_drug_ndc` varchar(100) DEFAULT NULL COMMENT 'Prescription drug ndc',
  `presc_drug_gpi` varchar(100) DEFAULT NULL COMMENT 'Prescription drug gpi',
  `prescribing_doctor_fname` varchar(100) DEFAULT NULL COMMENT 'Prescribing doctors first name',
  `prescribing_doctor_lname` varchar(100) DEFAULT NULL COMMENT 'Prescribing doctors last name',
  `prescribing_doctor_city` varchar(100) DEFAULT NULL COMMENT 'Prescribing doctors city',
  `prescribing_doctor_state` varchar(100) DEFAULT NULL COMMENT 'Prescribing doctors state',
  `prescribing_doctor_zip` varchar(100) DEFAULT NULL COMMENT 'Prescribing doctors zip code',
  `prescribing_doctor_dea` varchar(100) DEFAULT NULL COMMENT 'Prescribing doctors dea',
  `prescribing_doctor_area_code` varchar(100) DEFAULT NULL COMMENT 'Prescribing doctors area code',
  `prescribing_doctor_phone` varchar(100) DEFAULT NULL COMMENT 'Prescribing doctors phone',
  `prescribing_doctor_fax_area_code` varchar(100) DEFAULT NULL COMMENT 'Prescribing doctors fax area code',
  `prescribing_doctor_fax_phone` varchar(100) DEFAULT NULL COMMENT 'Prescribing doctors fax phone',
  `do_not_remind_further` char(1) DEFAULT '0' COMMENT 'Flag to stop reminder computation for the prescription',
  `ard_tx_num` varchar(45) DEFAULT NULL COMMENT 'The primary identifier(Tx number from ARD feed)',
  `latest_tx_num` int(10) unsigned DEFAULT NULL COMMENT 'Transaction number associated with the refill as sent by PDX',
  `is_active` char(1) DEFAULT '1' COMMENT 'Flag to identify the status of prescription',
  `latest_refill_status` varchar(100) DEFAULT NULL COMMENT 'Latest Refill Status of this prescription',
  `latest_sold_date` datetime DEFAULT NULL COMMENT 'Latest prescription sold date',
  `prescribing_doctor_mname` varchar(100) DEFAULT NULL COMMENT 'Prescribing doctors middle name',
  `prescription_code` char(3) DEFAULT NULL COMMENT 'Unique code to identify prescription',
  `LinkedToRxNumber` varchar(45) DEFAULT NULL,
  `LinkedToFacilityID` varchar(45) DEFAULT NULL,
  `prescription_status` varchar(45) DEFAULT NULL,
  `is_refillable` varchar(10) DEFAULT NULL,
  `is_doctor_authorisation` varchar(10) DEFAULT NULL,
  `not_refillable_reason_code` tinyint(4) DEFAULT NULL,
  `is_auto_refill` int(11) DEFAULT '0',
  `is_hidden` char(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `i_rx_number_store_ncpdp_id` (`rx_number`,`store_ncpdp_id`),
  KEY `FK_customer_prescriptions_1` (`customer_id`),
  CONSTRAINT `FK_customer_prescriptions_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Prescriptions associated with customers';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
