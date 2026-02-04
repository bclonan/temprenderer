Option Strict On
Option Explicit On

Imports System.Web.Http
Imports System.Configuration

<RoutePrefix("JobPreferences")>
Public Class JobPreferencesController
    Inherits ApiController

    Private ReadOnly _connStr As String = ConfigurationManager.ConnectionStrings("DefaultConnection").ConnectionString

    ' NOTE: You’ll likely resolve UserId from your AF token / auth context.
    ' For now, signature shows userId as parameter for clarity.

    <HttpGet>
    <Route("GetPageLoad")>
    Public Function GetPageLoad(<FromUri> userId As Integer) As IHttpActionResult
        Dim resp = JobPreferencesDb.LoadPage(_connStr, userId)
        Return Ok(resp)
    End Function

    <HttpPost>
    <Route("Save")>
    Public Function Save(<FromUri> userId As Integer, <FromBody> req As SaveJobPreferencesRequest) As IHttpActionResult
        If req Is Nothing OrElse req.Dto Is Nothing Then
            Return BadRequest("Missing request body or dto.")
        End If

        ' Minimal validation (mirror required fields you enforce client-side)
        If req.Dto.CurrentStep < 1 OrElse req.Dto.CurrentStep > 3 Then
            Return BadRequest("Invalid currentStep.")
        End If

        Dim resp = JobPreferencesDb.Save(_connStr, userId, req.Dto)
        Return Ok(resp)
    End Function

End Class
