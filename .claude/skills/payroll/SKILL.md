---
name: payroll
description: Build the 305 SKY payroll spreadsheet (regular hours, overtime at 1.5x over 40 hrs/week, gross pay per employee) from the time-clock Payroll Report, ready to enter in QuickBooks Payroll. Use when the user shares a Payroll Report screenshot/export or asks to run, figure, or check payroll.
---

# 305 SKY payroll

Turns the time-clock **Payroll Report** (Fri–Thu workweeks, weekly or bi-weekly) into an Excel
workbook with exact gross pay per employee, and a "QuickBooks Entry" tab to key into QuickBooks.

Files:
- `rates.csv` — hourly rate and hours to withhold, per employee (from the 2026 rate sheet).
- `build_payroll.py` — builds the workbook; all pay math is live Excel formulas.
- `payroll/<period-start>/hours.csv` (repo root) — the hours for one pay period.

## Rules

- Workweek runs **Friday → Thursday**. A bi-weekly period is two workweeks.
- **Overtime = hours over 40 in a single workweek, paid at 1.5× the rate.** Figure it per week,
  never across the two weeks combined (41 + 39 hrs = 1 hr OT, not 0).
- An employee listed under more than one location (e.g. `Johnley Theagene AWAY` and `FLL`) is
  one person: add the rows together before figuring overtime.
- "Withhold N hours" on the rate sheet goes in `withhold_hours`; it comes off week 1 of the
  period before overtime is figured. After the period is paid, ask whether it repeats and reset
  it to 0 if it was one-time.
- Gross pay only; QuickBooks figures taxes and deductions.

## Steps

1. **Get the hours.** From the Payroll Report (screenshot or export), write
   `payroll/<first-day YYYY-MM-DD>/hours.csv` with columns
   `employee,location,<one column per date>,report_worked`. Use 7 date columns for a weekly
   run, 14 for bi-weekly. Blank or `-` = 0. Put the report's "Worked" figure in
   `report_worked` so the script can cross-check your transcription.
   Match names to `rates.csv` (the report says "Nestor Marrero"; the rate sheet's "Nestor
   Murroro" is the same person).
2. **Check rates.** Anyone on the report but missing from `rates.csv`, or with a blank rate,
   needs a rate from the user. Ask; do not guess. Update `rates.csv` when the user gives
   new or changed rates.
3. **Build:**
   ```bash
   python3 .claude/skills/payroll/build_payroll.py payroll/<start>/hours.csv
   ```
   Fix any `WARNING` it prints (transcription mismatch, unknown employee).
4. **Recalculate and verify** with the xlsx skill's `scripts/recalc.py` (must report 0 errors),
   then confirm the workbook's TOTAL matches the script's printed total, and that total
   "Hours Worked" matches the report's Worked Hours total.
5. **Report back:** a table of employee / regular hrs / OT hrs / rate / gross pay, the total
   gross payroll, and every flag: missing rates, withheld hours, people on the rate sheet with no
   hours, anyone with unusually high OT. Send the .xlsx to the user.

## Workbook tabs

- **Payroll** — one row per employee per week: hours, withheld, regular/OT split, pay. The OT
  threshold (40) and multiplier (1.5) are input cells at the top.
- **QuickBooks Entry** — per employee for the whole period: regular hours, OT hours, rate,
  gross pay. QuickBooks pays hours × the rate on the employee's profile, so the rates there
  must match.
- **Hours Detail** — daily hours as transcribed, with a check against the report's totals.
- **Rates** — editable rates; blank yellow cells are rates still needed.
