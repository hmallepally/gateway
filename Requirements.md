# API Gateway and Configuration Management System Requirements Document

## 1. Introduction

This document outlines the detailed requirements for an API Gateway and Configuration Management System. The primary purpose of this system is to act as an intermediary for requests destined for Fico PLOR and DM platform solutions, enabling version-based routing and addressing limitations regarding configurable parameters and caching. Additionally, it will provide a user-friendly interface for managing these configurations and tracking changes with an audit trail and approval workflow.

The current Fico platform solution involves multiple versions, each associated with a specific Fico PLOR environment/URL. Downstream systems require a unified entry point, and the Fico PLOR platform lacks built-in caching for configurable parameters, leading to potential performance bottlenecks. This system aims to resolve these challenges by providing intelligent routing, a high-performance caching mechanism for configurable parameters, and a robust administration interface.

## 2. Goals and Objectives

* To provide a centralized API Gateway for Fico PLOR/DM platform solutions.
* To enable dynamic routing of requests to appropriate Fico PLOR URLs based on the `bomVersionId` in the request.
* To implement a high-performance caching mechanism for Fico PLOR configurable parameters.
* To provide a secure and intuitive web-based interface for managing configurable parameters and Fico environment URLs.
* To maintain a comprehensive audit log of all configuration changes with an approval workflow.
* To integrate with Microsoft OIDC SSO for user authentication in the management UI.

## 3. Scope

This document covers the functional and non-functional requirements for the API Gateway, the configuration database, the logging mechanism, and the administrative frontend.

**In Scope:**
* API Gateway for request routing.
* Database for caching configurable parameters.
* Database for Fico environment URL configurations.
* Logging/Audit table for configuration changes.
* Web-based UI for managing configurations (create, read, update, approve).
* Microsoft OIDC SSO integration for UI authentication.
* Basic error handling and logging within the gateway and UI.

**Out of Scope:**
* Development or modification of the core Fico PLOR/DM platform.
* Detailed security audits beyond OIDC integration.
* Complex load balancing (beyond what a simple gateway provides).
* Advanced monitoring and alerting (basic logging will be included).
* User management within the application (relying on SSO for identity).

## 4. Functional Requirements

### 4.1. API Gateway (Core Logic)

* **FR-AG-001**: The API Gateway SHALL accept incoming API requests from downstream systems.
* **FR-AG-002**: The API Gateway SHALL parse the incoming request body to extract the `bomVersionId` field.
  * **Sample Request Structure**:
    ```json
    [
      {
        "name": "some_field",
        "value": {
          "bomVersionId": "1.x",
          "application": {
            "productCode": "PROD_A",
            "subProductCode": "SUB_PROD_1"
          },
          ...
        }
      }
    ]
    ```
* **FR-AG-003**: The API Gateway SHALL retrieve the corresponding Fico PLOR `url` and `authentication_url` for the extracted `bomVersionId` from the "Fico Environment Configuration" database.
* **FR-AG-004**: The API Gateway SHALL route the incoming request to the retrieved Fico PLOR `url`.
* **FR-AG-005**: The API Gateway SHALL handle authentication to the Fico PLOR environment using the retrieved `clientId` and `secret` from the "Fico Environment Configuration" database. This typically involves an initial call to the `authentication_url` to obtain a token, then using that token for subsequent calls to the main `url`.
* **FR-AG-006**: The API Gateway SHALL forward the response from the Fico PLOR URL back to the original downstream system.
* **FR-AG-007**: The API Gateway SHALL log all incoming requests and outgoing responses (metadata, e.g., timestamp, `bomVersionId`, success/failure status, routing path) for auditing and troubleshooting purposes.
* **FR-AG-008**: The API Gateway SHALL handle network errors and timeouts when communicating with Fico PLOR, returning appropriate error messages to the downstream system.

### 4.2. Configurable Parameters Caching Mechanism

