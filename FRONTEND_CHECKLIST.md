# HEDHI Frontend Completion Checklist

This file tracks the remaining product work before backend integration. Checkboxes are updated as features are implemented and verified.

## Completed foundation

- [x] Onboarding and local profile setup
- [x] Home cycle summary and daily mood entry points
- [x] Daily check-in for flow, mood, symptoms, pain, energy, sleep, discharge, and notes
- [x] Calendar with recorded and predicted cycle dates
- [x] Period history and editing
- [x] Basic trends and insights
- [x] Local SQLite persistence
- [x] Local reminders
- [x] Device privacy lock
- [x] English and Kiswahili localization
- [x] Local JSON export
- [x] Initial native emoji mood pass (superseded by the SVG mood set below)
- [x] Replace emoji moods with a consistent, brand-tinted SVG mood set

## Frontend completion — priority 1

- [x] Replace typed date fields with native date pickers
- [x] Replace reminder-hour input with a native time picker
- [x] Add a read-only day detail page
- [x] Link Calendar and History entries to day details
- [x] Add start/end period shortcuts from Home and Calendar
- [x] Add Privacy, Help, and Medical Disclaimer content
- [x] Standardize success, warning, error, and empty feedback states

## Frontend completion — priority 2

- [x] Add a cycle detail page with prediction explanation and confidence
- [x] Add local JSON import and restore
- [x] Add date-range and category filters to Insights
- [x] Show notification permission and scheduling status
- [x] Add screen-reader labels and selected/disabled control states
- [x] Add controlled Dynamic Type support to shared text and inputs
- [ ] Complete user-led contrast and tap-target review on physical devices

## Release polish

- [ ] Add final application icon and splash screen
- [ ] Replace placeholder artwork and copy
- [ ] Record creator, source URL, and license details for supplied mood icons
- [x] Display the installed application version dynamically
- [ ] Add frontend flow tests for onboarding, logging, editing, deletion, and restore
- [ ] Review npm dependency audit findings before release
- [ ] Verify layouts on supported iOS and Android device sizes
- [ ] Final user-led visual review

## Backend phase

- [ ] Authentication and account recovery
- [ ] Encrypted cloud synchronization
- [ ] Multi-device backup and restore
- [ ] Server-side account and data deletion
- [ ] Push notification delivery infrastructure
- [ ] Server-backed insights or content, if required
- [ ] Privacy policy and consent records hosted by the production service

## Progress log

### 2026-09-13

- Replaced custom mood illustrations with native emoji.
- Added native date and time controls using Expo UI for SDK 57.
- Added Day Details and linked Calendar and History records to it.
- Added start/end period shortcuts and selected-date period creation.
- Added Help, Privacy, Safety, and medical disclaimer content.
- Added Cycle Details with estimate basis and confidence.
- Added validated JSON restore with atomic rollback on database errors.
- Added Insights range/category filters and reminder permission status.
- Standardized feedback banners and improved shared accessibility behavior.
- Added restore and rollback coverage to the local database tests.
- Replaced system emoji moods with the supplied SVG set and centralized runtime tinting.
