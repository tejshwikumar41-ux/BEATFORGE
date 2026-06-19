interface UndoAction {
  description: string;
  undo: () => void;
  redo: () => void;
}

export class UndoManager {
  private undoStack: UndoAction[] = [];
  private redoStack: UndoAction[] = [];
  private maxHistory = 100;
  private onChangeCallbacks: Set<() => void> = new Set();

  push(action: UndoAction): void {
    this.undoStack.push(action);
    this.redoStack = [];
    
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift();
    }
    
    this.notifyChange();
  }

  undo(): void {
    const action = this.undoStack.pop();
    if (action) {
      action.undo();
      this.redoStack.push(action);
      this.notifyChange();
    }
  }

  redo(): void {
    const action = this.redoStack.pop();
    if (action) {
      action.redo();
      this.undoStack.push(action);
      this.notifyChange();
    }
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  getUndoDescription(): string {
    return this.undoStack.length > 0 ? this.undoStack[this.undoStack.length - 1].description : '';
  }

  getRedoDescription(): string {
    return this.redoStack.length > 0 ? this.redoStack[this.redoStack.length - 1].description : '';
  }

  onChange(callback: () => void): () => void {
    this.onChangeCallbacks.add(callback);
    return () => this.onChangeCallbacks.delete(callback);
  }

  private notifyChange(): void {
    this.onChangeCallbacks.forEach(cb => cb());
  }

  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
    this.notifyChange();
  }
}
