# Enterprise Authentication System Documentation

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Installation & Setup](#installation--setup)
5. [API Reference](#api-reference)
6. [Frontend Components](#frontend-components)
7. [Security Features](#security-features)
8. [Background Jobs](#background-jobs)
9. [Configuration](#configuration)
10. [Testing](#testing)
11. [Deployment](#deployment)
12. [Troubleshooting](#troubleshooting)

---

## Overview

This enterprise-grade authentication system provides comprehensive security features including two-factor authentication, session management, device trust, GDPR compliance, and advanced account security measures.

### Key Statistics

- **50+ Files**: Complete backend and frontend implementation
- **40+ API Endpoints**: RESTful API with comprehensive coverage
- **8 Frontend Pages**: Modern React/TypeScript UI
- **4 Background Jobs**: Automated maintenance and cleanup
- **100% GDPR Compliant**: Full data privacy and export capabilities

### Technology Stack

**Backend:**
- Node.js + Express.js
- MongoDB (Mongoose ODM)
- Redis (Session & Rate Limiting)
- JWT Authentication
- Speakeasy (2FA/TOTP)

**Frontend:**
- React 18 + TypeScript
- TanStack Query (React Query)
- TailwindCSS + DaisyUI
- Vite Build Tool

---

## Features

### Phase 1: Core Security Features

#### 1. Two-Factor Authentication (2FA)
- TOTP-based authentication using authenticator apps
- QR code generation for easy setup
- 10 backup codes per user
- Backup code regeneration
- Optional 2FA enforcement

#### 2. Account Lockout Protection
- Automatic lockout after 5 failed login attempts
- 15-minute lockout duration
- Admin unlock capability
- Failed attempt tracking and logging

#### 3. IP-Based Rate Limiting
- Redis-backed rate limiting
- Configurable limits per endpoint
- IP whitelist support for trusted IPs
- Rate limit violation logging
- Automatic cleanup of old violations

### Phase 2: Session & Device Management

#### 4. Multi-Device Session Management
- Track all active sessions across devices
- Session metadata (device, browser, location, IP)
- Individual session termination
- "Terminate all other sessions" feature
- Automatic session expiry (30 days)

#### 5. Device Trust System
- Remember trusted devices for 90 days
- Device fingerprinting
- Trust revocation capability
- Suspicious activity detection
- Email notifications for new devices

#### 6. Activity Logging
- Comprehensive audit trail
- Login/logout tracking
- Security event logging
- IP and device information
- Exportable activity history

### Phase 3: GDPR & Privacy Features

#### 7. Password Security Policies
- Configurable password expiry (90 days default)
- Password strength requirements
- Password history (prevent reuse of last 5)
- Force password change capability
- Automated expiry notifications

#### 8. Account Management
- Account deactivation (reversible)
- Account deletion with 30-day grace period
- Deletion cancellation
- Account status tracking
- Automated cleanup jobs

#### 9. Data Export (GDPR)