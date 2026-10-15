import { toast } from "sonner";

/** Runs a store action and shows errors as toasts. Returns true on success. */
export function run(fn: () => unknown, success?: string): boolean {
  try {
    fn();
    if (success) toast.success(success);
    return true;
  } catch (e) {
    toast.error(e instanceof Error ? e.message : "Terjadi kesalahan");
    return false;
  }
}
