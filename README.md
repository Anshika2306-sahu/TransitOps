# TransitOps: Smart Transport Operations Platform

TransitOps is a comprehensive, full-stack fleet management and dispatch platform designed to bridge the gap between central dispatchers and mobile drivers. Built with a highly scalable architecture and a modern glassmorphism UI, it provides real-time visibility and control over fleet operations.

## Core Features & Capabilities

### 1. Central Dispatch Dashboard
- Centralized command center with real-time KPI tracking and analytics.
- Instant visibility into active vehicles, available vehicles, maintenance states, and active trips.
- Dynamic filtering and live search capabilities for rapid resource allocation.

### 2. Live Fleet & Trip Management
- Complete CRUD operations for vehicles, drivers, and trips.
- Instantly assign drivers to available vehicles and dispatch trips.
- Real-time trip status tracking (Draft, Dispatched, On Trip, Completed).
- Automatic resource reallocation (e.g., closing a maintenance log automatically returns a truck to the available fleet).

### 3. Mobile Driver Portal
- Secure, lightweight mobile web-app for on-the-go drivers.
- Frictionless authentication using strict License Number validation.
- Drivers are automatically dropped into their active, assigned trip manifest upon login.

### 4. Real-Time Emergency SOS & GPS Tracking
- Live location tracking with automatic fallbacks to IP-Geolocation if hardware GPS is blocked or unavailable.
- One-click Emergency SOS system on the Driver Portal.
- Instant visual alerts on the dispatcher's live map (transforming vehicle pins to flashing red alerts) when an SOS is triggered in the field.

### 5. Maintenance & Expense Tracking
- End-to-end logging for vehicle maintenance and service costs.
- Intelligent state management: Logging a service automatically updates the vehicle's fleet status to "In Shop" preventing accidental dispatching.

### 6. Role-Based Access Control & Security
- Secure authentication system distinguishing between Fleet Managers (Dispatch) and Drivers.
- JWT-based session management for secure data fetching and API protection.

## Technology Stack
- Frontend: React.js, Tailwind CSS (Custom Glassmorphism Design System), Leaflet (Maps)
- Backend: Node.js, Express.js
- Database: PostgreSQL
- Geolocation: HTML5 Geolocation API with live IP-API Fallback
