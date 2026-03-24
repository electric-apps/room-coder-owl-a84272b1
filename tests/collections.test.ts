import { describe, it, expect } from "vitest"
import { todoSelectSchema, todoInsertSchema } from "@/db/zod-schemas"
import { generateValidRow } from "./helpers/schema-test-utils"
import { parseDates } from "./helpers/schema-test-utils"

describe("todos collection validation", () => {
	it("validates a todo for insert", () => {
		const row = generateValidRow(todoInsertSchema)
		const result = todoInsertSchema.safeParse(row)
		expect(result.success).toBe(true)
	})

	it("validates a todo for select", () => {
		const row = generateValidRow(todoSelectSchema)
		const result = todoSelectSchema.safeParse(row)
		expect(result.success).toBe(true)
	})

	it("survives JSON round-trip via parseDates", () => {
		const row = generateValidRow(todoSelectSchema)
		const roundTripped = parseDates(JSON.parse(JSON.stringify(row)))
		const result = todoSelectSchema.safeParse(roundTripped)
		expect(result.success).toBe(true)
	})

	it("completed accepts boolean values", () => {
		const row = generateValidRow(todoInsertSchema)
		// drizzle-zod insert schema makes defaulted fields optional (DB handles the default)
		// so completed: undefined is accepted
		const resultUndefined = todoInsertSchema.safeParse({ ...row, completed: undefined })
		expect(resultUndefined.success).toBe(true)
		// false and true are both valid
		const resultFalse = todoInsertSchema.safeParse({ ...row, completed: false })
		expect(resultFalse.success).toBe(true)
		if (resultFalse.success) {
			expect(resultFalse.data.completed).toBe(false)
		}
	})

	it("rejects invalid UUID for id", () => {
		const row = generateValidRow(todoSelectSchema)
		const result = todoSelectSchema.safeParse({ ...row, id: "not-a-uuid" })
		expect(result.success).toBe(false)
	})
})
