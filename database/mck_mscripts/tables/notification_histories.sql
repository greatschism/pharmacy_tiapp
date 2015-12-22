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

-- Dumping structure for table wg_mscripts.notification_histories
DROP TABLE IF EXISTS `notification_histories`;
CREATE TABLE IF NOT EXISTS `notification_histories` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK of the table',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `notification_id` int(10) unsigned NOT NULL COMMENT 'The id of the record in the notifications table',
  `name` varchar(1000) NOT NULL COMMENT 'Notification Name',
  `description` varchar(1000) NOT NULL COMMENT 'Description of the notification',
  `start_date` datetime DEFAULT NULL COMMENT 'Start date of the notification. The notifications would be deemed active after this date',
  `expiry_date` datetime NOT NULL COMMENT 'Expirty date of the notification. The notifications would be deemed inactive after this date',
  `notification_send_date` datetime DEFAULT NULL COMMENT 'Send date for the notification',
  `notification_send_hour` varchar(45) DEFAULT NULL COMMENT 'Send hour time for the notification. Overides the customer preferences',
  `send_onphone` char(1) DEFAULT NULL COMMENT 'Flag for onphone notifications to be sent',
  `send_text_msg` char(1) NOT NULL DEFAULT '0' COMMENT 'Flag for sms to be sent',
  `send_email` char(1) NOT NULL DEFAULT '0' COMMENT 'Flag for email to be sent',
  `send_push_notif` char(1) NOT NULL DEFAULT '0' COMMENT 'Flag for push notification to be sent',
  `message` varchar(4000) DEFAULT NULL COMMENT 'Notification message to be sent to the customer on his phone',
  `text_message` varchar(400) DEFAULT NULL COMMENT 'Message to be sent for a text notification',
  `email_message` varchar(400) DEFAULT NULL COMMENT 'Message to be sent for an email notification',
  `push_message` varchar(400) DEFAULT NULL COMMENT 'Message to be sent for a iphone push notification',
  `priority` int(10) unsigned NOT NULL DEFAULT '3' COMMENT 'Priority of the notification where 1 means High, 2 means Medium and 3 means Low. This field is used for sort order',
  `override_cust_pref` char(1) NOT NULL DEFAULT '0' COMMENT 'Flag for customer preferences to be overiden',
  `customer_set` varchar(20) DEFAULT NULL COMMENT 'Indicates targeted customer set - all or existing',
  `notification_type` varchar(100) DEFAULT NULL COMMENT 'Refers to the type of a notification',
  `sql_sel` varchar(5000) DEFAULT NULL COMMENT 'SELECT query that defines the list of customers to whom the notifications should be sent',
  `is_approved` char(1) NOT NULL DEFAULT '0' COMMENT 'Approval status for the notification',
  `approval_comments` varchar(1000) DEFAULT NULL COMMENT 'Comments made by the approver',
  `is_onphone_processed` char(1) NOT NULL DEFAULT '0' COMMENT 'Is the notification processed for onphone display',
  `is_processed` char(1) NOT NULL DEFAULT '0' COMMENT 'Is the notification sent',
  `enabled` char(1) NOT NULL DEFAULT '1' COMMENT 'Indicates if the notification is enabled or disabled',
  `filter_type` varchar(45) DEFAULT NULL COMMENT 'Indicates customer filter criteria - phone platform based/custom query/all/other',
  `filter_text` varchar(4500) DEFAULT NULL COMMENT 'Text which describes sql_sel',
  `join_condition` varchar(45) DEFAULT NULL COMMENT 'Indicates the join condition for custom query builder',
  `update_condition` varchar(45) DEFAULT NULL COMMENT 'Indicates the way notification should behave when edited',
  `repititions` varchar(10) NOT NULL DEFAULT '1' COMMENT 'Total number of repititions for the notification',
  `repititions_completed` varchar(10) NOT NULL DEFAULT '0' COMMENT 'Number of repititions completed for the notification',
  `created_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created',
  `created_by` varchar(10) DEFAULT NULL COMMENT 'ID of the user who created this record',
  `updated_at` datetime DEFAULT NULL COMMENT 'This field specifies the  date and time when the record was created or updated',
  `last_updated_by` varchar(10) NOT NULL COMMENT 'ID of the user who created or last updated this record',
  `frequency` varchar(500) DEFAULT NULL COMMENT 'Repetition frequency',
  `send_hour` varchar(500) DEFAULT NULL COMMENT 'Repetition send hour for the notification',
  `day_of_month` varchar(500) DEFAULT NULL COMMENT 'Day of month configuration for a notification',
  `day_of_year` varchar(500) DEFAULT NULL COMMENT 'Day of year configuration for the notification',
  `day_of_week` varchar(500) DEFAULT NULL COMMENT 'Day of week configuration for the notification',
  `send_options` char(1) DEFAULT NULL COMMENT 'Indicates if the advanced frequency send options are enabled',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Stores the notification history details';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
