import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { createCollection } from "@tanstack/react-db";
import { todoSelectSchema } from "@/db/zod-schemas";

export const todosCollection = createCollection(
	electricCollectionOptions({
		id: "todos",
		schema: todoSelectSchema,
		getKey: (row) => row.id,
		shapeOptions: {
			url: new URL(
				"/api/todos",
				typeof window !== "undefined"
					? window.location.origin
					: "http://localhost:5173",
			).toString(),
			parser: {
				timestamptz: (date: string) => new Date(date),
			},
		},
		onInsert: async ({ transaction }) => {
			const { modified: newTodo } = transaction.mutations[0];
			const res = await fetch("/api/mutations/todos", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(newTodo),
			});
			if (!res.ok)
				throw new Error(
					`Failed to insert todo: ${res.status} ${res.statusText}`,
				);
			const data = await res.json();
			return { txid: data.txid };
		},
		onUpdate: async ({ transaction }) => {
			const { modified: updated } = transaction.mutations[0];
			const res = await fetch(`/api/mutations/todos`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(updated),
			});
			if (!res.ok)
				throw new Error(
					`Failed to update todo: ${res.status} ${res.statusText}`,
				);
			const data = await res.json();
			return { txid: data.txid };
		},
		onDelete: async ({ transaction }) => {
			const { original: deleted } = transaction.mutations[0];
			const res = await fetch(`/api/mutations/todos`, {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id: deleted.id }),
			});
			if (!res.ok)
				throw new Error(
					`Failed to delete todo: ${res.status} ${res.statusText}`,
				);
			const data = await res.json();
			return { txid: data.txid };
		},
	}),
);
