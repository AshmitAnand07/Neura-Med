import { Alert } from "../types/alert";

/**
 * AlertStore manages the global state of system and user alerts.
 */
class AlertStore {
  private static instance: AlertStore;
  private alerts: Alert[] = [];
  private listeners: Set<(alerts: Alert[]) => void> = new Set();

  private constructor() {}

  public static getInstance(): AlertStore {
    if (!AlertStore.instance) {
      AlertStore.instance = new AlertStore();
    }
    return AlertStore.instance;
  }

  public setAlerts(alerts: Alert[]) {
    this.alerts = alerts;
    this.notify();
  }

  public getAlerts(): Alert[] {
    return this.alerts;
  }

  public subscribe(listener: (alerts: Alert[]) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.alerts));
  }
}

export const alertStore = AlertStore.getInstance();
