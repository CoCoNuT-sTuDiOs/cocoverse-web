/** Where the opened phone was on the grid, so the details page can grow out of it. */
export type Flight = {
  slug: string;
  rect: { left: number; top: number; width: number; height: number };
};

let flight: Flight | null = null;

export const phoneFlight = {
  set(next: Flight | null) {
    flight = next;
  },
  get(slug: string): Flight | null {
    return flight && flight.slug === slug ? flight : null;
  },
  clear() {
    flight = null;
  },
};