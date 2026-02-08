# Fix Expert Profile & Add Password Management

## Goal Description
1.  **Fix Expert Profile Crash**: Address potential client-side exceptions in `ExpertProfile.tsx` (likely data access issues) and ensure robust property handling.
2.  **Enhance Expert Profile Editing**: Allow experts to edit their Bio, Phone Number, and Password (Email remains read-only).
3.  **Client Security Settings**: Add a "Security" tab to `ClientSettings.tsx` to allow clients to change their password.

## Proposed Changes

### Frontend

#### [MODIFY] [ExpertProfile.tsx](file:///C:/Users/sala7/.gemini/antigravity/playground/finume/easy-ux/src/frontend/pages/expert/ExpertProfile.tsx)
-   **Safe Data Initialization**: Ensure `formData` initialization handles `null` or `undefined` properties safely.
-   **New Fields**:
    -   Add **Phone Number** input field.
    -   Add **Reference Link/Linkedin** input field (as it's in the viewer).
    -   Add **Password Management Section**:
        -   New Password input.
        -   Confirm Password input.
-   **Logic**:
    -   Update `handleSubmit` to verify password match (if provided) and include it in the API payload.
    -   Add `mobileNumber` and `linkedinUrl` to `updateExpert` call.
-   **Fix**: Wrap `specializations` logic in try-catch or safer checks to prevent render crashes.

#### [MODIFY] [ClientSettings.tsx](file:///C:/Users/sala7/.gemini/antigravity/playground/finume/easy-ux/src/frontend/pages/client/ClientSettings.tsx)
-   **Tab Navigation**: Add `SECURITY` tab before `NOTIFICATIONS`.
-   **Security Section**:
    -   Create a password change form (New Password, Confirm Password).
-   **Logic**:
    -   Handle password update via `updateClient` (mapped to `PATCH /api/users/:id` which handles `password`).

## Verification Plan

### Manual Verification
1.  **Expert Profile**:
    -   Login as Expert.
    -   Navigate to `Expert > My Profile`. Verify page loads without crash.
    -   Edit Bio, Phone, Specializations. Save and verify.
    -   Change Password. Logout and Login with new password.
2.  **Client Settings**:
    -   Login as Client.
    -   Navigate to `Settings > Security`.
    -   Change Password. Logout and Login with new password.
