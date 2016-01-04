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

-- Dumping structure for table wg_mscripts.client_preferences
DROP TABLE IF EXISTS `client_preferences`;
CREATE TABLE IF NOT EXISTS `client_preferences` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'PK of the table',
  `client_id` int(10) unsigned NOT NULL COMMENT 'FK to the clients table',
  `doctor_appointment` char(1) NOT NULL COMMENT 'Flag to start/stop doctor appointment reminders',
  `dosage` char(1) NOT NULL COMMENT 'Flag to start/stop dosage reminders',
  `email_active` char(1) NOT NULL COMMENT 'Flag to start/stop Email',
  `onphone_reminder_active` char(1) NOT NULL COMMENT 'Flag to enable/disable onphone reminders sync/APNS feature',
  `onphone_reminder_days` varchar(5) NOT NULL COMMENT 'This field stores the value of "number of days" field for onphone reminders',
  `rx_refill` char(1) NOT NULL COMMENT 'Flag to start/stop refill reminders',
  `send_reminder_hour` time NOT NULL COMMENT 'Default reminder send hour - for refill and doctor appointment reminders',
  `show_rx_name` char(1) NOT NULL COMMENT 'Flag to hide/show rx names in reminders',
  `text_msg_active` char(1) NOT NULL COMMENT 'Flag to start/stop SMS',
  `timezone` varchar(200) NOT NULL COMMENT 'Default Timezone',
  `is_shared_comm_enabled` char(1) NOT NULL DEFAULT '0' COMMENT 'Is Shared Mobile Communication Enabled',
  `created_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created',
  `updated_at` datetime NOT NULL COMMENT 'This field specifies the  date and time when the record was created or updated',
  `created_by` varchar(45) DEFAULT NULL COMMENT 'ID of the user who created this record',
  `last_updated_by` varchar(45) NOT NULL COMMENT 'ID of the user who created or last updated this record',
  `state` varchar(100) NOT NULL COMMENT 'Default state value',
  `is_eps_enabled` char(1) NOT NULL COMMENT 'Is EPS available for this client',
  `is_ads_enabled` char(1) NOT NULL COMMENT 'Is adv supported',
  `email_support_enabled` char(1) NOT NULL COMMENT 'Is email support enabled',
  `sms_support_enabled` char(1) NOT NULL COMMENT 'Is sms support enabled',
  `reminders_feature_enabled` char(1) NOT NULL COMMENT 'Is reminder support enabled',
  `maps_feature_enabled` char(1) NOT NULL COMMENT 'Is google maps support enabled',
  `store_locator_enabled` char(1) NOT NULL COMMENT 'Is store locator enabled',
  `edit_refill_reminder_settings_enabled` char(1) NOT NULL COMMENT 'Is edit refill reminder settings enabled',
  `doctors_module_enabled` char(1) NOT NULL COMMENT 'Is doctors module enabled',
  `default_ard_logic` char(1) NOT NULL COMMENT 'Is default ARD logic enabled',
  `start_reminder_period` int(10) unsigned NOT NULL COMMENT 'Default start reminder period',
  `shortcode` varchar(10) NOT NULL COMMENT 'Client shortcode',
  `shortcode_username` varchar(45) NOT NULL COMMENT 'Username for shortcode',
  `shortcode_serviceid` varchar(20) NOT NULL COMMENT 'mblox shortcode serviceid',
  `helptext_url` varchar(300) NOT NULL COMMENT 'Help text URL for phone applications',
  `is_text_messaging_optional` char(1) NOT NULL COMMENT 'Flag that enables to login without mobile signup',
  `recurring_reminder` char(1) NOT NULL COMMENT 'Flag to enable recurring redill reminders',
  `refill_reminder_count` char(1) NOT NULL COMMENT 'Default number of refill reminders',
  `is_primary_pharmacy_enabled` char(1) NOT NULL COMMENT 'Flag indicating support for primary pharmacy',
  `is_refillbyscan_enabled` char(1) NOT NULL COMMENT 'Flag indicating support for refill by scan',
  `is_quickrefill_enabled` char(1) NOT NULL COMMENT 'Flag indicating support for quick refill',
  `is_multilanguage_enabled` char(1) NOT NULL COMMENT 'Flag indicating support for multilanguage',
  `language` varchar(100) NOT NULL COMMENT 'Default language ',
  `is_feedback_enabled` char(1) NOT NULL COMMENT 'Flag indicating support for feedback service',
  `feedback_reserve` char(5) NOT NULL COMMENT 'Reserve value for feedback',
  `footer_text` varchar(100) DEFAULT NULL COMMENT 'Footer text for client apps',
  `pickuptime_group` varchar(100) NOT NULL COMMENT 'Default refill pickuptime group',
  `is_coupons_enabled` char(1) NOT NULL COMMENT 'Flag indicating support for coupons module',
  `is_facebook_share_enabled` char(1) NOT NULL COMMENT 'Flag indicating support for coupon facebook sharing',
  `facebook_app_id` varchar(20) NOT NULL COMMENT 'Facebook application id for the client',
  `is_store_identifier_enabled` char(1) NOT NULL DEFAULT '0' COMMENT 'Is Store Identifier Enabled',
  `default_prescription_sort_order` varchar(30) NOT NULL COMMENT 'Indicates the default sort order preference for the customer prescriptions.',
  `cust_care_email_to_addr` varchar(45) NOT NULL COMMENT 'Indicates the email address of the support team',
  `cust_care_email_cc_addr` varchar(45) NOT NULL COMMENT 'Indicates the email address of the team to be cc''d for the help message',
  `default_hide_expired_prescriptions` char(1) NOT NULL COMMENT '1 indicates to show prescriptions till the prescription expiration limit and 0 indicates to hide the expired prescriptions',
  `facebook_url` varchar(100) DEFAULT NULL COMMENT 'The facebook url',
  `twitter_url` varchar(100) DEFAULT NULL COMMENT 'The twitter url',
  `youtube_url` varchar(100) DEFAULT NULL COMMENT 'The youtube url for the client.',
  `is_banners_enabled` char(1) NOT NULL DEFAULT '0' COMMENT 'Flag indicating whether banner is enabled',
  `blog_url` varchar(100) DEFAULT NULL COMMENT 'The blog url for the client',
  `pinterest_url` varchar(100) DEFAULT NULL COMMENT 'The Pinterest URL',
  `clientsite_url` varchar(100) DEFAULT NULL COMMENT 'The client site URL',
  `is_otp_forgotpassword_enabled` varchar(10) DEFAULT NULL,
  `is_question_forgotpassword_enabled` varchar(10) DEFAULT NULL,
  `is_email_forgotpassword_enabled` varchar(10) DEFAULT NULL,
  `healthfeed_url1` varchar(45) DEFAULT NULL,
  `healthfeed_url2` varchar(45) DEFAULT NULL,
  `healthfeed_url3` varchar(45) DEFAULT NULL,
  `healthfeed_text1` varchar(45) DEFAULT NULL,
  `healthfeed_text2` varchar(45) DEFAULT NULL,
  `healthfeed_text3` varchar(45) DEFAULT NULL,
  `googleplus_url` varchar(100) DEFAULT NULL,
  `foursquare_url` varchar(100) DEFAULT NULL,
  `is_wishabi_enabled` char(1) DEFAULT NULL,
  `is_familyaccount_enabled` char(1) DEFAULT NULL,
  `is_stores_signup_enabled` char(1) DEFAULT NULL,
  `is_transferrx_enabled` char(1) DEFAULT NULL,
  `is_adherence_enabled` char(1) DEFAULT NULL,
  `is_pdx_webapi_enabled` char(1) DEFAULT NULL,
  `supported_language` varchar(45) DEFAULT 'en',
  `client_url` varchar(100) DEFAULT NULL,
  `json_font_version` int(3) NOT NULL DEFAULT '1',
  `json_images_version` int(3) NOT NULL DEFAULT '1',
  `json_menu_version` int(3) NOT NULL DEFAULT '1',
  `json_template_version` int(3) NOT NULL DEFAULT '1',
  `json_theme_version` int(3) NOT NULL DEFAULT '1',
  `json_lang_code` varchar(3) NOT NULL DEFAULT 'en',
  PRIMARY KEY (`id`),
  KEY `FK_client_preferences_client_id` (`client_id`),
  CONSTRAINT `FK_client_preferences_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Client recommended settings';

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
