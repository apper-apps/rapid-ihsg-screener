import presetData from '@/services/mockData/presets.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class PresetService {
  async getAll() {
    await delay(200);
    return [...presetData];
  }

  async getById(id) {
    await delay(150);
    const preset = presetData.find(item => item.Id === parseInt(id, 10));
    if (!preset) {
      throw new Error('Preset not found');
    }
    return { ...preset };
  }

  async create(presetData) {
    await delay(250);
    const newId = Math.max(...presetData.map(p => p.Id), 0) + 1;
    const newPreset = {
      Id: newId,
      ...presetData,
      createdAt: new Date().toISOString()
    };
    return { ...newPreset };
  }

  async update(id, updateData) {
    await delay(200);
    const presetId = parseInt(id, 10);
    const presetIndex = presetData.findIndex(item => item.Id === presetId);
    if (presetIndex === -1) {
      throw new Error('Preset not found');
    }
    
    const updatedPreset = {
      ...presetData[presetIndex],
      ...updateData,
      Id: presetId,
      updatedAt: new Date().toISOString()
    };
    
    return { ...updatedPreset };
  }

  async delete(id) {
    await delay(200);
    const presetId = parseInt(id, 10);
    const presetIndex = presetData.findIndex(item => item.Id === presetId);
    if (presetIndex === -1) {
      throw new Error('Preset not found');
    }
    
    return { success: true };
  }
}

export default new PresetService();