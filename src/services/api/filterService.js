import filterData from '@/services/mockData/filters.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class FilterService {
  async getAll() {
    await delay(200);
    return [...filterData];
  }

  async getById(id) {
    await delay(150);
    const filter = filterData.find(item => item.Id === parseInt(id, 10));
    if (!filter) {
      throw new Error('Filter not found');
    }
    return { ...filter };
  }

  async create(filterData) {
    await delay(250);
    const newId = Math.max(...filterData.map(f => f.Id), 0) + 1;
    const newFilter = {
      Id: newId,
      ...filterData,
      createdAt: new Date().toISOString()
    };
    return { ...newFilter };
  }

  async update(id, updateData) {
    await delay(200);
    const filterId = parseInt(id, 10);
    const filterIndex = filterData.findIndex(item => item.Id === filterId);
    if (filterIndex === -1) {
      throw new Error('Filter not found');
    }
    
    const updatedFilter = {
      ...filterData[filterIndex],
      ...updateData,
      Id: filterId,
      updatedAt: new Date().toISOString()
    };
    
    return { ...updatedFilter };
  }

  async delete(id) {
    await delay(200);
    const filterId = parseInt(id, 10);
    const filterIndex = filterData.findIndex(item => item.Id === filterId);
    if (filterIndex === -1) {
      throw new Error('Filter not found');
    }
    
    return { success: true };
  }
}

export default new FilterService();