Below is the **complete VB.NET side** you need to add (or standardize) so the Vue `ParticipantDetailScreen` works with `:encId` and the shared composable pattern.

I’m mapping this to your existing structure from the screenshot:

* `Participant/Controllers`
* `Participant/HelperInterfaces`
* `Participant/Helpers`
* `Participant/Models`

> If you already have similar files (ApiEnvelope / helpers), you can reuse them—just make sure the shapes and action names match.

---

# 0) What the Vue page will call (required endpoints)

Your Vue screen is hard-coded to screen/controller name: **`ParticipantDetail`**

It will call:

1. `POST /api/ParticipantDetail/GetPageLoadInfo` body `{ encId }`
2. `POST /api/ParticipantDetail/GetDetail` body `{ encId }`
3. `POST /api/ParticipantDetail/Update` body `ParticipantDetailDTO` (includes `encId`)
4. `POST /api/ParticipantDetail/Deactivate` body `{ encId }`

So you must add:

✅ `ParticipantDetailController.vb` with those methods

---

# 1) Add the “standard contract” files (one-time)

## 1.1 `Participant/Models/ApiEnvelope.vb`

```vbnet
' Participant/Models/ApiEnvelope.vb
' Standard response wrapper expected by Vue shared http normalizer.

Public Class ApiEnvelope(Of T)
  Public Property ok As Boolean
  Public Property message As String
  Public Property data As T

  ' Optional field validation errors (recommended)
  Public Property validationErrors As Dictionary(Of String, List(Of String))
End Class
```

---

## 1.2 `Participant/Helpers/ApiResponse.vb`

```vbnet
' Participant/Helpers/ApiResponse.vb
' Centralized envelope creation helpers.

Public Module ApiResponse

  Public Function Ok(Of T)(data As T, Optional message As String = Nothing) As ApiEnvelope(Of T)
    Return New ApiEnvelope(Of T) With {
      .ok = True,
      .message = message,
      .data = data,
      .validationErrors = Nothing
    }
  End Function

  Public Function Fail(Of T)(message As String) As ApiEnvelope(Of T)
    Return New ApiEnvelope(Of T) With {
      .ok = False,
      .message = message,
      .data = Nothing,
      .validationErrors = Nothing
    }
  End Function

  Public Function ValidationFail(Of T)(
    errs As Dictionary(Of String, List(Of String)),
    Optional message As String = "Validation failed"
  ) As ApiEnvelope(Of T)
    Return New ApiEnvelope(Of T) With {
      .ok = False,
      .message = message,
      .data = Nothing,
      .validationErrors = errs
    }
  End Function

End Module
```

---

## 1.3 `Participant/Helpers/ControllerExec.vb` (optional but recommended)

```vbnet
' Participant/Helpers/ControllerExec.vb
' Keeps controllers thin and consistent.

Imports System

Public Module ControllerExec

  Public Function Run(Of T)(fn As Func(Of ApiEnvelope(Of T))) As ApiEnvelope(Of T)
    Try
      Return fn()
    Catch ex As Exception
      ' TODO: log ex with your logging system
      Return ApiResponse.Fail(Of T)("Server error: " & ex.Message)
    End Try
  End Function

End Module
```

---

# 2) Add the screen models (DTOs + requests)

## 2.1 `Participant/Models/ParticipantDetail/ParticipantDetailModels.vb`

(You can keep these as separate files if you prefer.)

```vbnet
' Participant/Models/ParticipantDetail/ParticipantDetailModels.vb
' Mirrors what Vue expects in ParticipantDetailDTO.ts

Public Class ParticipantDetailDTO
  Public Property screenTitle As String

  ' encId is ALWAYS passed from the route
  Public Property encId As String

  Public Property participant As ParticipantVM

  Public Property canEdit As Boolean
  Public Property canDeactivate As Boolean

  Public Property statusOptions As List(Of OptionVM)
End Class

Public Class ParticipantVM
  Public Property id As String
  Public Property firstName As String
  Public Property lastName As String
  Public Property email As String
  Public Property status As String
End Class

Public Class OptionVM
  Public Property value As String
  Public Property label As String
End Class

' Request payloads for custom actions:
Public Class EncIdRequest
  Public Property encId As String
End Class
```

> If your backend uses `EncId` naming differently (like `EncryptedId`), keep your internal name but ensure JSON binder matches (or update Vue to match). Easiest: call it `encId` everywhere.

