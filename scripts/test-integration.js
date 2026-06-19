class ProjectManager {
  constructor() {
    this.currentProject = this.createNewProject();
  }

  createNewProject(name = 'Untitled Project') {
    return {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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

  getProject() {
    return this.currentProject;
  }

  updateProject(updates) {
    Object.assign(this.currentProject, updates, { updatedAt: Date.now() });
  }

  save() {
    this.currentProject.updatedAt = Date.now();
    const key = `studio-pro-project-${this.currentProject.id}`;
    
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

  load(projectId) {
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

  getProjectList() {
    try {
      const list = localStorage.getItem('studio-pro-project-list');
      return list ? JSON.parse(list) : [];
    } catch {
      return [];
    }
  }

  updateProjectList() {
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
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`✅ ${message}`);
}

console.log('Running Project Integration Tests...');

// Mock browser LocalStorage API for Node environment
const mockStorage = {};
global.localStorage = {
  setItem(key, value) {
    mockStorage[key] = String(value);
  },
  getItem(key) {
    return mockStorage[key] || null;
  },
  removeItem(key) {
    delete mockStorage[key];
  }
};

try {
  const pm = new ProjectManager();
  
  // 1. Initial State
  const initialProject = pm.getProject();
  assert(initialProject.name === 'Untitled Project', 'Initial project name defaults to Untitled Project');
  assert(initialProject.bpm === 120, 'Initial BPM is 120');

  // 2. Modify State
  pm.updateProject({ name: 'My Hit Beat', bpm: 128 });
  assert(pm.getProject().name === 'My Hit Beat', 'Project name successfully modified');
  assert(pm.getProject().bpm === 128, 'Project BPM successfully modified');

  // 3. Save and Load Round-Trip
  pm.save();
  
  const newList = pm.getProjectList();
  assert(newList.length === 1, 'Project list includes saved project');
  assert(newList[0].name === 'My Hit Beat', 'Project list displays updated name');

  // Load new instance
  const pm2 = new ProjectManager();
  const loadedProject = pm2.load(initialProject.id);
  assert(loadedProject !== null, 'Project loaded successfully');
  assert(loadedProject.name === 'My Hit Beat', 'Loaded project name matches original');
  assert(loadedProject.bpm === 128, 'Loaded project BPM matches original');

  console.log('\nAll Project save/load integration tests passed successfully!');
} catch (e) {
  console.error('\nFAIL:', e.stack);
  process.exit(1);
}
