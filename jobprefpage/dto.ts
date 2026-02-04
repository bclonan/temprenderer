/**
 * Step mapping (matches wizard / stepper order):
 * 1 = Profile
 * 2 = Job Details
 * 3 = Visibility
 */
export type JobPreferencesStep = 1 | 2 | 3;

/**
 * Multi-select options
 * Keep these as string unions so:
 * - VB enums
 * - SQL lookup tables
 * - JSON payloads
 * all stay aligned
 */
export type ShiftOption =
    | "Day"
    | "Evening"
    | "Night"
    | "Rotation"
    | "Weekend";

export type JobTypeOption =
    | "FullTime"
    | "PartTime"
    | "Internship"
    | "TemporarySeasonal";

export type WorkModeOption =
    | "InPerson"
    | "Hybrid"
    | "Remote"
    | "Travel";

/**
 * Main DTO for the Job Preferences screen
 * This is the single source of truth for:
 * - Page load
 * - Save
 * - Navigation between steps
 */
export interface JobPreferencesDto {
    /* -----------------------------
     // Wizard / Stepper
     * ----------------------------- */
    currentStep: JobPreferencesStep;

    /* -----------------------------
     // Job Details (chip selectors)
     * ----------------------------- */
    preferredShifts: ShiftOption[];   // multi-select
    jobTypes: JobTypeOption[];        // multi-select
    workModes: WorkModeOption[];      // multi-select

    /* -----------------------------
     // Location Preferences
     * ----------------------------- */
    zipCode: string;                  // required
    radiusMiles: number | null;       // required (dropdown)

    /* -----------------------------
     * Relocation
     * ----------------------------- */
    willingToRelocate: boolean | null; // required yes/no

    /* -----------------------------
     // Validation / Server Helper
     * ----------------------------- */
    isComplete: boolean;              // computed server-side or client-side
}

// Job 
export interface JobPreferencesPageLoadResponse {
    dto: JobPreferencesDto;

    // Server-driven config
    radiusOptions: number[]; // e.g. [5, 10, 25, 50, 100]
}

export interface SaveJobPreferencesRequest {
    dto: JobPreferencesDto;
}

export interface SaveJobPreferencesResponse {
    success: boolean;
    message?: string;
    dto?: JobPreferencesDto; // normalized / echoed back
}
