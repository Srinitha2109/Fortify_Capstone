# API Endpoints Documentation

## Authentication Controller (`/api/auth`)

### POST `/api/auth/login`
Authenticates users with email and password credentials.
Returns JWT token and user details for successful login.

### POST `/api/auth/request-registration` (Public)
Submits new user registration request for admin approval.
Allows anyone to request account creation with role specification.

---

## User Controller (`/api/users`)

### POST `/api/users`
Creates a new user account in the system.
Accepts user details and returns the created user information.

### GET `/api/users/{id}`
Retrieves user information by their unique ID.
Returns user details or 404 if user not found.

### GET `/api/users`
Fetches all users registered in the system.
Returns complete list of users with their details.

### PUT `/api/users/{id}`
Updates existing user information by ID.
Modifies user details and returns updated information.

### DELETE `/api/users/{id}`
Removes a user account from the system.
Permanently deletes user and returns no content.

---

## Agent Controller (`/api/agents`)

### POST `/api/agents` (Admin only)
Creates a new insurance agent profile.
Registers agent with specialization and contact details.

### GET `/api/agents/{id}` (Admin/Agent)
Retrieves specific agent information by ID.
Returns agent profile including specialization and status.

### GET `/api/agents` (Admin only)
Lists all registered insurance agents.
Returns complete agent directory with their details.

### GET `/api/agents/applications` (Agent only)
Fetches policy applications assigned to specific agent.
Returns list of applications managed by the agent.

### PUT `/api/agents/applications/{id}/submit` (Agent only)
Submits policy application to underwriter for review.
Changes application status from draft to submitted.

---

## Underwriter Controller (`/api/underwriter`)

### POST `/api/underwriter` (Admin only)
Creates new underwriter profile in the system.
Registers underwriter with expertise and authorization levels.

### GET `/api/underwriter` (Admin only)
Lists all registered underwriters.
Returns complete underwriter directory with specializations.

### GET `/api/underwriter/{id}` (Admin/Underwriter)
Retrieves specific underwriter information by ID.
Returns underwriter profile and current workload.

### PUT `/api/underwriter/applications/{id}/assign` (Admin only)
Assigns policy application to specific underwriter.
Links application with underwriter for review process.

### PUT `/api/underwriter/applications/{id}/approve` (Underwriter only)
Approves policy application with start/end dates.
Changes status to approved and sets policy duration.

### PUT `/api/underwriter/applications/{id}/reject` (Underwriter only)
Rejects policy application with rejection reason.
Updates status to rejected and records reason.

### PUT `/api/underwriter/applications/{id}/review` (Underwriter only)
Marks policy application as under review.
Changes status to indicate active review process.

---

## Policy Controller (`/api/policies`)

### POST `/api/policies` (Admin only)
Creates new insurance policy template.
Defines policy terms, coverage, and premium structure.

### GET `/api/policies/{id}`
Retrieves specific policy details by ID.
Returns complete policy information and terms.

### GET `/api/policies`
Lists all available insurance policies.
Returns catalog of policies with basic information.

### GET `/api/policies/active`
Fetches only currently active policies.
Returns policies available for new applications.

### GET `/api/policies/insurance-type/{insuranceTypeId}`
Lists policies filtered by insurance type.
Returns policies matching specific insurance category.

---

## Policy Application Controller (`/api/policy-applications`)

### POST `/api/policy-applications` (Policyholder only)
Creates new policy application request.
Submits application with personal and coverage details.

### GET `/api/policy-applications/{id}` (Multiple roles)
Retrieves specific application details by ID.
Returns application status and processing information.

### GET `/api/policy-applications/user/{userId}` (Policyholder/Admin)
Lists applications submitted by specific user.
Returns user's application history and status.

### GET `/api/policy-applications/agent/{agentId}` (Agent only)
Fetches applications assigned to specific agent.
Returns agent's current application workload.

### PUT `/api/policy-applications/{id}` (Admin/Underwriter)
Updates existing policy application details.
Modifies application information and status.

### PUT `/api/policy-applications/{id}/assign-agent` (Admin only)
Assigns insurance agent to policy application.
Links application with agent for assistance.

### PUT `/api/policy-applications/{id}/submit-to-underwriter` (Agent only)
Forwards application to underwriter for approval.
Changes status from agent review to underwriter queue.

### PUT `/api/policy-applications/{id}/activate` (Admin only)
Activates approved policy application.
Changes status from approved to active policy.

---

## Policyholder Controller (`/api/policyholder`)

### POST `/api/policyholder/policies/search`
Searches available policies with filtering criteria.
Returns policies matching specified search parameters.

