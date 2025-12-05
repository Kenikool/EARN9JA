# Requirements Document

## Introduction

This document outlines the requirements for configuring a Hostinger domain and deploying the Earn9ja platform (backend API and mobile app) to production. The system encompasses domain configuration, SSL certificate setup, backend API deployment, mobile app deployment to app stores, and legal document hosting.

## Glossary

- **Hostinger**: The domain registrar where the domain (earn9ja.site) was purchased
- **Render**: The cloud hosting platform where the Backend_API will be deployed
- **Backend_API**: The Node.js/Express server that provides REST API endpoints for the mobile application
- **Mobile_App**: The React Native/Expo mobile application for iOS and Android
- **DNS**: Domain Name System that translates domain names to IP addresses
- **SSL_Certificate**: Security certificate that enables HTTPS encryption (automatically provided by Render)
- **API_Endpoint**: The production URL where the Backend_API will be accessible (api.earn9ja.site)
- **Legal_Documents**: Privacy Policy, Terms of Service, and Data Protection Policy required for app store compliance
- **App_Store**: Apple's iOS application distribution platform
- **Play_Store**: Google's Android application distribution platform
- **Deployment_Environment**: The production server infrastructure where the Backend_API runs
- **Environment_Variables**: Configuration values required for production operation

## Requirements

### Requirement 1

**User Story:** As a platform owner, I want to configure my Hostinger domain with proper DNS records, so that users can access my API and legal documents through professional URLs

#### Acceptance Criteria

1. WHEN the domain is purchased from Hostinger, THE Platform_Owner SHALL configure DNS CNAME record for the API subdomain (api.earn9ja.site) pointing to the Render service URL
2. WHEN configuring DNS, THE Platform_Owner SHALL create a CNAME record for the www subdomain pointing to the root domain
3. WHEN configuring DNS, THE Platform_Owner SHALL create a CNAME record for legal documents subdomain (legal.earn9ja.site) pointing to the Legal_Documents hosting location
4. WHEN DNS records are created, THE Platform_Owner SHALL verify DNS propagation completes within 24 hours
5. WHERE SSL certificates are needed, THE Platform_Owner SHALL configure SSL certificates for all subdomains to enable HTTPS

### Requirement 2

**User Story:** As a platform owner, I want to deploy my backend API to a production server, so that the mobile app can communicate with a reliable and secure API

#### Acceptance Criteria

1. WHEN deploying the Backend_API to Render, THE Deployment_Environment SHALL be configured with all required Environment_Variables through Render's dashboard
2. WHEN the Backend_API starts, THE Backend_API SHALL connect successfully to the production MongoDB Atlas database
3. WHEN the Backend_API starts, THE Backend_API SHALL connect successfully to the production Redis Cloud cache
4. WHEN the Backend_API is running, THE Backend_API SHALL respond to health check requests at the /health endpoint within 2 seconds
5. WHEN the Backend_API is deployed on Render, THE Backend_API SHALL be accessible via HTTPS at https://api.earn9ja.site
6. WHERE the Backend_API encounters errors, THE Backend_API SHALL log errors to Sentry for monitoring
7. WHEN the Backend_API is deployed on Render, THE Render platform SHALL automatically restart the service on failure

### Requirement 3

**User Story:** As a platform owner, I want to host my legal documents on a publicly accessible URL, so that I can comply with app store requirements

#### Acceptance Criteria

1. WHEN hosting Legal_Documents, THE Platform_Owner SHALL publish the Privacy Policy at a publicly accessible HTTPS URL
2. WHEN hosting Legal_Documents, THE Platform_Owner SHALL publish the Terms of Service at a publicly accessible HTTPS URL
3. WHEN hosting Legal_Documents, THE Platform_Owner SHALL publish the Data Protection Policy at a publicly accessible HTTPS URL
4. WHEN Legal_Documents are accessed, THE hosting platform SHALL serve documents within 3 seconds
5. WHERE Legal_Documents are updated, THE Platform_Owner SHALL ensure updated versions are accessible within 5 minutes

### Requirement 4

**User Story:** As a platform owner, I want to configure my mobile app to use the production API endpoint, so that users interact with the live backend system

#### Acceptance Criteria

1. WHEN configuring the Mobile_App for production, THE Platform_Owner SHALL update the EXPO_PUBLIC_API_URL environment variable to point to the production API_Endpoint
2. WHEN the Mobile_App makes API requests, THE Mobile_App SHALL use HTTPS protocol for all communications with the Backend_API
3. WHEN the Mobile_App is built for production, THE Mobile_App SHALL include production AdMob IDs for monetization
4. WHEN the Mobile_App encounters API errors, THE Mobile_App SHALL log errors to Sentry for monitoring
5. WHERE the Mobile_App requires Firebase services, THE Mobile_App SHALL be configured with production Firebase credentials

