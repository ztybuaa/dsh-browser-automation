param(
  [string]$DatasetRoot = $PSScriptRoot
)

$errors = [System.Collections.Generic.List[string]]::new()
$index = Get-Content -Raw -LiteralPath (Join-Path $DatasetRoot 'index.json') | ConvertFrom-Json
$questions = Get-Content -Raw -LiteralPath (Join-Path $DatasetRoot $index.question_file)
$schemas = Get-Content -Raw -LiteralPath (Join-Path $DatasetRoot $index.response_schemas) | ConvertFrom-Json
$tasks = @($index.tasks)

if ($index.revision -ne 5 -or $index.version -ne '0.4.1') { $errors.Add('Expected dataset v0.4.1 revision 5') }
if ($index.split -ne 'test' -or $index.status -ne 'pilot') { $errors.Add('Expected pilot test split') }
if ($tasks.Count -ne 10) { $errors.Add("Expected 10 tasks, found $($tasks.Count)") }
if (@($tasks | Where-Object site -eq 'reddit').Count -ne 5) { $errors.Add('Expected 5 Reddit tasks') }
if (@($tasks | Where-Object site -eq 'google-search').Count -ne 5) { $errors.Add('Expected 5 Google Search tasks') }

$seen = @{}
foreach ($task in $tasks) {
  if ($seen.ContainsKey($task.task_id)) { $errors.Add("Duplicate task ID: $($task.task_id)") }
  $seen[$task.task_id] = $true
  if ($task.complexity -notin @('L1', 'L2', 'L3', 'L4', 'L5')) { $errors.Add("Invalid complexity for $($task.task_id)") }
  if ($task.status -ne 'validated') { $errors.Add("Task is not validated: $($task.task_id)") }

  $heading = "(?m)^### $([regex]::Escape($task.task_id.ToUpper())) \| $([regex]::Escape($task.complexity)) \|"
  if ([regex]::Matches($questions, $heading).Count -ne 1) { $errors.Add("Missing or duplicate question heading for $($task.task_id)") }

  $examplePath = Join-Path $DatasetRoot $task.answer_example
  if (-not (Test-Path -LiteralPath $examplePath)) { $errors.Add("Missing answer example for $($task.task_id)"); continue }
  try { $example = Get-Content -Raw -LiteralPath $examplePath | ConvertFrom-Json }
  catch { $errors.Add("Invalid answer example JSON for $($task.task_id)"); continue }

  $definition = $schemas.'$defs'.($task.task_id)
  if ($null -eq $definition) { $errors.Add("Missing response schema for $($task.task_id)") }
  elseif ($null -eq $definition.'$ref') {
    foreach ($requiredField in @($definition.required)) {
      if ($requiredField -notin @($example.PSObject.Properties.Name)) { $errors.Add("Answer example for $($task.task_id) lacks $requiredField") }
    }
  }

  $evaluatorPath = Join-Path $DatasetRoot "private/evaluators/$($task.task_id).json"
  if (-not (Test-Path -LiteralPath $evaluatorPath)) { $errors.Add("Missing evaluator for $($task.task_id)"); continue }
  $evaluator = Get-Content -Raw -LiteralPath $evaluatorPath | ConvertFrom-Json
  if ($evaluator.task_id -ne $task.task_id -or $evaluator.revision -ne $index.revision) { $errors.Add("Evaluator mismatch for $($task.task_id)") }
}

if ([regex]::Matches($questions, '(?m)^### (RD|SEO)-[0-9]{3} \|').Count -ne 10) { $errors.Add('questions.md must contain exactly 10 task headings') }
foreach ($banned in @('design_validation', 'reference_answer', 'evaluation_spec', 'marketing_rationale')) {
  if ($questions.Contains($banned)) { $errors.Add("questions.md leaks private field: $banned") }
}

if ($errors.Count -gt 0) {
  $errors | ForEach-Object { Write-Error $_ }
  exit 1
}

Write-Output 'Validated 10 questions, answer examples, response schemas, and private evaluators.'
