// Mock storage for testing when MongoDB is not available
export class MockStorage {
  private users = new Map();
  private farmers = new Map();
  private customers = new Map();

  async getUserByPhone(phone: string) {
    for (const [id, user] of this.users) {
      if (user.phone === phone) {
        return { id, ...user };
      }
    }
    return null;
  }

  async createUser(userData: any) {
    const id = Math.random().toString(36).substr(2, 9);
    const user = { ...userData, id };
    this.users.set(id, user);
    return { id, ...user };
  }

  async createFarmer(farmerData: any) {
    const id = Math.random().toString(36).substr(2, 9);
    const farmer = { ...farmerData, id };
    this.farmers.set(id, farmer);
    return { id, ...farmer };
  }

  async createCustomer(customerData: any) {
    const id = Math.random().toString(36).substr(2, 9);
    const customer = { ...customerData, id };
    this.customers.set(id, customer);
    return { id, ...customer };
  }

  async getFarmerByUserId(userId: string) {
    for (const [id, farmer] of this.farmers) {
      if (farmer.userId === userId) {
        return { id, ...farmer };
      }
    }
    return null;
  }

  async getCustomerByUserId(userId: string) {
    for (const [id, customer] of this.customers) {
      if (customer.userId === userId) {
        return { id, ...customer };
      }
    }
    return null;
  }

  // Add mock implementations for other required methods
  async getUser(id: string) {
    const user = this.users.get(id);
    return user ? { id, ...user } : null;
  }

  async updateUserLanguage(userId: string, language: string) {
    const user = this.users.get(userId);
    if (user) {
      user.language = language;
      return { id: userId, ...user };
    }
    return null;
  }

  async updateUserProfile(userId: string, data: any) {
    const user = this.users.get(userId);
    if (user) {
      Object.assign(user, data);
      return { id: userId, ...user };
    }
    return null;
  }

  async deleteAccount(userId: string) {
    this.users.delete(userId);
    // Also delete related farmer/customer records
    for (const [id, farmer] of this.farmers) {
      if (farmer.userId === userId) {
        this.farmers.delete(id);
      }
    }
    for (const [id, customer] of this.customers) {
      if (customer.userId === userId) {
        this.customers.delete(id);
      }
    }
    return true;
  }

  // Mock implementations for crop-related methods
  async getCrop(id: string) {
    return null;
  }

  async getCropsByFarmerId(farmerId: string) {
    return [];
  }

  async getActiveCrops() {
    return [];
  }

  async createCrop(cropData: any) {
    return null;
  }

  async updateCrop(id: string, data: any) {
    return null;
  }

  async deleteCrop(id: string) {
    return true;
  }

  // Mock implementations for other methods
  async getDeliveryRequest(id: string) { return null; }
  async createDeliveryRequest(data: any) { return null; }
  async getDeliveryRequestsByFarmerId(farmerId: string) { return []; }
  async getDeliveryRequestsByCustomerId(customerId: string) { return []; }
  async updateDeliveryRequest(id: string, data: any) { return null; }
  async getUpcomingCrop(id: string) { return null; }
  async createUpcomingCrop(data: any) { return null; }
  async getUpcomingCropsByFarmerId(farmerId: string) { return []; }
  async getAllUpcoming() { return []; }
  async updateUpcoming(id: string, data: any) { return null; }
  async deleteUpcomingCrop(id: string) { return true; }
  async getFarmerById(id: string) { return null; }
  async updateFarmerProfile(userId: string, data: any) { return null; }
}