---

# 3) Add the helper interface + helper implementation

This matches your existing pattern (`IProfileScreenHelper`, `ProfileScreenHelper`, etc.)

## 3.1 `Participant/HelperInterfaces/IParticipantDetailHelper.vb`

```vbnet
' Participant/HelperInterfaces/IParticipantDetailHelper.vb
' Controller calls this; helper does business logic + DB calls.

Public Interface IParticipantDetailHelper

  Function GetPageLoadInfo(encId As String) As ParticipantDetailDTO

  Function GetDetail(encId As String) As ParticipantDetailDTO

  Function Update(dto As ParticipantDetailDTO) As Object

  Function Deactivate(encId As String) As Object

End Interface
```

---

## 3.2 `Participant/Helpers/ParticipantDetailHelper.vb`

```vbnet
' Participant/Helpers/ParticipantDetailHelper.vb
' Business logic stub. Replace the TODO sections with DB calls.

Public Class ParticipantDetailHelper
  Implements IParticipantDetailHelper

  Public Function GetPageLoadInfo(encId As String) As ParticipantDetailDTO _
    Implements IParticipantDetailHelper.GetPageLoadInfo

    ' TODO: you may decode encId and verify access here
    Dim dto = New ParticipantDetailDTO With {
      .screenTitle = "Participant Detail",
      .encId = encId,
      .canEdit = True,
      .canDeactivate = True,
      .statusOptions = New List(Of OptionVM) From {
        New OptionVM With {.value = "Active", .label = "Active"},
        New OptionVM With {.value = "Inactive", .label = "Inactive"}
      }
    }

    Return dto
  End Function

  Public Function GetDetail(encId As String) As ParticipantDetailDTO _
    Implements IParticipantDetailHelper.GetDetail

    ' TODO:
    '   1) decode encId -> participantId
    '   2) query DB
    '   3) populate participant vm

    Dim p = New ParticipantVM With {
      .id = "123",
      .firstName = "First",
      .lastName = "Last",
      .email = "email@example.com",
      .status = "Active"
    }

    Dim dto = New ParticipantDetailDTO With {
      .screenTitle = "Participant Detail",
      .encId = encId,
      .participant = p,
      .canEdit = True,
      .canDeactivate = True,
      .statusOptions = New List(Of OptionVM) From {
        New OptionVM With {.value = "Active", .label = "Active"},
        New OptionVM With {.value = "Inactive", .label = "Inactive"}
      }
    }

    Return dto
  End Function

  Public Function Update(dto As ParticipantDetailDTO) As Object _
    Implements IParticipantDetailHelper.Update

    ' TODO: validate + save participant changes
    ' Example return shape can be anything; Vue will unwrap .data
    Return New With {.saved = True}
  End Function

  Public Function Deactivate(encId As String) As Object _
    Implements IParticipantDetailHelper.Deactivate

    ' TODO: deactivate participant by encId
    Return New With {.deactivated = True}
  End Function

End Class
```

---

# 4) Add the controller (the required endpoints)

## ✅ `Participant/Controllers/ParticipantDetailController.vb`