* **FR-CPC-001**: The system SHALL maintain a database table for configurable parameters with the following structure:
    * `productId` (String, indexed)
    * `subproductId` (String, indexed)
    * `component` (String)
    * `parameter` (String)
    * `value` (String)
    * `effective_from` (Date/Timestamp)
    * `effective_to` (Date/Timestamp, nullable)
    * `created_by` (String)
    * `created_on` (Timestamp)
    * `last_updated_by` (String, nullable)
    * `last_updated_on` (Timestamp, nullable)
* **FR-CPC-002**: The API Gateway SHALL check the "Configurable Parameters" database for relevant parameters based on `productId` and `subproductId` extracted from the incoming request.
* **FR-CPC-003**: If configurable parameters are found in the database, the API Gateway SHALL use these cached values to augment or modify the request to Fico PLOR, preventing redundant calls to Fico for static configuration data.
* **FR-CPC-004**: The system SHALL support effective dating for parameters, ensuring only parameters whose `effective_from` is in the past and `effective_to` is in the future (or null) are considered active.

### 4.3. Fico Environment Configuration Management

* **FR-FEC-001**: The system SHALL maintain a database table for Fico environment configurations with the following structure:
    * `productCode` (String, indexed)
    * `version` (String, indexed)
    * `url` (String)
    * `authentication_url` (String)
    * `clientId` (String, sensitive, encrypted at rest)
    * `secret` (String, sensitive, encrypted at rest)
    * `created_by` (String)
    * `created_on` (Timestamp)
    * `last_updated_by` (String, nullable)
    * `last_updated_on` (Timestamp, nullable)
* **FR-FEC-002**: The UI SHALL allow authorized users to create new Fico environment configurations.
* **FR-FEC-003**: The UI SHALL allow authorized users to view existing Fico environment configurations.
* **FR-FEC-004**: The UI SHALL allow authorized users to update existing Fico environment configurations.

### 4.4. Change History (Audit Log)

* **FR-CH-001**: The system SHALL maintain a `log` database table to record every change made to both "Configurable Parameters" and "Fico Environment Configuration" tables.
* **FR-CH-002**: The `log` table SHALL capture the following information for each change:
    * `log_id` (Primary Key)
    * `table_name` (e.g., "Configurable_Parameters", "Fico_Environments")
    * `record_id` (ID of the changed record in the respective table)
    * `field_name` (The specific field that was changed)
    * `old_value` (Previous value of the field)
    * `new_value` (New value of the field)
    * `changed_by` (User who initiated the change)
    * `change_timestamp` (When the change was made)
    * `status` (e.g., "Pending Approval", "Approved", "Rejected")
    * `reviewed_by` (User who reviewed the change, nullable)
    * `review_timestamp` (When the review occurred, nullable)
    * `approved_by` (User who approved the change, nullable)
    * `approval_timestamp` (When the approval occurred, nullable)
* **FR-CH-003**: The UI SHALL provide a comprehensive view of the change history for both configuration types.

### 4.5. Frontend Management UI

* **FR-UI-001**: The UI SHALL provide separate sections for "Configurable Parameters" management and "Fico Environment Configuration" management.
* **FR-UI-002**: For "Configurable Parameters" management:
    * **FR-UI-002.1**: The UI SHALL display a list of all configurable parameters, with pagination, sorting, and filtering capabilities.
    * **FR-UI-002.2**: The UI SHALL allow users to add new configurable parameters, specifying all fields (productId, subproductId, component, parameter, value, effective_from, effective_to).
    * **FR-UI-002.3**: The UI SHALL allow users to modify existing configurable parameters. Upon modification, the change SHALL be recorded in the `log` table with a "Pending Approval" status.
    * **FR-UI-002.4**: The UI SHALL provide a dedicated "Review & Approval" workflow for changes to configurable parameters. An "approver" role SHALL be able to review pending changes (view old and new values) and either "Approve" or "Reject" them.
    * **FR-UI-002.5**: Only "Approved" changes to configurable parameters SHALL become active and visible to the API Gateway.
