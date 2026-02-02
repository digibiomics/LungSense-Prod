# Fix Duplicate Draft Reviews

## Problem
When a practitioner saves a draft and then submits a final review, the system was creating **two separate reviews** instead of updating the draft to final.

## Solution Applied

### Backend Fix
Updated `backend/app/routes/practitioner.py` - `submit_case_review()` function to:
1. Check if a draft review already exists for the case
2. If yes, **update** the existing draft
3. If no, create a new review

### How It Works Now

**Before (Bug):**
```
1. Save Draft → Creates Review #1 (is_final=False)
2. Submit Final → Creates Review #2 (is_final=True)
Result: 2 reviews in database ❌
```

**After (Fixed):**
```
1. Save Draft → Creates Review #1 (is_final=False)
2. Submit Final → Updates Review #1 (is_final=True)
Result: 1 review in database ✅
```

## Clean Up Existing Data

### Option 1: Delete Draft Reviews (Recommended)
If you want to keep only the final reviews and remove drafts:

```sql
-- Delete draft reviews where a final review exists for the same case
DELETE FROM case_reviews
WHERE is_final = False
  AND case_id IN (
    SELECT case_id 
    FROM case_reviews 
    WHERE is_final = True
  );
```

### Option 2: Update Drafts to Final
If you want to convert all drafts to final:

```sql
-- Update all draft reviews to final
UPDATE case_reviews
SET is_final = True
WHERE is_final = False;
```

### Option 3: Keep Latest Review Only
If you want to keep only the most recent review per case:

```sql
-- Delete older reviews, keep only the latest per case
DELETE FROM case_reviews
WHERE id NOT IN (
  SELECT MAX(id)
  FROM case_reviews
  GROUP BY case_id, practitioner_id
);
```

## Verify the Fix

### Check for Duplicate Reviews
```sql
-- Find cases with multiple reviews
SELECT 
    case_id,
    practitioner_id,
    COUNT(*) as review_count,
    SUM(CASE WHEN is_final = True THEN 1 ELSE 0 END) as final_count,
    SUM(CASE WHEN is_final = False THEN 1 ELSE 0 END) as draft_count
FROM case_reviews
GROUP BY case_id, practitioner_id
HAVING COUNT(*) > 1;
```

### View All Reviews for Case 13
```sql
-- See the reviews for your specific case
SELECT 
    id,
    case_id,
    practitioner_id,
    primary_diagnosis,
    is_final,
    created_at
FROM case_reviews
WHERE case_id = 13
ORDER BY created_at;
```

## Quick Fix for Your Current Data

Based on your screenshot (Case 13 with draft + final), run this:

```sql
-- Delete the draft review for case 13, keep the final one
DELETE FROM case_reviews
WHERE case_id = 13 
  AND is_final = False;
```

## Testing the Fix

1. **Restart your backend server** to load the updated code
2. As a practitioner, open a case
3. Save as draft
4. Submit as final
5. Check the database - should see only 1 review with `is_final = True`

## Expected Behavior After Fix

### Scenario 1: New Review
```
Action: Submit Final Review
Result: 1 review created (is_final=True)
```

### Scenario 2: Draft Then Final
```
Action 1: Save Draft
Result: 1 review created (is_final=False)

Action 2: Submit Final
Result: Same review updated (is_final=True)
Total: 1 review in database
```

### Scenario 3: Multiple Drafts
```
Action 1: Save Draft
Result: 1 review created (is_final=False)

Action 2: Save Draft Again
Result: Same review updated (is_final=False)

Action 3: Submit Final
Result: Same review updated (is_final=True)
Total: 1 review in database
```

## Summary

✅ **Backend Fixed** - No more duplicate reviews
✅ **SQL Scripts Provided** - Clean up existing data
✅ **Testing Steps** - Verify the fix works

After running the cleanup SQL and restarting your backend, the draft count in the Super Admin Dashboard should be accurate!