```vbnet
' Participant/Controllers/ParticipantDetailController.vb
' This controller must exist for Vue screenName "ParticipantDetail".
'
' Vue calls:
'   POST /api/ParticipantDetail/GetPageLoadInfo  body: { encId }
'   POST /api/ParticipantDetail/GetDetail       body: { encId }
'   POST /api/ParticipantDetail/Update          body: ParticipantDetailDTO
'   POST /api/ParticipantDetail/Deactivate      body: { encId }
'
' All return ApiEnvelope so frontend can unwrap consistently.

Imports System.Web.Http

Public Class ParticipantDetailController
  Inherits ApiController

  Private ReadOnly _helper As IParticipantDetailHelper

  Public Sub New()
    ' If you have DI, inject. Otherwise instantiate.
    _helper = New ParticipantDetailHelper()
  End Sub

  <HttpPost>
  Public Function GetPageLoadInfo(req As EncIdRequest) As ApiEnvelope(Of ParticipantDetailDTO)
    Return ControllerExec.Run(Function()
      Dim errs As New Dictionary(Of String, List(Of String))()

      If req Is Nothing OrElse String.IsNullOrWhiteSpace(req.encId) Then
        errs("encId") = New List(Of String) From {"encId is required"}
        Return ApiResponse.ValidationFail(Of ParticipantDetailDTO)(errs)
      End If

      Dim dto = _helper.GetPageLoadInfo(req.encId)

      ' IMPORTANT:
      ' GetPageLoadInfo may return only scaffolding or full dto.
      ' It's OK if participant is Nothing here.
      Return ApiResponse.Ok(dto)
    End Function)
  End Function

  <HttpPost>
  Public Function GetDetail(req As EncIdRequest) As ApiEnvelope(Of ParticipantDetailDTO)
    Return ControllerExec.Run(Function()
      Dim errs As New Dictionary(Of String, List(Of String))()

      If req Is Nothing OrElse String.IsNullOrWhiteSpace(req.encId) Then
        errs("encId") = New List(Of String) From {"encId is required"}
        Return ApiResponse.ValidationFail(Of ParticipantDetailDTO)(errs)
      End If

      Dim dto = _helper.GetDetail(req.encId)
      Return ApiResponse.Ok(dto)
    End Function)
  End Function

  <HttpPost>
  Public Function Update(dto As ParticipantDetailDTO) As ApiEnvelope(Of Object)
    Return ControllerExec.Run(Function()
      Dim errs As New Dictionary(Of String, List(Of String))()

      If dto Is Nothing OrElse String.IsNullOrWhiteSpace(dto.encId) Then
        errs("encId") = New List(Of String) From {"encId is required"}
      End If

      If dto Is Nothing OrElse dto.participant Is Nothing Then
        errs("participant") = New List(Of String) From {"participant is required"}
      Else
        If String.IsNullOrWhiteSpace(dto.participant.firstName) Then
          errs("participant.firstName") = New List(Of String) From {"First name is required"}
        End If
        If String.IsNullOrWhiteSpace(dto.participant.lastName) Then
          errs("participant.lastName") = New List(Of String) From {"Last name is required"}
        End If
      End If

      If errs.Count > 0 Then
        Return ApiResponse.ValidationFail(Of Object)(errs)
      End If

      Dim res = _helper.Update(dto)
      Return ApiResponse.Ok(res, "Saved")
    End Function)
  End Function

  <HttpPost>
  Public Function Deactivate(req As EncIdRequest) As ApiEnvelope(Of Object)
    Return ControllerExec.Run(Function()
      Dim errs As New Dictionary(Of String, List(Of String))()

      If req Is Nothing OrElse String.IsNullOrWhiteSpace(req.encId) Then
        errs("encId") = New List(Of String) From {"encId is required"}
        Return ApiResponse.ValidationFail(Of Object)(errs)
      End If

      Dim res = _helper.Deactivate(req.encId)
      Return ApiResponse.Ok(res, "Deactivated")
    End Function)
  End Function

End Class
```

---

# 5) Routing note (important)

This assumes your WebApi routing supports `api/{controller}/{action}`.

In older WebApi, that’s typically in `WebApiConfig`:

```vbnet
config.Routes.MapHttpRoute(
  name:="DefaultApi",
  routeTemplate:="api/{controller}/{action}/{id}",
  defaults:=New With {.id = RouteParameter.Optional}
)
```

If your project uses a different route template, adapt:

* either update the route template
* or change Vue endpoint builder (`/api/{screen}/{action}`)

But your current controllers like `ProfileScreenController` strongly suggest you already use controller/action routing.

---

# 6) File placement (matches your screenshot)

Inside the **Participant** VB project:

```
Participant/
  Controllers/
    ParticipantDetailController.vb          (NEW)
  HelperInterfaces/
    IParticipantDetailHelper.vb            (NEW)
  Helpers/
    ParticipantDetailHelper.vb             (NEW)
    ApiResponse.vb                         (NEW - one time)
    ControllerExec.vb                      (NEW - one time)
  Models/
    ApiEnvelope.vb                         (NEW - one time)
    ParticipantDetail/
      ParticipantDetailModels.vb           (NEW)
```

---

# 7) Minimum set vs recommended set

### Minimum to make the page work

* `ParticipantDetailController.vb`
* `ParticipantDetailDTO` + `EncIdRequest` (model file)

### For consistency and future screens

* `ApiEnvelope.vb`
* `ApiResponse.vb`
* `ControllerExec.vb`
* `IParticipantDetailHelper.vb`
* `ParticipantDetailHelper.vb`