* **FR-UI-003**: For "Fico Environment Configuration" management:
    * **FR-UI-003.1**: The UI SHALL display a list of all Fico environment configurations, with pagination, sorting, and filtering capabilities.
    * **FR-UI-003.2**: The UI SHALL allow users to add new Fico environment configurations, specifying all fields (productCode, version, url, authentication_url, clientId, secret).
    * **FR-UI-003.3**: The UI SHALL allow users to modify existing Fico environment configurations. Upon modification, the change SHALL be recorded in the `log` table with a "Pending Approval" status.
    * **FR-UI-003.4**: The UI SHALL provide a dedicated "Review & Approval" workflow for changes to Fico environment configurations. An "approver" role SHALL be able to review pending changes (view old and new values) and either "Approve" or "Reject" them.
    * **FR-UI-003.5**: Only "Approved" changes to Fico environment configurations SHALL become active and visible to the API Gateway.
* **FR-UI-004**: The UI SHALL provide a "Change History" view, allowing users to filter and search through the `log` table, showing who made what change, when, and its current approval status, including who reviewed/approved.

### 4.6. Authentication and Authorization (UI)

* **FR-AUTH-001**: The Frontend UI SHALL integrate with Microsoft OIDC SSO for user authentication.
* **FR-AUTH-002**: Only authenticated users SHALL be able to access the management UI.
* **FR-AUTH-003**: The system SHALL support at least two roles:
    * `Editor`: Can create and modify configurable parameters and Fico environment configurations, but cannot approve changes.
    * `Approver`: Can review and approve/reject changes made by `Editors` (and possibly their own changes, though this should be carefully considered to prevent self-approvals for critical changes). `Approver` also has `Editor` capabilities.
* **FR-AUTH-004**: Role-based access control (RBAC) SHALL be enforced throughout the UI to ensure users can only perform actions authorized by their assigned role.

## 5. Non-Functional Requirements

### 5.1. Performance

* **NFR-PERF-001**: The API Gateway SHALL respond to requests within 100ms for 95% of requests under normal load.
* **NFR-PERF-002**: Database queries for configurable parameters and environment URLs SHALL return results within 20ms for 99% of requests.
* **NFR-PERF-003**: The UI for listing configurations SHALL load within 2 seconds with up to 1000 records.

### 5.2. Scalability

* **NFR-SCAL-001**: The API Gateway should be designed to scale horizontally to handle increased request volumes.
* **NFR-SCAL-002**: The database should be chosen and configured to support anticipated growth in configuration data and audit logs.

### 5.3. Security

* **NFR-SEC-001**: All sensitive information (e.g., `clientId`, `secret`) stored in the database SHALL be encrypted at rest.
* **NFR-SEC-002**: All communication between the API Gateway and Fico PLOR SHALL use HTTPS.
* **NFR-SEC-003**: All communication between the UI and the backend SHALL use HTTPS.
* **NFR-SEC-004**: The system SHALL protect against common web vulnerabilities (e.g., XSS, CSRF, SQL Injection).
* **NFR-SEC-005**: User sessions for the UI SHALL be securely managed (e.g., using secure, http-only cookies).

### 5.4. Reliability and Availability

* **NFR-REL-001**: The API Gateway SHALL have at least 99.9% uptime.
* **NFR-REL-002**: The system SHALL implement proper error handling and retry mechanisms for external API calls (e.g., to Fico PLOR).
* **NFR-REL-003**: Data integrity SHALL be maintained across all database operations.

### 5.5. Maintainability

* **NFR-MAINT-001**: The codebase SHALL be well-documented and follow established coding standards (e.g., PEP 8 for Python, Java Code Conventions for Java).
* **NFR-MAINT-002**: The system architecture SHALL be modular to facilitate future enhancements and bug fixes.
* **NFR-MAINT-003**: Logging SHALL be comprehensive enough for debugging and operational monitoring.

### 5.6. Usability (UI)

* **NFR-USAB-001**: The UI SHALL be intuitive and easy to navigate for users with basic technical proficiency.
* **NFR-USAB-002**: Data entry forms SHALL include validation to prevent incorrect data submission.
* **NFR-USAB-003**: Feedback SHALL be provided to the user for all actions (e.g., success messages, error messages, loading indicators).

## 6. Technical Architecture Considerations

The system will broadly consist of three main components:

