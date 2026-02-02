# Practitioner Management Tab - Updates

## Changes Made

### ✅ Removed Column
- ❌ Email column removed

### ✅ Added Columns
- ✅ **Practitioner ID** - Unique practitioner identifier from users table
- ✅ **Pending Review** - Count of cases assigned but not yet reviewed

### ✅ Enhanced Columns
- ✅ **Avg Review Time** - Now calculated (was placeholder before)
- ✅ **Draft/Final** - Color-coded (yellow for draft, green for final)

## New Table Structure

```
┌──────────────┬────────────────┬─────────────┬──────────┬────────────────┬─────────────────┬────────────┬────────┬────────────┐
│ Name         │ Practitioner ID│ Institution │ Active   │ Pending Review │ Avg Review Time │ Draft/Final│ Status │ Actions    │
│              │                │             │ Cases    │                │                 │            │        │            │
├──────────────┼────────────────┼─────────────┼──────────┼────────────────┼─────────────────┼────────────┼────────┼────────────┤
│ Dr. Smith    │ PRAC-2024-001  │ City Hosp   │ 12       │ 3              │ 24.5h           │ 5 / 15     │ Active │ Deactivate │
│ Dr. Johnson  │ PRAC-2024-002  │ Med Center  │ 8        │ 0              │ 18.2h           │ 2 / 20     │ Active │ Deactivate │
└──────────────┴────────────────┴─────────────┴──────────┴────────────────┴─────────────────┴────────────┴────────┴────────────┘
```

## Column Details

### 1. Name
- Practitioner's full name
- Bold font for emphasis

### 2. Practitioner ID ✨ NEW
- Unique identifier from `users.practitioner_id` field
- Monospace font for better readability
- Example: `PRAC-2024-001`
- Shows "—" if not set

### 3. Institution
- Hospital/clinic name from `users.institution`
- Shows "—" if not set

### 4. Active Cases
- Count of cases with status `submitted` or `reviewed`
- Assigned to this practitioner

### 5. Pending Review ✨ NEW
- **Critical metric** for workload monitoring
- Cases assigned to practitioner but **no review created yet**
- Highlighted in **orange** if count > 0
- Shows bottlenecks in review process

### 6. Avg Review Time ✨ CALCULATED
- **Average time from case assignment to first review**
- Measured in hours
- Shows "—" if no reviews yet

### 7. Draft/Final
- **Draft count** in yellow
- **Final count** in green
- Format: `5 / 15` (5 drafts, 15 finals)

### 8. Status
- Active/Inactive badge
- Based on soft delete status

### 9. Actions
- Toggle button to activate/deactivate

## How Average Review Time is Calculated

### Formula
```
Avg Review Time = Sum of (First Review Time - Case Created Time) / Number of Reviewed Cases
```

### Step-by-Step Calculation

1. **Find all cases reviewed by practitioner**
   ```sql
   SELECT case_id, case.created_at, MIN(review.created_at) as first_review_at
   FROM cases
   JOIN case_reviews ON cases.id = case_reviews.case_id
   WHERE case_reviews.practitioner_id = {practitioner_id}
   GROUP BY case_id
   ```

2. **Calculate time difference for each case**
   ```python
   time_diff = (first_review_at - case_created_at).total_seconds() / 3600  # Convert to hours
   ```

3. **Average all time differences**
   ```python
   avg_review_time = sum(all_time_diffs) / count(reviewed_cases)
   ```

### Example Calculation

**Practitioner has reviewed 3 cases:**

| Case ID | Created At          | First Review At     | Time Diff |
|---------|---------------------|---------------------|-----------|
| 101     | 2024-01-01 10:00:00 | 2024-01-02 10:00:00 | 24 hours  |
| 102     | 2024-01-02 14:00:00 | 2024-01-03 08:00:00 | 18 hours  |
| 103     | 2024-01-03 09:00:00 | 2024-01-04 15:00:00 | 30 hours  |

**Average = (24 + 18 + 30) / 3 = 24 hours**

### Important Notes

- ✅ Uses **first review** timestamp (not final review)
- ✅ Measures from **case creation** (not assignment)
- ✅ Rounded to 1 decimal place (e.g., 24.5h)
- ✅ Shows "—" if practitioner has no reviews yet
- ✅ Only counts cases that have been reviewed

