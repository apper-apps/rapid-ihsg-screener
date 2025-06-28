import { toast } from 'react-toastify';

class PresetService {
  constructor() {
    this.apperClient = null;
    this.initializeClient();
  }

  initializeClient() {
    try {
      const { ApperClient } = window.ApperSDK;
      this.apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
    } catch (error) {
      console.error('Failed to initialize ApperClient:', error);
    }
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "description" } },
          { field: { Name: "filters" } }
        ],
        orderBy: [
          {
            fieldName: "Name",
            sorttype: "ASC"
          }
        ],
        pagingInfo: {
          limit: 100,
          offset: 0
        }
      };

      const response = await this.apperClient.fetchRecords('preset', params);
      
if (!response || !response.success) {
        const errorMessage = response?.message || 'Failed to fetch presets';
        console.error(errorMessage);
        toast.error(errorMessage);
        return [];
      }
      // Map database fields and parse filters JSON
      return (response.data || []).map(preset => ({
        Id: preset.Id,
        name: preset.Name,
        description: preset.description,
        filters: this.parseFilters(preset.filters)
      }));
    } catch (error) {
      console.error('Error fetching presets:', error);
      toast.error('Failed to load presets');
      return [];
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "description" } },
          { field: { Name: "filters" } }
        ]
      };

      const response = await this.apperClient.getRecordById('preset', parseInt(id), params);
      
if (!response || !response.success) {
        const errorMessage = response?.message || 'Failed to fetch preset';
        console.error(errorMessage);
        throw new Error(errorMessage);
      }
      const preset = response.data;
      return {
        Id: preset.Id,
        name: preset.Name,
        description: preset.description,
        filters: this.parseFilters(preset.filters)
      };
    } catch (error) {
      console.error(`Error fetching preset with ID ${id}:`, error);
      throw error;
    }
  }

  async create(presetData) {
    try {
      const params = {
        records: [
          {
            Name: presetData.name,
            Tags: presetData.Tags || '',
            description: presetData.description || '',
            filters: this.stringifyFilters(presetData.filters)
          }
        ]
      };

      const response = await this.apperClient.createRecord('preset', params);
      
if (!response || !response.success) {
        const errorMessage = response?.message || 'Failed to create preset';
        console.error(errorMessage);
        toast.error(errorMessage);
        return null;
      }
      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          failedRecords.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        const successfulRecords = response.results.filter(result => result.success);
        if (successfulRecords.length > 0) {
          const preset = successfulRecords[0].data;
          return {
            Id: preset.Id,
            name: preset.Name,
            description: preset.description,
            filters: this.parseFilters(preset.filters)
          };
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
      const params = {
        records: [
          {
            Id: parseInt(id),
            Name: updateData.name,
            Tags: updateData.Tags || '',
            description: updateData.description || '',
            filters: this.stringifyFilters(updateData.filters)
          }
        ]
      };

      const response = await this.apperClient.updateRecord('preset', params);
if (!response || !response.success) {
        const errorMessage = response?.message || 'Failed to update preset';
        console.error(errorMessage);
        toast.error(errorMessage);
        return null;
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to update ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          failedRecords.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        const successfulRecords = response.results.filter(result => result.success);
        if (successfulRecords.length > 0) {
          const preset = successfulRecords[0].data;
          return {
            Id: preset.Id,
            name: preset.Name,
            description: preset.description,
            filters: this.parseFilters(preset.filters)
          };
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
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord('preset', params);
      
if (!response || !response.success) {
        const errorMessage = response?.message || 'Failed to delete preset';
        console.error(errorMessage);
        toast.error(errorMessage);
        return false;
      }
      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to delete ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          failedRecords.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        const successfulRecords = response.results.filter(result => result.success);
        return successfulRecords.length > 0;
      }

      return false;
    } catch (error) {
      console.error('Error deleting preset:', error);
      toast.error('Failed to delete preset');
      return false;
    }
  }

  // Helper methods for filter serialization
  parseFilters(filtersString) {
    try {
      if (!filtersString) return [];
      return JSON.parse(filtersString);
    } catch (error) {
      console.error('Error parsing filters:', error);
      return [];
    }
  }

  stringifyFilters(filters) {
    try {
      return JSON.stringify(filters || []);
    } catch (error) {
      console.error('Error stringifying filters:', error);
      return '[]';
    }
  }
}

export default new PresetService();