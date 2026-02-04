' Helpers\JobPreferencesDb.vb
Option Strict On
Option Explicit On

Imports System.Data
Imports System.Data.SqlClient

Public Module JobPreferencesDb

    Public Function BuildShiftTvp(values As IEnumerable(Of String)) As DataTable
        Dim dt As New DataTable()
        dt.Columns.Add("ShiftCode", GetType(String))
        For Each v In values.Distinct()
            dt.Rows.Add(v)
        Next
        Return dt
    End Function

    Public Function BuildJobTypeTvp(values As IEnumerable(Of String)) As DataTable
        Dim dt As New DataTable()
        dt.Columns.Add("JobTypeCode", GetType(String))
        For Each v In values.Distinct()
            dt.Rows.Add(v)
        Next
        Return dt
    End Function

    Public Function BuildWorkModeTvp(values As IEnumerable(Of String)) As DataTable
        Dim dt As New DataTable()
        dt.Columns.Add("WorkModeCode", GetType(String))
        For Each v In values.Distinct()
            dt.Rows.Add(v)
        Next
        Return dt
    End Function

    Public Function ComputeIsComplete(dto As JobPreferencesDto) As Boolean
        Dim zipOk = Not String.IsNullOrWhiteSpace(dto.ZipCode) AndAlso dto.ZipCode.Trim().Length >= 5
        Dim radiusOk = dto.RadiusMiles.HasValue
        Dim relocateOk = dto.WillingToRelocate.HasValue
        Return zipOk AndAlso radiusOk AndAlso relocateOk
    End Function

    Public Function LoadPage(connStr As String, userId As Integer) As JobPreferencesPageLoadResponse
        Dim resp As New JobPreferencesPageLoadResponse()
        Dim dto As New JobPreferencesDto()

        Using conn As New SqlConnection(connStr)
            Using cmd As New SqlCommand("dbo.usp_JobPreferences_PageLoad", conn)
                cmd.CommandType = CommandType.StoredProcedure
                cmd.Parameters.AddWithValue("@UserId", userId)

                conn.Open()
                Using rdr As SqlDataReader = cmd.ExecuteReader()

                    ' Resultset 1: main DTO
                    If rdr.Read() Then
                        dto.CurrentStep = Convert.ToInt32(rdr("CurrentStep"))
                        dto.ZipCode = If(rdr("ZipCode") Is DBNull.Value, "", Convert.ToString(rdr("ZipCode")))
                        dto.RadiusMiles = If(rdr("RadiusMiles") Is DBNull.Value, CType(Nothing, Integer?), Convert.ToInt32(rdr("RadiusMiles")))
                        dto.WillingToRelocate = If(rdr("WillingToRelocate") Is DBNull.Value, CType(Nothing, Boolean?), Convert.ToBoolean(rdr("WillingToRelocate")))
                    End If

                    ' Resultset 2: preferred shifts
                    rdr.NextResult()
                    While rdr.Read()
                        dto.PreferredShifts.Add(Convert.ToString(rdr("ShiftCode")))
                    End While

                    ' Resultset 3: job types
                    rdr.NextResult()
                    While rdr.Read()
                        dto.JobTypes.Add(Convert.ToString(rdr("JobTypeCode")))
                    End While

                    ' Resultset 4: work modes
                    rdr.NextResult()
                    While rdr.Read()
                        dto.WorkModes.Add(Convert.ToString(rdr("WorkModeCode")))
                    End While

                    ' Resultset 5: radius options
                    rdr.NextResult()
                    While rdr.Read()
                        resp.RadiusOptions.Add(Convert.ToInt32(rdr("RadiusMiles")))
                    End While
                End Using
            End Using
        End Using

        dto.IsComplete = ComputeIsComplete(dto)
        resp.Dto = dto
        Return resp
    End Function

    Public Function Save(connStr As String, userId As Integer, dto As JobPreferencesDto) As SaveJobPreferencesResponse
        Dim resp As New SaveJobPreferencesResponse()

        Using conn As New SqlConnection(connStr)
            Using cmd As New SqlCommand("dbo.usp_JobPreferences_Save", conn)
                cmd.CommandType = CommandType.StoredProcedure

                cmd.Parameters.AddWithValue("@UserId", userId)
                cmd.Parameters.AddWithValue("@CurrentStep", dto.CurrentStep)
                cmd.Parameters.AddWithValue("@ZipCode", If(dto.ZipCode, ""))
                cmd.Parameters.AddWithValue("@RadiusMiles", If(dto.RadiusMiles.HasValue, CType(dto.RadiusMiles.Value, Object), DBNull.Value))
                cmd.Parameters.AddWithValue("@WillingToRelocate", If(dto.WillingToRelocate.HasValue, CType(dto.WillingToRelocate.Value, Object), DBNull.Value))

                Dim pShifts = cmd.Parameters.Add("@PreferredShifts", SqlDbType.Structured)
                pShifts.TypeName = "dbo.TVP_ShiftCode"
                pShifts.Value = BuildShiftTvp(dto.PreferredShifts)

                Dim pJobTypes = cmd.Parameters.Add("@JobTypes", SqlDbType.Structured)
                pJobTypes.TypeName = "dbo.TVP_JobTypeCode"
                pJobTypes.Value = BuildJobTypeTvp(dto.JobTypes)

                Dim pWorkModes = cmd.Parameters.Add("@WorkModes", SqlDbType.Structured)
                pWorkModes.TypeName = "dbo.TVP_WorkModeCode"
                pWorkModes.Value = BuildWorkModeTvp(dto.WorkModes)

                conn.Open()
                Using rdr = cmd.ExecuteReader()
                    If rdr.Read() Then
                        resp.Success = Convert.ToInt32(rdr("Success")) = 1
                        resp.Message = Convert.ToString(rdr("Message"))
                    Else
                        resp.Success = False
                        resp.Message = "Unknown save result."
                    End If
                End Using
            End Using
        End Using

        dto.IsComplete = ComputeIsComplete(dto)
        resp.Dto = dto
        Return resp
    End Function

End Module