"API envelope" and "controller exec" are especially recommended to standardize error handling and response shapes across all your API controllers.

Maybe we can add apiEnvelope to a global shared library to avoid duplication later. we can also add additional properties like traceId/timestamp/pagination later as needed.

This allows us to add fields once, and do not need to change them per screen.

ex.

Public Property correlationId As String
Public Property serverTimeUtc As DateTime


## What `ApiEnvelope` actually is (and is NOT)

### `ApiEnvelope` **is**

* A **transport wrapper**
* A **standard contract** between backend and frontend
* A **generic container** that can hold *any* payload type

### `ApiEnvelope` **is NOT**

* A screen DTO
* A participant model
* A profile model
* A business-specific object

Think of it like HTTP headers:

* You don’t change HTTP every time you add a new endpoint
* You don’t change envelopes when payloads change

---

## How `ApiEnvelope(Of T)` works

```vbnet
Public Class ApiEnvelope(Of T)
  Public Property ok As Boolean
  Public Property message As String
  Public Property data As T
  Public Property validationErrors As Dictionary(Of String, List(Of String))
End Class
```

Key point:

* **`T` is generic**
* `T` can be *anything*

Examples:

```vbnet
ApiEnvelope(Of ParticipantDetailDTO)
ApiEnvelope(Of ProfileScreenDTO)
ApiEnvelope(Of Object)
ApiEnvelope(Of List(Of ParticipantVM))
```

👉 The envelope does **not care** what `T` is.

---

## What `ApiResponse` does

```vbnet
ApiResponse.Ok(dto)
ApiResponse.Fail("error")
ApiResponse.ValidationFail(errors)
```

It:

* Sets `ok = True / False`
* Puts your payload in `.data`
* Optionally includes validation errors

It **does not**:

* Inspect your DTO
* Validate your model
* Transform participant/profile data

That logic belongs in:

* Controllers
* Helpers
* Services
* Validators

---

## When would you EVER change `ApiEnvelope`?

### Legitimate reasons (rare)

we might update it if:

* we want to add a **cross-cutting concern**, like:

  * `correlationId`
  * `traceId`
  * `timestamp`
  * `warnings`
  * `pagination metadata` (global)
* we want to version the API contract intentionally

Example:

```vbnet
Public Property correlationId As String
Public Property serverTimeUtc As DateTime
```

Even then:

* we add fields **once**
* we do **not** change them per screen

---

## When you should NOT change it (common mistake)

❌ “ProfileScreen needs extra fields”
❌ “ParticipantDetail needs different response shape”
❌ “This screen needs two payloads”

Those belong in:

* The **DTO** (`ProfileScreenDTO`, `ParticipantDetailDTO`)
* Or returned inside `.data` as a composite object

Example:

```vbnet
Return ApiResponse.Ok(New With {
  .profile = profileDto,
  .permissions = perms
})
```

The envelope stays the same.

---

## How ProfileScreen, ParticipantDetail, etc. fit in

### ProfileScreen example

```vbnet
Return ApiResponse.Ok(profileScreenDto)
```

### ParticipantDetail example

```vbnet
Return ApiResponse.Ok(participantDetailDto)
```

### Mixed payload example

```vbnet
Return ApiResponse.Ok(New With {
  .participant = p,
  .audit = auditInfo,
  .canEdit = True
})
```

All valid.
All use the **same** envelope.

---

## How Vue uses the envelope

Your Vue `useScreenController` does this:

```ts
function unwrap<T>(env: ApiEnvelope<T>): T {
  if (!env.ok) throw new Error(env.message)
  return env.data
}
```

Vue:

* Never inspects envelope structure beyond:

  * `ok`
  * `message`
  * `validationErrors`
  * `data`
* Does not care what’s inside `data`

That’s why the envelope must stay stable.

---

## Mental model (important)

### Think of layers like this

```
DTOs / Models      ← change often
Helpers / Services← change often
Controllers        ← change often
-------------------------------
ApiEnvelope        ← almost never changes
ApiResponse        ← almost never changes
```

If envelope changes frequently:

* Frontend breaks
* Every screen breaks
* Migration becomes painful
---

## TL;DR

* **ApiEnvelope is stable infrastructure**
* **DTOs change, envelope does not**
* **Generic type `T` carries screen-specific data**
* **ProfileScreen / ParticipantDetail never require envelope changes**

