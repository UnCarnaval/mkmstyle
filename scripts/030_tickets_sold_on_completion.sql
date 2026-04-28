-- Recompute raffles.tickets_sold only when a ticket reaches payment_status='completed'.
-- Replaces the old trigger that incremented tickets_sold on INSERT regardless of status.

CREATE OR REPLACE FUNCTION public.update_raffle_tickets_sold()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.payment_status = 'completed' THEN
      UPDATE public.raffles
      SET tickets_sold = tickets_sold + 1, updated_at = now()
      WHERE id = NEW.raffle_id;
    END IF;
    RETURN NEW;

  ELSIF TG_OP = 'UPDATE' THEN
    -- pending/failed -> completed
    IF (OLD.payment_status IS DISTINCT FROM 'completed') AND NEW.payment_status = 'completed' THEN
      UPDATE public.raffles
      SET tickets_sold = tickets_sold + 1, updated_at = now()
      WHERE id = NEW.raffle_id;
    -- completed -> something else (refund/correction)
    ELSIF OLD.payment_status = 'completed' AND (NEW.payment_status IS DISTINCT FROM 'completed') THEN
      UPDATE public.raffles
      SET tickets_sold = GREATEST(tickets_sold - 1, 0), updated_at = now()
      WHERE id = NEW.raffle_id;
    END IF;
    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.payment_status = 'completed' THEN
      UPDATE public.raffles
      SET tickets_sold = GREATEST(tickets_sold - 1, 0), updated_at = now()
      WHERE id = OLD.raffle_id;
    END IF;
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS on_ticket_purchased ON public.tickets;

CREATE TRIGGER on_ticket_status_change
AFTER INSERT OR UPDATE OF payment_status OR DELETE ON public.tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_raffle_tickets_sold();

-- Backfill: recompute tickets_sold from the actual completed-tickets count.
UPDATE public.raffles r
SET tickets_sold = COALESCE(t.cnt, 0),
    updated_at = now()
FROM (
  SELECT raffle_id, COUNT(*) AS cnt
  FROM public.tickets
  WHERE payment_status = 'completed'
  GROUP BY raffle_id
) t
WHERE r.id = t.raffle_id;

UPDATE public.raffles
SET tickets_sold = 0
WHERE id NOT IN (SELECT DISTINCT raffle_id FROM public.tickets WHERE payment_status = 'completed');
