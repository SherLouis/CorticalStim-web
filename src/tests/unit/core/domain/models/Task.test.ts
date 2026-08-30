import { describe, it, expect } from 'bun:test';
import { Task } from '@/core/domain/models/Task'

// Test example
describe('Task Domain Model', () => {
    it('should create a valid task entity', () => {
        const task = new Task('1', 'Clean Architecture Setup with Bun');
        expect(task.completed).toBe(false);
    });

    it('should throw an error when title is empty', () => {
        expect(() => new Task('2', '')).toThrow('Task title cannot be empty.');
    });
});