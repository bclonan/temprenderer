SET NOCOUNT ON;

DECLARE @now DATETIME = GETDATE();

;WITH active_tx AS
(
    SELECT
        at.transaction_id,
        at.name AS transaction_name,
        at.transaction_begin_time,
        at.transaction_state,
        at.transaction_type,
        st.session_id
    FROM sys.dm_tran_active_transactions at
    INNER JOIN sys.dm_tran_session_transactions st
        ON at.transaction_id = st.transaction_id
),
req AS
(
    SELECT
        r.session_id,
        r.status,
        r.command,
        r.cpu_time,
        r.total_elapsed_time,
        r.reads,
        r.writes,
        r.logical_reads,
        r.wait_type,
        r.wait_time,
        r.wait_resource,
        r.blocking_session_id,
        r.database_id,
        r.sql_handle,
        r.plan_handle,
        r.statement_start_offset,
        r.statement_end_offset
    FROM sys.dm_exec_requests r
    WHERE r.session_id <> @@SPID
),
sess AS
(
    SELECT
        s.session_id,
        s.login_name,
        s.host_name,
        s.program_name,
        s.status AS session_status,
        s.memory_usage * 8 AS session_memory_kb,
        s.open_transaction_count,
        s.last_request_start_time,
        s.last_request_end_time
    FROM sys.dm_exec_sessions s
    WHERE s.is_user_process = 1
),
tempdb_usage AS
(
    SELECT
        tsu.session_id,
        (tsu.user_objects_alloc_page_count - tsu.user_objects_dealloc_page_count) * 8 AS user_obj_kb,
        (tsu.internal_objects_alloc_page_count - tsu.internal_objects_dealloc_page_count) * 8 AS internal_obj_kb
    FROM sys.dm_db_session_space_usage tsu
),
blocking_counts AS
(
    SELECT
        r.blocking_session_id AS session_id,
        COUNT(*) AS blocked_session_count
    FROM sys.dm_exec_requests r
    WHERE r.blocking_session_id <> 0
    GROUP BY r.blocking_session_id
)
SELECT
    s.session_id,
    s.login_name,
    s.host_name,
    s.program_name,
    s.session_status,
    DB_NAME(r.database_id) AS database_name,

    r.status AS request_status,
    r.command,
    r.blocking_session_id,
    ISNULL(bc.blocked_session_count, 0) AS blocked_session_count,

    s.open_transaction_count,
    atx.transaction_id,
    atx.transaction_name,
    atx.transaction_begin_time,
    DATEDIFF(MINUTE, atx.transaction_begin_time, @now) AS transaction_minutes_old,

    r.cpu_time,
    r.total_elapsed_time / 1000 AS elapsed_seconds,
    r.reads,
    r.writes,
    r.logical_reads,
    r.wait_type,
    r.wait_time,
    r.wait_resource,

    s.session_memory_kb,
    ISNULL(tu.user_obj_kb, 0) AS tempdb_user_obj_kb,
    ISNULL(tu.internal_obj_kb, 0) AS tempdb_internal_obj_kb,

    SUBSTRING
    (
        txt.text,
        (r.statement_start_offset / 2) + 1,
        (
            (
                CASE
                    WHEN r.statement_end_offset = -1 THEN DATALENGTH(txt.text)
                    ELSE r.statement_end_offset
                END - r.statement_start_offset
            ) / 2
        ) + 1
    ) AS running_statement,

    txt.text AS full_batch_text
FROM sess s
LEFT JOIN req r
    ON s.session_id = r.session_id
LEFT JOIN active_tx atx
    ON s.session_id = atx.session_id
LEFT JOIN tempdb_usage tu
    ON s.session_id = tu.session_id
LEFT JOIN blocking_counts bc
    ON s.session_id = bc.session_id
OUTER APPLY sys.dm_exec_sql_text(r.sql_handle) txt
ORDER BY
    ISNULL(bc.blocked_session_count, 0) DESC,
    DATEDIFF(MINUTE, atx.transaction_begin_time, @now) DESC,
    r.total_elapsed_time DESC,
    s.session_id;

PRINT '===== SUMMARY =====';

SELECT
    COUNT(*) AS active_user_sessions
FROM sys.dm_exec_sessions
WHERE is_user_process = 1;

SELECT
    COUNT(*) AS active_requests
FROM sys.dm_exec_requests
WHERE session_id <> @@SPID;

SELECT
    COUNT(*) AS active_transactions
FROM sys.dm_tran_active_transactions;

SELECT TOP 1
    at.transaction_id,
    at.name AS transaction_name,
    at.transaction_begin_time,
    DATEDIFF(MINUTE, at.transaction_begin_time, GETDATE()) AS minutes_old,
    st.session_id
FROM sys.dm_tran_active_transactions at
INNER JOIN sys.dm_tran_session_transactions st
    ON at.transaction_id = st.transaction_id
ORDER BY at.transaction_begin_time ASC;

SELECT
    total_physical_memory_kb / 1024 AS total_physical_memory_mb,
    available_physical_memory_kb / 1024 AS available_physical_memory_mb,
    system_memory_state_desc
FROM sys.dm_os_sys_memory;

SELECT
    physical_memory_in_use_kb / 1024 AS sql_physical_memory_in_use_mb,
    locked_page_allocations_kb / 1024 AS locked_pages_mb,
    page_fault_count,
    memory_utilization_percentage,
    process_physical_memory_low,
    process_virtual_memory_low
FROM sys.dm_os_process_memory;