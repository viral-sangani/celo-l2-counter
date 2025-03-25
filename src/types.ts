export interface MigrationStage {
  id: string;
  name: string;
  status: 'NotStarted' | 'InProgress' | 'Complete';
  description: string;
}

export interface CeloL2Live {
  is_live: boolean;
  timestamp: number;
}