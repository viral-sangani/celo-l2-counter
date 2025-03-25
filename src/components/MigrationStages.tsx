import React from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import type { MigrationStage } from '../types';

interface MigrationStagesProps {
  stages: MigrationStage[];
}

export const MigrationStages: React.FC<MigrationStagesProps> = ({ stages }) => {
  return (
    <div className="bg-white rounded-lg p-8 shadow-lg">
      <h2 className="text-2xl font-bold text-[#476520] mb-6">Migration Stages</h2>
      <div className="space-y-6">
        {stages.map((stage) => (
          <div key={stage.id} className="flex items-start gap-4">
            <div className="mt-1">
              {stage.status === 'Complete' ? (
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              ) : stage.status === 'InProgress' ? (
                <Loader2 className="w-6 h-6 text-[#FCFF52] animate-spin" />
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{stage.name}</h3>
              <p className="text-gray-600">{stage.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};