## Pending Review Calculation

### What Counts as "Pending Review"?

Cases that meet ALL criteria:
1. ✅ Assigned to this practitioner (`case.practitioner_id = practitioner.id`)
2. ✅ Status is `submitted` (not draft, not reviewed)
3. ✅ **No review exists yet** for this case by this practitioner

### SQL Logic
```sql
SELECT COUNT(*)
FROM cases
WHERE practitioner_id = {practitioner_id}
  AND status = 'submitted'
  AND id NOT IN (
    SELECT case_id 
    FROM case_reviews 
    WHERE practitioner_id = {practitioner_id}
  )
```

### Why This Matters

- 🚨 **High pending count** = Practitioner is overloaded
- ✅ **Zero pending** = Practitioner is up-to-date
- 📊 **Helps with workload balancing**

## Visual Indicators

### Color Coding

**Pending Review:**
- `0` → Normal text (gray)
- `> 0` → **Orange text + bold** (attention needed)

**Draft/Final:**
- Draft count → **Yellow text**
- Final count → **Green text**

### Example Display
```
Pending Review: 3  ← Orange & bold (needs attention!)
Draft/Final: 5 / 15  ← Yellow 5, Green 15
```

## API Response Example

```json
{
  "status": "success",
  "data": {
    "practitioners": [
      {
        "id": 5,
        "full_name": "Dr. John Smith",
        "practitioner_id": "PRAC-2024-001",
        "institution": "City Hospital",
        "active_cases": 12,
        "pending_review": 3,
        "avg_review_time": 24.5,
        "draft_count": 5,
        "final_count": 15,
        "is_active": true
      }
    ]
  }
}
```

## Use Cases

### 1. Workload Monitoring
- Check **Active Cases** and **Pending Review** columns
- Identify overloaded practitioners
- Redistribute cases if needed

### 2. Performance Tracking
- Monitor **Avg Review Time**
- Identify fast vs slow reviewers
- Set performance benchmarks

### 3. Quality Assessment
- Check **Draft/Final** ratio
- High draft count may indicate:
  - Practitioner is thorough (multiple revisions)
  - Cases are complex
  - Need for additional training

### 4. Capacity Planning
- Low **Pending Review** = Can take more cases
- High **Pending Review** = At capacity

## Benefits

### ✅ Better Visibility
- See practitioner workload at a glance
- Identify bottlenecks quickly

### ✅ Data-Driven Decisions
- Actual metrics instead of guesses
- Fair workload distribution

### ✅ Performance Insights
- Track review speed
- Monitor quality (draft/final ratio)

### ✅ Cleaner Interface
- Removed unnecessary email column
- Added actionable metrics

## Files Modified

### Backend
- `backend/app/routes/admin.py`
  - Updated `get_practitioners_management()` function
  - Added avg review time calculation
  - Added pending review count
  - Added practitioner_id field

### Frontend
- `frontend/client/pages/SuperAdminDashboard.tsx`
  - Updated PractitionerRow interface
  - Updated table columns
  - Added color coding for pending review
  - Added color coding for draft/final

## Testing Checklist

- [ ] Practitioner ID displays correctly
- [ ] Institution shows from users table
- [ ] Active cases count is accurate
- [ ] Pending review count is accurate
- [ ] Pending review shows orange when > 0
- [ ] Avg review time calculates correctly
- [ ] Avg review time shows "—" when no reviews
- [ ] Draft count shows in yellow
- [ ] Final count shows in green
- [ ] Toggle button works
- [ ] Email column is removed

## Performance Considerations

### Average Review Time Calculation
- Runs a JOIN query for each practitioner
- May be slow with many practitioners/cases
- Consider caching if performance issues arise

### Optimization Ideas (Future)
1. **Materialized View** - Pre-calculate metrics
2. **Background Job** - Update metrics periodically
3. **Caching** - Cache results for 5-10 minutes

## Summary

The Practitioner Management tab now provides comprehensive performance metrics including:
- ✅ Practitioner ID for identification
- ✅ Pending review count for workload monitoring
- ✅ Calculated average review time
- ✅ Color-coded draft/final counts
- ✅ Cleaner interface without email column

These metrics enable data-driven decisions for case assignment and practitioner management.
