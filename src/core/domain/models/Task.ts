// Placeholder Task class for initial setup / test example

export class Task {
    public readonly id: string;
    public title: string;
    public completed: boolean;

    constructor(id: string, title: string, completed: boolean = false) {
        if (!title.trim()) {
            throw new Error("Task title cannot be empty.");
        }

        this.id = id;
        this.title = title;
        this.completed = completed;
    }

    toggle(): void {
        this.completed = !this.completed;
    }
}