1.  **API Gateway Backend**:
    * **Language**: Python (e.g., Flask/FastAPI) or Java (e.g., Spring Boot).
    * **Functionality**: Request parsing, routing logic, Fico authentication, interaction with configuration database.
    * **Deployment**: Containerized (Docker) for easy deployment and scaling.

2.  **Database**:
    * **Type**: Relational Database (e.g., PostgreSQL, MySQL) for structured data and ACID properties.
    * **Schemas**:
        * `Fico_Environment_Config`: For `productCode`, `version`, `url`, `authentication_url`, `clientId`, `secret`. `clientId` and `secret` will require encryption at rest.
        * `Configurable_Parameters`: For `productId`, `subproductId`, `component`, `parameter`, `value`, `effective_from`, `effective_to`, and audit fields.
        * `Change_Log`: For `log_id`, `table_name`, `record_id`, `field_name`, `old_value`, `new_value`, `changed_by`, `change_timestamp`, `status`, `reviewed_by`, `review_timestamp`, `approved_by`, `approval_timestamp`.

3.  **Frontend Management UI**:
    * **Framework**: React (preferred for modern web applications) or Angular/Vue.
    * **Communication**: RESTful API calls to the API Gateway Backend for CRUD operations on configurations.
    * **Authentication**: Integration with Microsoft OIDC SSO for secure login.
    * **Styling**: Use a responsive design framework (e.g., Tailwind CSS, Bootstrap).

## 7. UI/UX Considerations

### 7.1. General Layout and Navigation

* Clear, consistent navigation (e.g., sidebar or top bar) with links to "Configurable Parameters," "Fico Environments," and "Change History."
* Dashboard/Landing page providing an overview (e.g., pending approvals count).

### 7.2. Configurable Parameters Management

* **Table View**:
    * Display `productId`, `subproductId`, `component`, `parameter`, `value`, `effective_from`, `effective_to`.
    * Search/Filter by any of these fields.
    * Sortable columns.
    * Actions: "Edit," "View History."
* **Add/Edit Form**:
    * Clear input fields for all parameters.
    * Date pickers for `effective_from` and `effective_to`.
    * Validation for required fields and date formats.
    * "Submit for Approval" button for changes.

### 7.3. Fico Environment Configuration Management

* **Table View**:
    * Display `productCode`, `version`, `url`.
    * Search/Filter by `productCode` or `version`.
    * Actions: "Edit," "View History."
* **Add/Edit Form**:
    * Clear input fields for `productCode`, `version`, `url`, `authentication_url`, `clientId`, `secret`.
    * Masking for `clientId` and `secret` input fields (e.g., show as asterisks).
    * "Submit for Approval" button for changes.

### 7.4. Change History View

* **Table View**:
    * Display `table_name`, `record_id`, `field_name`, `old_value`, `new_value`, `changed_by`, `change_timestamp`, `status`, `reviewed_by`, `review_timestamp`, `approved_by`, `approval_timestamp`.
    * Filter by `table_name`, `status`, `changed_by`, date range.
    * Option to view details of a specific change (e.g., side-by-side comparison of old vs. new values for the entire record).
* **Review & Approval Section (for Approver Role)**:
    * Dedicated section showing only "Pending Approval" changes.
    * For each pending change, show detailed old and new values.
    * "Approve" and "Reject" buttons, prompting for optional comments.

### 7.5. Authentication UI

* Dedicated login page for Microsoft OIDC SSO.
* Clear prompts for login.
* Error messages for failed authentication.

## 8. Future Considerations (Out of Scope for Initial Phase)

* **Advanced Monitoring**: Integration with monitoring tools (e.g., Prometheus, Grafana) for gateway performance, error rates, and Fico API health checks.
* **Alerting**: Notifications for critical errors or abnormal behavior.
* **Version Control for Configs**: Beyond simple audit logs, potentially integrate with a source control system for configuration versions.
* **Multi-tenancy**: If different business units need separate configurations and access.
* **Bulk Upload/Download**: Feature for managing large sets of configurable parameters.
* **CI/CD Pipeline**: Automate deployment of gateway and UI components.
