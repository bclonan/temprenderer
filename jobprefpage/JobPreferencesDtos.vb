' Dtos\JobPreferencesDtos.vb
Option Strict On
Option Explicit On

Public Class JobPreferencesDto
    ' 1=Profile, 2=JobDetails, 3=Visibility
    Public Property CurrentStep As Integer

    ' Chips (multi-select)
    Public Property PreferredShifts As List(Of String) = New List(Of String)()
    Public Property JobTypes As List(Of String) = New List(Of String)()
    Public Property WorkModes As List(Of String) = New List(Of String)()

    ' Location
    Public Property ZipCode As String
    Public Property RadiusMiles As Nullable(Of Integer)

    ' Required radio
    Public Property WillingToRelocate As Nullable(Of Boolean)

    ' Helper (can be computed by server)
    Public Property IsComplete As Boolean
End Class

Public Class JobPreferencesPageLoadResponse
    Public Property Dto As JobPreferencesDto
    Public Property RadiusOptions As List(Of Integer) = New List(Of Integer)()
End Class

Public Class SaveJobPreferencesRequest
    Public Property Dto As JobPreferencesDto
End Class

Public Class SaveJobPreferencesResponse
    Public Property Success As Boolean
    Public Property Message As String
    Public Property Dto As JobPreferencesDto
End Class
