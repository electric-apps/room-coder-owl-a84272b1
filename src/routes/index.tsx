import {
	AlertDialog,
	Badge,
	Button,
	Callout,
	Card,
	Checkbox,
	Container,
	Dialog,
	Flex,
	Heading,
	IconButton,
	Separator,
	Spinner,
	Text,
	TextField,
} from "@radix-ui/themes";
import { useLiveQuery } from "@tanstack/react-db";
import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle, ClipboardList, Plus, Trash2 } from "lucide-react";
import { useId, useState } from "react";
import { todosCollection } from "@/db/collections/todos";
import type { Todo } from "@/db/zod-schemas";

export const Route = createFileRoute("/")({
	ssr: false,
	loader: async () => {
		await todosCollection.preload();
		return null;
	},
	component: TodoPage,
});

function TodoPage() {
	const todoInputId = useId();
	const [addOpen, setAddOpen] = useState(false);
	const [newTitle, setNewTitle] = useState("");
	const [deleteTarget, setDeleteTarget] = useState<Todo | null>(null);
	const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
	const [mutationError, setMutationError] = useState<string | null>(null);

	const { data: allTodos, isLoading } = useLiveQuery(
		(q) =>
			q
				.from({ todo: todosCollection })
				.orderBy(({ todo }) => todo.created_at, "desc"),
		[],
	);

	const activeTodos = allTodos?.filter((t) => !t.completed) ?? [];
	const completedTodos = allTodos?.filter((t) => t.completed) ?? [];

	const displayedTodos =
		filter === "active"
			? activeTodos
			: filter === "completed"
				? completedTodos
				: (allTodos ?? []);

	const handleAdd = () => {
		if (!newTitle.trim()) return;
		setMutationError(null);
		const tx = todosCollection.insert({
			id: crypto.randomUUID(),
			title: newTitle.trim(),
			completed: false,
			created_at: new Date(),
			updated_at: new Date(),
		});
		tx.isPersisted.promise.catch((err: unknown) => {
			setMutationError(
				err instanceof Error ? err.message : "Failed to add todo",
			);
		});
		setNewTitle("");
		setAddOpen(false);
	};

	const handleToggle = (todo: Todo) => {
		setMutationError(null);
		const tx = todosCollection.update(todo.id, (draft) => {
			draft.completed = !draft.completed;
			draft.updated_at = new Date();
		});
		tx.isPersisted.promise.catch((err: unknown) => {
			setMutationError(
				err instanceof Error ? err.message : "Failed to update todo",
			);
		});
	};

	const handleDelete = () => {
		if (!deleteTarget) return;
		setMutationError(null);
		const tx = todosCollection.delete(deleteTarget.id);
		tx.isPersisted.promise.catch((err: unknown) => {
			setMutationError(
				err instanceof Error ? err.message : "Failed to delete todo",
			);
		});
		setDeleteTarget(null);
	};

	if (isLoading) {
		return (
			<Flex align="center" justify="center" py="9">
				<Spinner size="3" />
			</Flex>
		);
	}

	return (
		<Container size="2" py="6">
			<Flex direction="column" gap="5">
				{/* Error banner */}
				{mutationError && (
					<Callout.Root color="red">
						<Callout.Icon>
							<AlertCircle size={16} />
						</Callout.Icon>
						<Callout.Text>{mutationError}</Callout.Text>
					</Callout.Root>
				)}

				{/* Header */}
				<Flex justify="between" align="center">
					<Flex direction="column" gap="1">
						<Heading size="7">My Todos</Heading>
						<Text size="2" color="gray">
							{activeTodos.length} task{activeTodos.length !== 1 ? "s" : ""}{" "}
							remaining
						</Text>
					</Flex>
					<Dialog.Root open={addOpen} onOpenChange={setAddOpen}>
						<Dialog.Trigger>
							<Button>
								<Plus size={16} />
								Add Todo
							</Button>
						</Dialog.Trigger>
						<Dialog.Content maxWidth="450px">
							<Dialog.Title>New Todo</Dialog.Title>
							<Flex direction="column" gap="4" mt="4">
								<Flex direction="column" gap="1">
									<Text
										size="2"
										weight="medium"
										as="label"
										htmlFor={todoInputId}
									>
										What needs to be done?
									</Text>
									<TextField.Root
										id={todoInputId}
										placeholder="Enter todo title..."
										value={newTitle}
										onChange={(e) => setNewTitle(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter") handleAdd();
										}}
										autoFocus
									/>
								</Flex>
								<Flex gap="3" justify="end" mt="2">
									<Dialog.Close>
										<Button variant="soft" color="gray">
											Cancel
										</Button>
									</Dialog.Close>
									<Button onClick={handleAdd} disabled={!newTitle.trim()}>
										Add Todo
									</Button>
								</Flex>
							</Flex>
						</Dialog.Content>
					</Dialog.Root>
				</Flex>

				{/* Filter tabs */}
				{(allTodos?.length ?? 0) > 0 && (
					<Flex gap="2">
						{(["all", "active", "completed"] as const).map((f) => (
							<Button
								key={f}
								variant={filter === f ? "solid" : "soft"}
								color={filter === f ? undefined : "gray"}
								size="1"
								onClick={() => setFilter(f)}
							>
								{f.charAt(0).toUpperCase() + f.slice(1)}
								{f === "active" && activeTodos.length > 0 && (
									<Badge size="1" variant="soft" ml="1">
										{activeTodos.length}
									</Badge>
								)}
								{f === "completed" && completedTodos.length > 0 && (
									<Badge size="1" variant="soft" color="green" ml="1">
										{completedTodos.length}
									</Badge>
								)}
							</Button>
						))}
					</Flex>
				)}

				{/* Todo list */}
				{displayedTodos.length === 0 ? (
					<Flex direction="column" align="center" gap="3" py="9">
						<ClipboardList size={48} strokeWidth={1} color="var(--gray-8)" />
						<Text size="4" color="gray">
							{filter === "completed"
								? "No completed todos yet"
								: filter === "active"
									? "All done! No active todos"
									: "No todos yet"}
						</Text>
						{filter === "all" && (
							<Button variant="soft" onClick={() => setAddOpen(true)}>
								Create your first todo
							</Button>
						)}
					</Flex>
				) : (
					<Card variant="surface">
						<Flex direction="column">
							{displayedTodos.map((todo, idx) => (
								<div key={todo.id}>
									<Flex align="center" gap="3" py="3" px="1">
										<Checkbox
											checked={todo.completed}
											onCheckedChange={() => handleToggle(todo)}
											size="2"
										/>
										<Text
											size="3"
											style={{
												flex: 1,
												textDecoration: todo.completed
													? "line-through"
													: "none",
												opacity: todo.completed ? 0.5 : 1,
											}}
										>
											{todo.title}
										</Text>
										<IconButton
											size="1"
											variant="ghost"
											color="red"
											onClick={() => setDeleteTarget(todo)}
										>
											<Trash2 size={14} />
										</IconButton>
									</Flex>
									{idx < displayedTodos.length - 1 && <Separator size="4" />}
								</div>
							))}
						</Flex>
					</Card>
				)}
			</Flex>

			{/* Delete confirmation dialog */}
			<AlertDialog.Root
				open={!!deleteTarget}
				onOpenChange={(open) => !open && setDeleteTarget(null)}
			>
				<AlertDialog.Content maxWidth="400px">
					<AlertDialog.Title>Delete Todo</AlertDialog.Title>
					<AlertDialog.Description size="2">
						Are you sure you want to delete &quot;{deleteTarget?.title}&quot;?
						This action cannot be undone.
					</AlertDialog.Description>
					<Flex gap="3" justify="end" mt="4">
						<AlertDialog.Cancel>
							<Button variant="soft" color="gray">
								Cancel
							</Button>
						</AlertDialog.Cancel>
						<AlertDialog.Action>
							<Button color="red" onClick={handleDelete}>
								Delete
							</Button>
						</AlertDialog.Action>
					</Flex>
				</AlertDialog.Content>
			</AlertDialog.Root>
		</Container>
	);
}
