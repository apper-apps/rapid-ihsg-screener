import { toast } from 'react-toastify';

class IndicatorService {
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
          { field: { Name: "stock_id" } },
          { field: { Name: "type" } },
          { field: { Name: "value" } },
          { field: { Name: "signal" } },
          { field: { Name: "timestamp" } }
        ],
        orderBy: [
          {
            fieldName: "timestamp",
            sorttype: "DESC"
          }
        ],
        pagingInfo: {
          limit: 1000,
          offset: 0
        }
      };

      const response = await this.apperClient.fetchRecords('indicator', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error('Error fetching indicators:', error);
      toast.error('Failed to load indicators');
      return [];
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "stock_id" } },
          { field: { Name: "type" } },
          { field: { Name: "value" } },
          { field: { Name: "signal" } },
          { field: { Name: "timestamp" } }
        ]
      };

      const response = await this.apperClient.getRecordById('indicator', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching indicator with ID ${id}:`, error);
      throw error;
    }
  }

  async getByStockId(stockId) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "stock_id" } },
          { field: { Name: "type" } },
          { field: { Name: "value" } },
          { field: { Name: "signal" } },
          { field: { Name: "timestamp" } }
        ],
        where: [
          {
            FieldName: "stock_id",
            Operator: "EqualTo",
            Values: [parseInt(stockId)]
          }
        ],
        orderBy: [
          {
            fieldName: "timestamp",
            sorttype: "DESC"
          }
        ]
      };

      const response = await this.apperClient.fetchRecords('indicator', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error('Error fetching indicators by stock ID:', error);
      return [];
    }
  }

  async create(indicatorData) {
    try {
      const params = {
        records: [
          {
            Name: indicatorData.Name,
            Tags: indicatorData.Tags,
            stock_id: parseInt(indicatorData.stock_id),
            type: indicatorData.type,
            value: parseFloat(indicatorData.value),
            signal: indicatorData.signal,
            timestamp: indicatorData.timestamp || new Date().toISOString()
          }
        ]
      };

      const response = await this.apperClient.createRecord('indicator', params);
      
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
        return successfulRecords.length > 0 ? successfulRecords[0].data : null;
      }

      return null;
    } catch (error) {
      console.error('Error creating indicator:', error);
      toast.error('Failed to create indicator');
      return null;
    }
  }

  async update(id, updateData) {
    try {
      const params = {
        records: [
          {
            Id: parseInt(id),
            Name: updateData.Name,
            Tags: updateData.Tags,
            stock_id: parseInt(updateData.stock_id),
            type: updateData.type,
            value: parseFloat(updateData.value),
            signal: updateData.signal,
            timestamp: updateData.timestamp
          }
        ]
      };

      const response = await this.apperClient.updateRecord('indicator', params);
      
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
        return successfulRecords.length > 0 ? successfulRecords[0].data : null;
      }

      return null;
    } catch (error) {
      console.error('Error updating indicator:', error);
      toast.error('Failed to update indicator');
      return null;
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord('indicator', params);
      
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
      console.error('Error deleting indicator:', error);
      toast.error('Failed to delete indicator');
      return false;
    }
  }
}

export default new IndicatorService();