### Requirement 5

**User Story:** As a platform owner, I want to deploy my mobile app to the Play Store and App Store, so that users can download and install the application

#### Acceptance Criteria

1. WHEN building the Mobile_App for Android, THE Platform_Owner SHALL generate a signed APK or AAB file with incremented version code
2. WHEN building the Mobile_App for iOS, THE Platform_Owner SHALL generate a signed IPA file with incremented version number
3. WHEN submitting to the Play_Store, THE Platform_Owner SHALL provide the Privacy Policy URL in the app listing
4. WHEN submitting to the App_Store, THE Platform_Owner SHALL provide both Privacy Policy and Terms of Service URLs in the app listing
5. WHEN the Mobile_App is submitted, THE Platform_Owner SHALL include app screenshots, descriptions, and required metadata for both stores
6. WHERE the Mobile_App uses sensitive permissions, THE Platform_Owner SHALL provide justification text for permission requests

### Requirement 6

**User Story:** As a platform owner, I want to configure production payment gateways, so that users can make real financial transactions

#### Acceptance Criteria

1. WHEN configuring payment gateways, THE Platform_Owner SHALL replace test API keys with production Paystack keys in Environment_Variables
2. WHEN configuring payment gateways, THE Platform_Owner SHALL replace test API keys with production Flutterwave keys in Environment_Variables
3. WHEN payment webhooks are configured, THE Backend_API SHALL expose webhook endpoints accessible to payment providers
4. WHEN webhook endpoints receive requests, THE Backend_API SHALL verify webhook signatures to ensure authenticity
5. WHERE payment transactions occur, THE Backend_API SHALL log all transaction details for audit purposes

### Requirement 7

**User Story:** As a platform owner, I want to set up monitoring and alerting, so that I can detect and respond to production issues quickly

#### Acceptance Criteria

1. WHEN the Backend_API is deployed, THE Platform_Owner SHALL configure Sentry with production DSN for error tracking
2. WHEN the Mobile_App is deployed, THE Platform_Owner SHALL configure Sentry with production DSN for crash reporting
3. WHEN critical errors occur, THE Backend_API SHALL send alerts to designated administrators within 5 minutes
4. WHEN the Backend_API experiences downtime, THE monitoring system SHALL send notifications to the Platform_Owner
5. WHERE financial anomalies are detected, THE Backend_API SHALL trigger alerts through the AlertService

### Requirement 8

**User Story:** As a platform owner, I want to configure email and SMS services for production, so that users receive notifications and verification messages

#### Acceptance Criteria

1. WHEN configuring email services, THE Platform_Owner SHALL set up production SMTP credentials in Environment_Variables
2. WHEN configuring SMS services, THE Platform_Owner SHALL set up production Twilio credentials in Environment_Variables
3. WHEN the Backend_API sends emails, THE Backend_API SHALL use the production email address (noreply@earn9ja.com) as the sender
4. WHEN users register, THE Backend_API SHALL send verification emails within 30 seconds
5. WHERE SMS verification is required, THE Backend_API SHALL send SMS messages through the production Twilio account

### Requirement 9

**User Story:** As a platform owner, I want to implement database indexes and optimization, so that the production system performs efficiently under load

#### Acceptance Criteria

1. WHEN the production database is initialized, THE Platform_Owner SHALL create indexes on the users collection for email, phoneNumber, and referralCode fields
2. WHEN the production database is initialized, THE Platform_Owner SHALL create indexes on the tasks collection for sponsorId, status, and createdAt fields
3. WHEN the production database is initialized, THE Platform_Owner SHALL create indexes on the tasksubmissions collection for taskId, workerId, and status fields
4. WHEN the production database is initialized, THE Platform_Owner SHALL create indexes on the transactions collection for userId and createdAt fields
5. WHERE database queries are executed, THE Backend_API SHALL utilize indexes to ensure query response times under 100ms for indexed queries

### Requirement 10

**User Story:** As a platform owner, I want to implement a rollback procedure, so that I can quickly revert to a previous version if deployment issues occur

#### Acceptance Criteria

1. WHEN deploying the Backend_API, THE Platform_Owner SHALL create a database backup before applying changes
2. WHEN deployment issues are detected, THE Platform_Owner SHALL be able to restore the previous Backend_API version within 15 minutes
3. WHEN database rollback is needed, THE Platform_Owner SHALL be able to restore from backup within 30 minutes
4. WHERE the Mobile_App requires rollback, THE Platform_Owner SHALL be able to promote a previous version in the Play_Store within 2 hours
5. WHEN rollback is executed, THE Platform_Owner SHALL document the reason and actions taken for future reference
