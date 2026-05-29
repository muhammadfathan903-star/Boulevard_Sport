-- Add Midtrans related columns to the orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS snap_token TEXT,
ADD COLUMN IF NOT EXISTS midtrans_transaction_id TEXT,
ADD COLUMN IF NOT EXISTS payment_type TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT,
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- Drop the old trigger that reduces stock before payment
DROP TRIGGER IF EXISTS on_order_item_created ON public.order_items;

-- Create the new trigger function
CREATE OR REPLACE FUNCTION reduce_stock_on_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  item RECORD;
BEGIN
  -- Check if status changed from 'Menunggu Pembayaran' to 'Pembayaran Dikonfirmasi'
  IF OLD.status = 'Menunggu Pembayaran' AND NEW.status = 'Pembayaran Dikonfirmasi' THEN
    -- Loop through all order_items for this order and reduce stock
    FOR item IN SELECT inventory_id, jumlah FROM public.order_items WHERE order_id = NEW.id
    LOOP
      UPDATE public.inventory
      SET stok = stok - item.jumlah
      WHERE id = item.inventory_id;
    END LOOP;
  END IF;
  
  -- Optionally, restore stock if order is cancelled from a paid state
  -- (Though typically this requires manual handling or refund process)
  
  RETURN NEW;
END;
$$;

-- Create the new trigger
DROP TRIGGER IF EXISTS on_order_status_update ON public.orders;
CREATE TRIGGER on_order_status_update
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW EXECUTE FUNCTION reduce_stock_on_payment();
