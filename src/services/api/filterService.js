import { toast } from 'react-toastify';

class FilterService {
  constructor() {
    this.apperClient = null;
    this.initializeClient();
  }

initializeClient() {
    try {
      // Check if window.ApperSDK is available (Chrome timing fix)
      if (typeof window !== 'undefined' && window.ApperSDK) {
        const { ApperClient } = window.ApperSDK;
        this.apperClient = new ApperClient({
          apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
          apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
        });
      } else {
        // Retry initialization after a short delay for Chrome
        setTimeout(() => {
          if (window.ApperSDK && !this.apperClient) {
            this.initializeClient();
          }
        }, 100);
      }
    } catch (error) {
      console.error('Failed to initialize ApperClient:', error);
      // Retry once more after delay
      setTimeout(() => {
        if (!this.apperClient) {
          this.initializeClient();
        }
      }, 500);
    }
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "indicator_type" } },
          { field: { Name: "operator" } },
          { field: { Name: "threshold" } },
          { field: { Name: "enabled" } }
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

      const response = await this.apperClient.fetchRecords('filter', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      // Map database fields to UI expected fields
      return (response.data || []).map(filter => ({
        Id: filter.Id,
        indicatorType: filter.indicator_type,
        operator: filter.operator,
        threshold: filter.threshold,
        enabled: filter.enabled
      }));
    } catch (error) {
      console.error('Error fetching filters:', error);
      toast.error('Failed to load filters');
      return [];
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "indicator_type" } },
          { field: { Name: "operator" } },
          { field: { Name: "threshold" } },
          { field: { Name: "enabled" } }
        ]
      };

      const response = await this.apperClient.getRecordById('filter', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      const filter = response.data;
      return {
        Id: filter.Id,
        indicatorType: filter.indicator_type,
        operator: filter.operator,
        threshold: filter.threshold,
        enabled: filter.enabled
      };
    } catch (error) {
      console.error(`Error fetching filter with ID ${id}:`, error);
      throw error;
    }
  }

  async create(filterData) {
    try {
      const params = {
        records: [
          {
            Name: filterData.Name || `${filterData.indicatorType} Filter`,
            Tags: filterData.Tags || '',
            indicator_type: filterData.indicatorType,
            operator: filterData.operator,
            threshold: parseFloat(filterData.threshold),
            enabled: Boolean(filterData.enabled)
          }
        ]
      };

      const response = await this.apperClient.createRecord('filter', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
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
          const filter = successfulRecords[0].data;
          return {
            Id: filter.Id,
            indicatorType: filter.indicator_type,
            operator: filter.operator,
            threshold: filter.threshold,
            enabled: filter.enabled
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Error creating filter:', error);
      toast.error('Failed to create filter');
      return null;
    }
  }

  async update(id, updateData) {
    try {
      const params = {
        records: [
          {
            Id: parseInt(id),
            Name: updateData.Name || `${updateData.indicatorType} Filter`,
            Tags: updateData.Tags || '',
            indicator_type: updateData.indicatorType,
            operator: updateData.operator,
            threshold: parseFloat(updateData.threshold),
            enabled: Boolean(updateData.enabled)
          }
        ]
      };

      const response = await this.apperClient.updateRecord('filter', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
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
          const filter = successfulRecords[0].data;
          return {
            Id: filter.Id,
            indicatorType: filter.indicator_type,
            operator: filter.operator,
            threshold: filter.threshold,
            enabled: filter.enabled
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Error updating filter:', error);
      toast.error('Failed to update filter');
      return null;
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord('filter', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
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
      console.error('Error deleting filter:', error);
      toast.error('Failed to delete filter');
      return false;
    }
  }
}

export default new FilterService();