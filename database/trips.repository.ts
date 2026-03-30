import { db } from "./db";
import type {
  Trip,
  TripCreate,
  TripUpdate,
  ExpenseGroup,
  ExpenseGroupCreate,
  ExpenseGroupUpdate,
  Item,
  ItemCreate,
  ItemUpdate,
} from "@/types";
import { generateTripId, generateId } from "@/utils";

export const tripsRepository = {
  // Trip operations
  async getAll(): Promise<Trip[]> {
    return db.trips.orderBy("createdAt").reverse().toArray();
  },

  async getById(id: string): Promise<Trip | undefined> {
    return db.trips.get(id);
  },

  async create(data: TripCreate): Promise<Trip> {
    const id = generateTripId(data.name);
    const trip: Trip = {
      id,
      name: data.name,
      friends: data.friends,
      subTopics: [],
      createdAt: new Date().toISOString(),
      googleSheetUrl: null,
      defaultPayer: data.defaultPayer || null,
    };
    await db.trips.add(trip);
    return trip;
  },

  async update(id: string, updates: TripUpdate): Promise<Trip | undefined> {
    const trip = await db.trips.get(id);
    if (!trip) return undefined;

    const updatedTrip = { ...trip };
    if (updates.name !== undefined) updatedTrip.name = updates.name;
    if (updates.friends !== undefined) updatedTrip.friends = updates.friends;
    if (updates.googleSheetUrl !== undefined)
      updatedTrip.googleSheetUrl = updates.googleSheetUrl;
    if (updates.defaultPayer !== undefined)
      updatedTrip.defaultPayer = updates.defaultPayer;

    await db.trips.put(updatedTrip);
    return updatedTrip;
  },

  async delete(id: string): Promise<void> {
    await db.trips.delete(id);
  },

  async import(trip: Trip): Promise<Trip> {
    const existingTrip = await db.trips.get(trip.id);
    if (existingTrip) {
      const timestamp = Date.now().toString(36);
      trip.id = `${trip.id}-imported-${timestamp}`;
    }

    const importedTrip: Trip = {
      ...trip,
      subTopics: trip.subTopics || [],
      createdAt: trip.createdAt || new Date().toISOString(),
      googleSheetUrl: trip.googleSheetUrl || null,
      defaultPayer: trip.defaultPayer || null,
    };

    await db.trips.add(importedTrip);
    return importedTrip;
  },

  // Expense group (SubTopic) operations
  async addExpenseGroup(
    tripId: string,
    data: ExpenseGroupCreate
  ): Promise<ExpenseGroup | undefined> {
    const trip = await db.trips.get(tripId);
    if (!trip) return undefined;

    const expenseGroup: ExpenseGroup = {
      id: generateId(),
      name: data.name,
      items: [],
      taxPercent: 0,
    };

    trip.subTopics.push(expenseGroup);
    await db.trips.put(trip);
    return expenseGroup;
  },

  async updateExpenseGroup(
    tripId: string,
    expenseGroupId: string,
    updates: ExpenseGroupUpdate
  ): Promise<ExpenseGroup | undefined> {
    const trip = await db.trips.get(tripId);
    if (!trip) return undefined;

    const expenseGroup = trip.subTopics.find((s) => s.id === expenseGroupId);
    if (!expenseGroup) return undefined;

    if (updates.name !== undefined) expenseGroup.name = updates.name;
    if (updates.taxPercent !== undefined)
      expenseGroup.taxPercent = updates.taxPercent;

    await db.trips.put(trip);
    return expenseGroup;
  },

  async deleteExpenseGroup(
    tripId: string,
    expenseGroupId: string
  ): Promise<void> {
    const trip = await db.trips.get(tripId);
    if (!trip) return;

    trip.subTopics = trip.subTopics.filter((s) => s.id !== expenseGroupId);
    await db.trips.put(trip);
  },

  // Item operations
  async addItem(
    tripId: string,
    expenseGroupId: string,
    data: ItemCreate
  ): Promise<Item | undefined> {
    const trip = await db.trips.get(tripId);
    if (!trip) return undefined;

    const expenseGroup = trip.subTopics.find((s) => s.id === expenseGroupId);
    if (!expenseGroup) return undefined;

    const item: Item = {
      id: generateId(),
      name: data.name,
      amount: data.amount,
      paidBy: data.paidBy,
      splitAmong: data.splitAmong,
    };

    expenseGroup.items.push(item);
    await db.trips.put(trip);
    return item;
  },

  async updateItem(
    tripId: string,
    expenseGroupId: string,
    itemId: string,
    updates: ItemUpdate
  ): Promise<Item | undefined> {
    const trip = await db.trips.get(tripId);
    if (!trip) return undefined;

    const expenseGroup = trip.subTopics.find((s) => s.id === expenseGroupId);
    if (!expenseGroup) return undefined;

    const item = expenseGroup.items.find((i) => i.id === itemId);
    if (!item) return undefined;

    if (updates.name !== undefined) item.name = updates.name;
    if (updates.amount !== undefined) item.amount = updates.amount;
    if (updates.paidBy !== undefined) item.paidBy = updates.paidBy;
    if (updates.splitAmong !== undefined) item.splitAmong = updates.splitAmong;

    await db.trips.put(trip);
    return item;
  },

  async deleteItem(
    tripId: string,
    expenseGroupId: string,
    itemId: string
  ): Promise<void> {
    const trip = await db.trips.get(tripId);
    if (!trip) return;

    const expenseGroup = trip.subTopics.find((s) => s.id === expenseGroupId);
    if (!expenseGroup) return;

    expenseGroup.items = expenseGroup.items.filter((i) => i.id !== itemId);
    await db.trips.put(trip);
  },
};
