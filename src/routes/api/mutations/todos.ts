import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { todos } from "@/db/schema";
import { generateTxId, parseDates } from "@/db/utils";

export const Route = createFileRoute("/api/mutations/todos")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const body = parseDates(await request.json());
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
			},
			PATCH: async ({ request }) => {
				const body = parseDates(await request.json());
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
			},
			DELETE: async ({ request }) => {
				const body = await request.json();
				let txid = 0;
				await db.transaction(async (tx) => {
					txid = await generateTxId(tx);
					await tx.delete(todos).where(eq(todos.id, body.id));
				});
				return Response.json({ txid });
			},
		},
	},
});
