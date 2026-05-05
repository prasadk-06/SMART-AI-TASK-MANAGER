/**
 * Typed backend client.
 * `createActor` is the auto-generated wrapper from @/backend.
 * We re-export it along with typed helper wrappers.
 */
import { createActor } from "@/backend";
export { createActor };

// Re-export actor factory so consumers only import from here
export type BackendActor = ReturnType<typeof createActor>;
