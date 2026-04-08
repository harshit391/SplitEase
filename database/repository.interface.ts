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

export interface ITripsRepository {
  getAll(): Promise<Trip[]>;
  getById(id: string): Promise<Trip | undefined>;
  create(data: TripCreate): Promise<Trip>;
  update(id: string, updates: TripUpdate): Promise<Trip | undefined>;
  delete(id: string): Promise<void>;
  import(trip: Trip): Promise<Trip>;

  addExpenseGroup(
    tripId: string,
    data: ExpenseGroupCreate
  ): Promise<ExpenseGroup | undefined>;
  updateExpenseGroup(
    tripId: string,
    expenseGroupId: string,
    updates: ExpenseGroupUpdate
  ): Promise<ExpenseGroup | undefined>;
  deleteExpenseGroup(
    tripId: string,
    expenseGroupId: string
  ): Promise<void>;

  addItem(
    tripId: string,
    expenseGroupId: string,
    data: ItemCreate
  ): Promise<Item | undefined>;
  updateItem(
    tripId: string,
    expenseGroupId: string,
    itemId: string,
    updates: ItemUpdate
  ): Promise<Item | undefined>;
  deleteItem(
    tripId: string,
    expenseGroupId: string,
    itemId: string
  ): Promise<void>;
}
