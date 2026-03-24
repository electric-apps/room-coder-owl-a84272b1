import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { todos } from "./schema";

const timestampField = z
	.union([z.string(), z.date()])
	.transform((val) => (typeof val === "string" ? new Date(val) : val));

export const todoSelectSchema = createSelectSchema(todos, {
	created_at: timestampField,
	updated_at: timestampField,
});

export const todoInsertSchema = createInsertSchema(todos, {
	created_at: timestampField,
	updated_at: timestampField,
});

export type Todo = typeof todoSelectSchema._type;
export type NewTodo = typeof todoInsertSchema._type;
