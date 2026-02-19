- payunit enum 
Public Enum SalaryUnit As Integer
    none = 0
    year = 1
    month = 2
    hour = 3
    weekly = 4
End Enum




-- validation module 
Public Module SalaryValidation

    ' TODO: set these to your actual lookup codes returned from your API
    Private Const JOBTYPE_INTERNSHIP As Integer = 3
    Private Const INTERNSHIPTYPE_PAID As Integer = 1
    Private Const INTERNSHIPTYPE_UNPAID As Integer = 2

    Public Function ValidateSalary(
        model As JobPostingSalaryDetailsModel,
        configuredMinWageHourly As Decimal,
        Optional weeklyConversionHours As Decimal = 40D
    ) As SalaryValidationResult

        Dim result As New SalaryValidationResult() With {
            .MinimumWageWarningFlag = False,
            .MinimumWageWarningMessage = "",
            .MustAcknowledgeExceptionToContinue = False,
            .IsExceptionAcknowledged = If(model?.MinimumWageExceptionAckFlag, False)
        }

        If model Is Nothing Then Return result

        ' ----------------------------
        ' EXEMPTION: Internship + Unpaid => no min wage validation (per your UI variation)
        ' ----------------------------
        If model.JobTypeCode.HasValue AndAlso model.JobTypeCode.Value = JOBTYPE_INTERNSHIP Then
            If model.InternshipTypeCode.HasValue AndAlso model.InternshipTypeCode.Value = INTERNSHIPTYPE_UNPAID Then
                ' Unpaid internships: salary may be blank; only Hours field applies in UI.
                Return result
            End If
        End If

        ' Guard rails: if salary is not provided, don't warn here (let required validation handle it)
        If Not model.MinimumRate.HasValue OrElse Not model.PayPeriodCode.HasValue Then
            Return result
        End If

        Dim unit As SalaryUnit = CType(model.PayPeriodCode.Value, SalaryUnit)
        If unit = SalaryUnit.none Then Return result

        Dim minRate As Decimal = model.MinimumRate.Value

        ' Convert to hourly using 40-hour rule for weekly conversion (slide Example 4)
        Dim effectiveHourly As Decimal? = ConvertToHourly(minRate, unit, weeklyConversionHours)
        result.EffectiveHourlyRate = effectiveHourly

        If Not effectiveHourly.HasValue Then Return result

        ' ----------------------------
        ' Minimum wage check
        ' ----------------------------
        If effectiveHourly.Value < configuredMinWageHourly Then

            result.MinimumWageWarningFlag = True
            result.MustAcknowledgeExceptionToContinue = True

            Dim requiredMinForPeriod As Decimal? =
                ConvertFromHourly(configuredMinWageHourly, unit, weeklyConversionHours)

            result.RequiredMinimumRateForSelectedPeriod = requiredMinForPeriod

            Dim requiredText As String =
                If(requiredMinForPeriod.HasValue,
                   requiredMinForPeriod.Value.ToString("0.00"),
                   configuredMinWageHourly.ToString("0.00"))

            result.MinimumWageWarningMessage =
                $"Entered minimum pay converts to {effectiveHourly.Value.ToString("0.00")}/hour, " &
                $"which is below the minimum wage requirement of {configuredMinWageHourly.ToString("0.00")}/hour. " &
                $"Update the minimum {unit.ToString().ToLower()} rate to at least {requiredText}, " &
                $"or acknowledge the exception to continue."

        End If

        Return result
    End Function


    Private Function ConvertToHourly(amount As Decimal, unit As SalaryUnit, weeklyHours As Decimal) As Decimal?
        Select Case unit
            Case SalaryUnit.hour
                Return amount

            Case SalaryUnit.weekly
                If weeklyHours <= 0D Then Return Nothing
                Return amount / weeklyHours

            Case SalaryUnit.month
                Dim hoursPerMonth As Decimal = (weeklyHours * 52D) / 12D
                If hoursPerMonth <= 0D Then Return Nothing
                Return amount / hoursPerMonth

            Case SalaryUnit.year
                Dim hoursPerYear As Decimal = weeklyHours * 52D
                If hoursPerYear <= 0D Then Return Nothing
                Return amount / hoursPerYear

            Case Else
                Return Nothing
        End Select
    End Function


    Private Function ConvertFromHourly(hourly As Decimal, unit As SalaryUnit, weeklyHours As Decimal) As Decimal?
        Select Case unit
            Case SalaryUnit.hour
                Return hourly

            Case SalaryUnit.weekly
                Return hourly * weeklyHours

            Case SalaryUnit.month
                Dim hoursPerMonth As Decimal = (weeklyHours * 52D) / 12D
                Return hourly * hoursPerMonth

            Case SalaryUnit.year
                Dim hoursPerYear As Decimal = weeklyHours * 52D
                Return hourly * hoursPerYear

            Case Else
                Return Nothing
        End Select
    End Function

End Module




' usage 

Dim minWage As Decimal = 7.25D ' ideally from config table / parameter
Dim validation = SalaryValidation.ValidateSalary(model, minWage)

response.MinimumWageWarningFlag = validation.MinimumWageWarningFlag
response.MinimumWageWarningMessage = validation.MinimumWageWarningMessage
response.EffectiveHourlyRate = validation.EffectiveHourlyRate
response.RequiredMinimumRateForSelectedPeriod = validation.RequiredMinimumRateForSelectedPeriod

' real usage
Dim validation = SalaryValidation.ValidateSalary(model, minWage)

If validation.MinimumWageWarningFlag AndAlso Not validation.IsExceptionAcknowledged Then
    response.Success = False
    response.Validation = validation
    Return response
End If


' Vue model dto 
export interface SalaryValidationDto {
  minimumWageWarningFlag: boolean;
  minimumWageWarningMessage: string;
  effectiveHourlyRate?: number | null;
  requiredMinimumRateForSelectedPeriod?: number | null;
}


' example usage in vue component 
const salaryValidation = ref<SalaryValidationDto | null>(null);
const acknowledgeMinWageException = ref(false);

const canContinue = computed(() => {
  const v = salaryValidation.value
  if (!v?.minimumWageWarningFlag) return true
  return v.isExceptionAcknowledged === true
})


async function onContinue() {
  // Option A: validate locally based on response you already have
  // Option B (better): call API validate endpoint or reuse save response that includes validation
  if (!canContinue.value) return;

  // proceed with save/navigation
}


' example template snippet 
<b-alert
  v-if="salaryValidation?.minimumWageWarningFlag"
  variant="warning"
  show
  class="mb-3"
>
  <div class="fw-semibold">Minimum wage warning</div>
  <div>{{ salaryValidation.minimumWageWarningMessage }}</div>

  <b-form-checkbox v-model="acknowledgeMinWageException" class="mt-2">
    I acknowledge the pay is below the minimum wage requirement and want to continue.
  </b-form-checkbox>
</b-alert>

<b-button variant="primary" :disabled="!canContinue" @click="onContinue">
  Continue
</b-button>