### GET `/api/policyholder/policies/{id}`
Retrieves detailed information about specific policy.
Returns policy terms, coverage, and premium details.

### POST `/api/policyholder/apply`
Submits new policy application request.
Creates application with personal and coverage information.

### GET `/api/policyholder/my-applications/{userId}`
Lists all applications submitted by user.
Returns user's application history with current status.

---

## Business Profile Controller (`/api/business-profiles`)

### POST `/api/business-profiles`
Creates business profile for commercial insurance.
Registers business details for policy applications.

### GET `/api/business-profiles/user/{userId}`
Retrieves business profile associated with user.
Returns business information and registration details.

### PUT `/api/business-profiles/{id}`
Updates existing business profile information.
Modifies business details and contact information.

---

## Claim Controller (`/api/claims`)

### POST `/api/claims` (Policyholder only)
Creates new insurance claim request.
Submits claim with incident details and documentation.

### PUT `/api/claims/{id}/assign-officer` (Admin only)
Assigns claim officer to process claim.
Links claim with officer for investigation.

### PUT `/api/claims/{id}/approve` (Claim Officer only)
Approves claim for payment processing.
Changes status to approved and initiates payment.

### PUT `/api/claims/{id}/reject` (Claim Officer only)
Rejects claim with documented reason.
Updates status to rejected with explanation.

### GET `/api/claims/{id}` (Multiple roles)
Retrieves specific claim details by ID.
Returns claim information and processing status.

### GET `/api/claims/policy-application/{policyApplicationId}` (Policyholder/Admin)
Lists claims associated with specific policy.
Returns claim history for policy application.

### GET `/api/claims/claim-officer/{claimOfficerId}` (Claim Officer only)
Fetches claims assigned to specific officer.
Returns officer's current claim workload.

### PUT `/api/claims/{id}`
Updates existing claim information.
Modifies claim details and documentation.

---

## Claim Officer Controller (`/api/claim-officers`)

### POST `/api/claim-officers` (Admin only)
Creates new claim officer profile.
Registers officer with expertise and authorization.

### GET `/api/claim-officers/{id}` (Admin/Claim Officer)
Retrieves specific claim officer information.
Returns officer profile and current assignments.

### GET `/api/claim-officers` (Admin only)
Lists all registered claim officers.
Returns complete officer directory with details.

---

## Claim Document Controller (`/api/claim-documents`)

### POST `/api/claim-documents`
Uploads supporting documents for claims.
Attaches evidence and documentation to claim.

### GET `/api/claim-documents/claim/{claimId}`
Retrieves all documents associated with claim.
Returns list of uploaded claim documentation.

---

## Payment Controller (`/api/payments`)

### POST `/api/payments` (Policyholder/Admin)
Creates new payment record for premiums.
Processes payment for policy or claim settlement.

### GET `/api/payments/{id}` (Multiple roles)
Retrieves specific payment details by ID.
Returns payment information and transaction status.

### GET `/api/payments/policy-application/{policyApplicationId}` (Multiple roles)
Lists payments associated with policy application.
Returns payment history for specific policy.

---

## Insurance Type Controller (`/api/insurance-types`)

### POST `/api/insurance-types`
Creates new insurance category or type.
Defines new insurance product category.

### GET `/api/insurance-types/{id}`
Retrieves specific insurance type details.
Returns category information and available policies.

### GET `/api/insurance-types`
Lists all insurance categories available.
Returns complete catalog of insurance types.

### GET `/api/insurance-types/active`
Fetches only currently active insurance types.
Returns categories available for new policies.

---

## Policy Document Controller (`/api/policy-documents`)

### POST `/api/policy-documents`
Uploads policy-related documents and files.
Attaches documentation to policy applications.

### GET `/api/policy-documents/policy-application/{policyApplicationId}`
Retrieves documents associated with policy application.
Returns list of uploaded policy documentation.

---

## Registration Request Controller (`/api/admin`)

### GET `/api/admin/registration-requests` (Admin only)
Retrieves all pending registration requests for review.
Returns list of users waiting for account approval.

### PATCH `/api/admin/registration-requests/{id}/approve` (Admin only)
Approves pending registration request and creates user account.
Activates new user with temporary password and requested role.

### PATCH `/api/admin/registration-requests/{id}/reject` (Admin only)
Rejects registration request with admin remarks.
Declines account creation and records rejection reason.

---

## Security Notes

- Most endpoints require JWT authentication
- Role-based access control is enforced
- Admin has access to all management functions
- Users can only access their own data
- Sensitive operations require specific roles
- Registration requests are public but require admin approval