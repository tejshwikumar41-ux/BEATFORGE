import { ProjectState } from '../types';
import { AudioUtils } from '../utils/AudioUtils';

export class ProjectManager {
  private currentProject: ProjectState;

  constructor() {
    this.currentProject = this.createNewProject();
  }

  createNewProject(name: string = 'Untitled Project'): ProjectState {
    return {
      id: AudioUtils.generateId(),
      name,
      bpm: 120,
      timeSignatureNumerator: 4,
      timeSignatureDenominator: 4,
      tracks: [],
      masterVolume: 0.8,
      loopStart: 0,
      loopEnd: 16,
      loopEnabled: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }

  getProject(): ProjectState {
    return this.currentProject;
  }

  updateProject(updates: Partial<ProjectState>): void {
    Object.assign(this.currentProject, updates, { updatedAt: Date.now() });
  }

  save(): void {
    this.currentProject.updatedAt = Date.now();
    const key = `studio-pro-project-${this.currentProject.id}`;
    
    // Save without audio buffers (they need to be reloaded/regenerated)
    const saveState = {
      ...this.currentProject,
      tracks: this.currentProject.tracks.map(t => ({
        ...t,
        clips: t.clips.map(c => ({ ...c, buffer: null }))
      }))
    };
    
    try {
      localStorage.setItem(key, JSON.stringify(saveState));
      this.updateProjectList();
    } catch (e) {
      console.error('Failed to save project:', e);
    }
  }

  load(projectId: string): ProjectState | null {
    try {
      const data = localStorage.getItem(`studio-pro-project-${projectId}`);
      if (data) {
        this.currentProject = JSON.parse(data);
        return this.currentProject;
      }
    } catch (e) {
      console.error('Failed to load project:', e);
    }
    return null;
  }

  getProjectList(): { id: string; name: string; updatedAt: number }[] {
    try {
      const list = localStorage.getItem('studio-pro-project-list');
      return list ? JSON.parse(list) : [];
    } catch {
      return [];
    }
  }

  private updateProjectList(): void {
    const list = this.getProjectList();
    const existing = list.findIndex(p => p.id === this.currentProject.id);
    const entry = {
      id: this.currentProject.id,
      name: this.currentProject.name,
      updatedAt: this.currentProject.updatedAt
    };
    
    if (existing >= 0) {
      list[existing] = entry;
    } else {
      list.push(entry);
    }
    
    localStorage.setItem('studio-pro-project-list', JSON.stringify(list));
  }

  deleteProject(projectId: string): void {
    localStorage.removeItem(`studio-pro-project-${projectId}`);
    const list = this.getProjectList().filter(p => p.id !== projectId);
    localStorage.setItem('studio-pro-project-list', JSON.stringify(list));
  }

  exportProject(): string {
    return JSON.stringify(this.currentProject, null, 2);
  }

  importProject(json: string): ProjectState | null {
    try {
      const project = JSON.parse(json);
      if (project && project.id && typeof project.name === 'string') {
        this.currentProject = project;
        return this.currentProject;
      }
    } catch (e) {
      console.error('Failed to import project:', e);
    }
    return null;
  }
}
