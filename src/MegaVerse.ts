import axios, { AxiosInstance } from 'axios';
import { ComethDirection, MegaverseConfig, MegaverseError, Position, SoloonColor } from './types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class MegaVerse {
  private readonly api: AxiosInstance;
  private readonly candidateId: string;
  private lastRequestTime: number = 0;
  
  // 1 second between requests
  private readonly minRequestInterval: number = 1000;

  constructor(config: MegaverseConfig) {
    this.candidateId = config.candidateId;
    this.api = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private async makeRequest(method: 'post' | 'delete' | 'get', endpoint: string, data?: any): Promise<any> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minRequestInterval) {
      await delay(this.minRequestInterval - timeSinceLastRequest);
    }

    try {
      const response = await this.api.request({
        method,
        url: endpoint,
        data: method !== 'get' ? { ...data, candidateId: this.candidateId } : undefined,
        params: method === 'get' ? { candidateId: this.candidateId } : undefined,
      });
      
      this.lastRequestTime = Date.now();
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        throw new MegaverseError(
          error.message,
          error.response?.status,
          error.response?.data
        );
      }
      throw new MegaverseError('An unexpected error occurred');
    }
  }

  async createPolyanet({ row, column }: Position) {
    return this.makeRequest('post', '/polyanets', { row, column });
  }

  async deletePolyanet({ row, column }: Position) {
    return this.makeRequest('delete', '/polyanets', { row, column });
  }

  async createSoloon({ row, column }: Position, color: SoloonColor) {
    return this.makeRequest('post', '/soloons', { row, column, color });
  }

  async deleteSoloon({ row, column }: Position) {
    return this.makeRequest('delete', '/soloons', { row, column });
  }

  async createCometh({ row, column }: Position, direction: ComethDirection) {
    return this.makeRequest('post', '/comeths', { row, column, direction });
  }

  async deleteCometh({ row, column }: Position) {
    return this.makeRequest('delete', '/comeths', { row, column });
  }

  async getGoalMap() {
    return this.makeRequest('get', `/map/${this.candidateId}/goal`);
  }
}
