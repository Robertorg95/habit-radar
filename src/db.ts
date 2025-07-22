import Dexie, { type Table } from "dexie";

export interface Goal {
  id: string;
  name: string;
  color: string;          // hex o tailwind class
  icon: string;           // save icon name
  frequency: "daily" | "multi";
  benchmark?: number;     // opcional
  createdAt: Date;
}

export interface Event {
  id: string;
  goalId: string;
  delta: number;        // +1 o -1
  timestamp: Date;
}

class ProgressDB extends Dexie {
  goals!: Table<Goal, string>;
  events!: Table<Event, string>;

  constructor() {
    super("progressDB");
    this.version(2).stores({
        goals: "id, name, createdAt",   // Dexie migrará; nuevos campos no necesitan índice
        events: "id, goalId, timestamp",
    });
  }
}

export const db = new ProgressDB();
