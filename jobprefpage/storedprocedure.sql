/* =========================================================
   Job Preferences – Access Stored Procedures
   Assumes existing tables + TVP types

   Tables assumed:
     dbo.UserJobPreferences
     dbo.UserJobPreferenceShift
     dbo.UserJobPreferenceJobType
     dbo.UserJobPreferenceWorkMode
     dbo.JobRadiusOption

   TVP types assumed:
     dbo.TVP_ShiftCode
     dbo.TVP_JobTypeCode
     dbo.TVP_WorkModeCode
   ========================================================= */

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

/* =========================================================
   Page Load
   Returns:
     1) Main preferences row
     2) Selected shift codes
     3) Selected job type codes
     4) Selected work mode codes
     5) Radius options
   ========================================================= */
CREATE OR ALTER PROCEDURE dbo.usp_JobPreferences_PageLoad
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;

    /* Ensure row exists (first visit safety) */
    IF NOT EXISTS (
        SELECT 1
        FROM dbo.UserJobPreferences
        WHERE UserId = @UserId
    )
    BEGIN
        INSERT dbo.UserJobPreferences (UserId, CurrentStep)
        VALUES (@UserId, 2); -- default to Job Details step
    END

    /* -----------------------------
       1) Main DTO fields
       ----------------------------- */
    SELECT
        CurrentStep,
        ZipCode,
        RadiusMiles,
        WillingToRelocate
    FROM dbo.UserJobPreferences
    WHERE UserId = @UserId;

    /* -----------------------------
       2) Preferred shifts
       ----------------------------- */
    SELECT
        ShiftCode
    FROM dbo.UserJobPreferenceShift
    WHERE UserId = @UserId
    ORDER BY ShiftCode;

    /* -----------------------------
       3) Job types
       ----------------------------- */
    SELECT
        JobTypeCode
    FROM dbo.UserJobPreferenceJobType
    WHERE UserId = @UserId
    ORDER BY JobTypeCode;

    /* -----------------------------
       4) Work modes
       ----------------------------- */
    SELECT
        WorkModeCode
    FROM dbo.UserJobPreferenceWorkMode
    WHERE UserId = @UserId
    ORDER BY WorkModeCode;

    /* -----------------------------
       5) Radius options
       ----------------------------- */
    SELECT
        RadiusMiles
    FROM dbo.JobRadiusOption
    ORDER BY SortOrder;
END;
GO

/* =========================================================
   Save
   Updates preferences + replaces chip selections
   ========================================================= */
CREATE OR ALTER PROCEDURE dbo.usp_JobPreferences_Save
    @UserId INT,
    @CurrentStep INT,
    @ZipCode VARCHAR(10),
    @RadiusMiles INT = NULL,
    @WillingToRelocate BIT = NULL,
    @PreferredShifts dbo.TVP_ShiftCode READONLY,
    @JobTypes dbo.TVP_JobTypeCode READONLY,
    @WorkModes dbo.TVP_WorkModeCode READONLY
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRAN;

        /* Ensure row exists */
        IF NOT EXISTS (
            SELECT 1
            FROM dbo.UserJobPreferences
            WHERE UserId = @UserId
        )
        BEGIN
            INSERT dbo.UserJobPreferences (UserId, CurrentStep)
            VALUES (@UserId, @CurrentStep);
        END

        /* Update main preferences */
        UPDATE dbo.UserJobPreferences
        SET
            CurrentStep       = @CurrentStep,
            ZipCode           = NULLIF(LTRIM(RTRIM(@ZipCode)), ''),
            RadiusMiles       = @RadiusMiles,
            WillingToRelocate = @WillingToRelocate,
            UpdatedUtc        = SYSUTCDATETIME()
        WHERE UserId = @UserId;

        /* -----------------------------
           Replace shift selections
           ----------------------------- */
        DELETE FROM dbo.UserJobPreferenceShift
        WHERE UserId = @UserId;

        INSERT dbo.UserJobPreferenceShift (UserId, ShiftCode)
        SELECT @UserId, ShiftCode
        FROM @PreferredShifts;

        /* -----------------------------
           Replace job type selections
           ----------------------------- */
        DELETE FROM dbo.UserJobPreferenceJobType
        WHERE UserId = @UserId;

        INSERT dbo.UserJobPreferenceJobType (UserId, JobTypeCode)
        SELECT @UserId, JobTypeCode
        FROM @JobTypes;

        /* -----------------------------
           Replace work mode selections
           ----------------------------- */
        DELETE FROM dbo.UserJobPreferenceWorkMode
        WHERE UserId = @UserId;

        INSERT dbo.UserJobPreferenceWorkMode (UserId, WorkModeCode)
        SELECT @UserId, WorkModeCode
        FROM @WorkModes;

        COMMIT;

        /* Success payload */
        SELECT
            1 AS Success,
            'Saved' AS [Message];
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK;

        SELECT
            0 AS Success,
            ERROR_MESSAGE() AS [Message];
    END CATCH;
END;
GO
