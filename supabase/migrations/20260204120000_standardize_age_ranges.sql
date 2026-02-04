-- Migration: Standardize Age Ranges
-- Purpose: Convert old age ranges (e.g. "5-12 años", "9+", "8-14") to new bucket format ("4+", "6+", "9+", "12+", "18+")
-- Using the Midpoint Nearest Neighbor logic.

CREATE OR REPLACE FUNCTION public.normalize_age_range(range_str TEXT) RETURNS TEXT AS $$
DECLARE
    min_val NUMERIC;
    max_val NUMERIC;
    mid_val NUMERIC;
    
    -- Targets
    targets NUMERIC[] := ARRAY[4, 6, 9, 12, 18];
    
    closest NUMERIC;
    min_diff NUMERIC;
    curr_diff NUMERIC;
    t NUMERIC;
BEGIN
    -- Extract Min (Start of string)
    min_val := (substring(range_str from '^(\d+)')::NUMERIC);
    
    IF min_val IS NULL THEN
        RETURN range_str; -- Cannot parse, leave as is
    END IF;

    -- Extract Max (After hyphen)
    max_val := (substring(range_str from '-(\d+)')::NUMERIC);
    
    -- Calculate Midpoint
    IF max_val IS NOT NULL THEN
        mid_val := (min_val + max_val) / 2.0;
    ELSE
        mid_val := min_val; -- Treat "10+" as 10 (or midpoint of 10..10)
    END IF;

    -- Find Nearest Neighbor
    closest := targets[1];
    min_diff := ABS(mid_val - closest);
    
    -- Iterate targets (index 1 to 5)
    FOREACH t IN ARRAY targets
    LOOP
        curr_diff := ABS(mid_val - t);
        IF curr_diff < min_diff THEN
            min_diff := curr_diff;
            closest := t;
        ELSIF curr_diff = min_diff THEN
            -- Tie-breaker: choose existing closest (which is effectively lower in loop order? No, array is sorted asc)
            -- Wait, loop order 4,6,9...
            -- If I have 7.5 (mid between 6 and 9).
            -- Iter 6: diff 1.5. Closest = 6.
            -- Iter 9: diff 1.5. Curr = Min.
            -- Logic in JS was: "closest = targets[i]" (prefer higher).
            closest := t; 
        END IF;
    END LOOP;

    RETURN closest || '+';
END;
$$ LANGUAGE plpgsql;

-- Execute Update
UPDATE public.sets
SET set_age_range = public.normalize_age_range(set_age_range)
WHERE set_age_range NOT IN ('4+', '6+', '9+', '12+', '18+');

-- Drop the helper function (optional, but clean)
DROP FUNCTION public.normalize_age_range;
