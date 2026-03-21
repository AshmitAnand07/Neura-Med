import { create } from 'zustand';

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  timing: string;
  status: 'active' | 'completed' | 'paused';
}

export interface AlertSettings {
  voiceAlertsEnabled: boolean;
  language: 'en-IN' | 'hi-IN' | 'bn-IN' | 'ta-IN';
  volumeLevel: number; // 0 to 100
}

interface NeuraMedState {
  medicines: Medicine[];
  isVoiceUIActive: boolean;
  alertSettings: AlertSettings;
  
  // Actions
  setMedicines: (medicines: Medicine[]) => void;
  addMedicine: (medicine: Medicine) => void;
  removeMedicine: (id: string) => void;
  
  toggleVoiceUI: (active: boolean) => void;
  
  updateAlertSettings: (settings: Partial<AlertSettings>) => void;
}

export const useNeuraStore = create<NeuraMedState>((set) => ({
  medicines: [],
  isVoiceUIActive: false,
  alertSettings: {
    voiceAlertsEnabled: true,
    language: 'en-IN',
    volumeLevel: 80,
  },

  setMedicines: (medicines) => set({ medicines }),
  addMedicine: (medicine) => set((state) => ({ medicines: [...state.medicines, medicine] })),
  removeMedicine: (id) => set((state) => ({ medicines: state.medicines.filter(m => m.id !== id) })),
  
  toggleVoiceUI: (isVoiceUIActive) => set({ isVoiceUIActive }),
  
  updateAlertSettings: (newSettings) => set((state) => ({ 
    alertSettings: { ...state.alertSettings, ...newSettings } 
  })),
}));
