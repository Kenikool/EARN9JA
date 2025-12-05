import { IProviderAdapter, ProviderType } from "../../types/provider.types.js";
import { ExternalProvider } from "../../models/ExternalProvider.js";

export class ProviderFactory {
  private static adapters: Map<string, IProviderAdapter> = new Map();

  static registerAdapter(adapter: IProviderAdapter): void {
    this.adapters.set(adapter.providerId, adapter);
  }

  static getAdapter(providerId: string): IProviderAdapter | undefined {
    return this.adapters.get(providerId);
  }

  static getAllAdapters(): IProviderAdapter[] {
    return Array.from(this.adapters.values());
  }

  static getAdaptersByType(type: ProviderType): IProviderAdapter[] {
    return Array.from(this.adapters.values()).filter(
      (adapter) => adapter.providerType === type
    );
  }

  static async loadProvidersFromDatabase(): Promise<void> {
    const providers = await ExternalProvider.find({ status: "active" });

    for (const provider of providers) {
      const adapter = this.adapters.get(provider.providerId);
      if (adapter) {
        console.log(`✓ Provider ${provider.name} loaded`);
      } else {
        console.warn(`⚠ No adapter found for provider: ${provider.providerId}`);
      }
    }
  }

  static hasAdapter(providerId: string): boolean {
    return this.adapters.has(providerId);
  }

  static removeAdapter(providerId: string): boolean {
    return this.adapters.delete(providerId);
  }

  static clear(): void {
    this.adapters.clear();
  }
}
