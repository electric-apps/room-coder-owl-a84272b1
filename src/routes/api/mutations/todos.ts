import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { todos } from "@/db/schema";
import { generateTxId, parseDates } from "@/db/utils";
import { todoInsertSchema, todoSelectSchema } from "@/db/zod-schemas";

const deleteBodySchema = todoSelectSchema.pick({ id: true });

export const Route = createFileRoute("/api/mutations/todos")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const parsed = todoInsertSchema.safeParse(
					parseDates(await request.json()),
				);
				if (!parsed.success) {
					return Response.json(
						{ error: parsed.error.message },
						{ status: 400 },
					);
				}
				try {
					const body = parsed.data;
					let txid = 0;
					await db.transaction(async (tx) => {
						txid = await generateTxId(tx);
						await tx.insert(todos).values({
							id: body.id,
							title: body.title,
							completed: body.completed ?? false,
							created_at: body.created_at ?? new Date(),
							updated_at: body.updated_at ?? new Date(),
						});
					});
					return Response.json({ txid });
				} catch {
					return Response.json(
						{ error: "Internal server error" },
						{ status: 500 },
					);
				}
			},
			PATCH: async ({ request }) => {
				const parsed = todoSelectSchema.safeParse(
					parseDates(await request.json()),
				);
				if (!parsed.success) {
					return Response.json(
						{ error: parsed.error.message },
						{ status: 400 },
					);
				}
				try {
					const body = parsed.data;
					let txid = 0;
					await db.transaction(async (tx) => {
						txid = await generateTxId(tx);
						await tx
							.update(todos)
							.set({
								title: body.title,
								completed: body.completed,
								updated_at: new Date(),
							})
							.where(eq(todos.id, body.id));
					});
					return Response.json({ txid });
				} catch {
					return Response.json(
						{ error: "Internal server error" },
						{ status: 500 },
					);
				}
			},
			DELETE: async ({ request }) => {
				const parsed = deleteBodySchema.safeParse(
					parseDates(await request.json()),
				);
				if (!parsed.success) {
					return Response.json(
						{ error: parsed.error.message },
						{ status: 400 },
					);
				}
				try {
					const { id } = parsed.data;
					let txid = 0;
					await db.transaction(async (tx) => {
						txid = await generateTxId(tx);
						await tx.delete(todos).where(eq(todos.id, id));
					});
					return Response.json({ txid });
				} catch {
					return Response.json(
						{ error: "Internal server error" },
						{ status: 500 },
					);
				}
			},
		},
	},
});
