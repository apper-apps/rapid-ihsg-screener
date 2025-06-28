import { toast } from 'react-toastify';

class PresetService {
  constructor() {
    this.client = null;
    this.initializeClient();
  }

  initializeClient() {
    try {
      const { ApperClient } = window.ApperSDK;
      this.client = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
    } catch (error) {
      console.error('Failed to initialize ApperClient:', error);
    }
  }

  async getAll() {
    try {
      if (!this.client) {
        throw new Error('ApperClient not initialized');
      }

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "description" } },
          { field: { Name: "filters" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "CreatedOn" } },
          { field: { Name: "ModifiedOn" } }
        ],
        orderBy: [
          {
            fieldName: "ModifiedOn",
            sorttype: "DESC"
          }
        ]
      };

      const response = await this.client.fetchRecords('preset', params);

      if (!response.success) {
        console.error('API Error:', response.message);
        toast.error(response.message);
        return [];
      }

      if (!response.data || response.data.length === 0) {
        return [];
      }

      return response.data.map(preset => ({
        Id: preset.Id,
        name: preset.Name,
        description: preset.description || '',
        filters: this.parseFilters(preset.filters),
        tags: preset.Tags || '',
        owner: preset.Owner,
        createdOn: preset.CreatedOn,
        modifiedOn: preset.ModifiedOn
      }));
    } catch (error) {
      console.error('Error fetching presets:', error);
      toast.error('Failed to load presets');
      return [];
    }
  }

  async getById(id) {
    try {
      if (!this.client) {
        throw new Error('ApperClient not initialized');
      }

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "description" } },
          { field: { Name: "filters" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } }
        ]
      };

      const response = await this.client.getRecordById('preset', parseInt(id), params);

      if (!response.success) {
        console.error('API Error:', response.message);
        throw new Error(response.message);
      }

      if (!response.data) {
        throw new Error('Preset not found');
      }

      return {
        Id: response.data.Id,
        name: response.data.Name,
        description: response.data.description || '',
        filters: this.parseFilters(response.data.filters),
        tags: response.data.Tags || '',
        owner: response.data.Owner
      };
    } catch (error) {
      console.error(`Error fetching preset with ID ${id}:`, error);
      throw error;
    }
  }

  async create(presetData) {
    try {
      if (!this.client) {
        throw new Error('ApperClient not initialized');
      }

      const params = {
        records: [{
          Name: presetData.name,
          description: presetData.description || '',
          filters: this.stringifyFilters(presetData.filters),
          Tags: presetData.tags || ''
        }]
      };

      const response = await this.client.createRecord('preset', params);

      if (!response.success) {
        console.error('API Error:', response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);

        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }

        if (successfulRecords.length > 0) {
          return successfulRecords[0].data;
        }
      }

      return null;
    } catch (error) {
      console.error('Error creating preset:', error);
      toast.error('Failed to create preset');
      return null;
    }
  }

  async update(id, updateData) {
    try {
      if (!this.client) {
        throw new Error('ApperClient not initialized');
      }

      const params = {
        records: [{
          Id: parseInt(id),
          Name: updateData.name,
          description: updateData.description || '',
          filters: this.stringifyFilters(updateData.filters),
          Tags: updateData.tags || ''
        }]
      };

      const response = await this.client.updateRecord('preset', params);

      if (!response.success) {
        console.error('API Error:', response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);

        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }

        if (successfulUpdates.length > 0) {
          return successfulUpdates[0].data;
        }
      }

      return null;
    } catch (error) {
      console.error('Error updating preset:', error);
      toast.error('Failed to update preset');
      return null;
    }
  }

  async delete(id) {
    try {
      if (!this.client) {
        throw new Error('ApperClient not initialized');
      }

      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.client.deleteRecord('preset', params);

      if (!response.success) {
        console.error('API Error:', response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);

        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        return successfulDeletions.length > 0;
      }

      return false;
    } catch (error) {
      console.error('Error deleting preset:', error);
      toast.error('Failed to delete preset');
      return false;
    }
  }

  parseFilters(filtersString) {
    if (!filtersString || typeof filtersString !== 'string') {
      return [];
    }

    try {
      return JSON.parse(filtersString);
    } catch (error) {
      console.error('Error parsing filters:', error);
      return [];
    }
  }

  stringifyFilters(filters) {
    if (!Array.isArray(filters)) {
      return '[]';
    }

    try {
      return JSON.stringify(filters);
    } catch (error) {
      console.error('Error stringifying filters:', error);
      return '[]';
    }
  }
}

const presetService = new PresetService();
export default presetService;