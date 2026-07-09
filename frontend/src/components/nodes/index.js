import { TextNode } from "./types/TextNode";
import { LLMNode } from "./types/LLMNode";
import { OutputNode } from "./types/OutputNode";
import { ConditionNode } from "./types/ConditionNode";
import { DelayNode } from "./types/DelayNode";
import { InputNode } from "./types/InputNode";
import { AnomalyNode } from "./types/AnomalyNode";
import { PredictionNode } from "./types/PredictionNode";
import { MaintenanceExpertNode } from "./types/MaintenanceExpertNode";
import { RootCauseNode } from "./types/RootCauseNode";
import { nodeConfigurations } from "./registry/nodeConfigurations";

export const nodeTypes = {
  customInput: InputNode,
  customOutput: OutputNode,
  text: TextNode,
  llm: LLMNode,
  condition: ConditionNode,
  delay: DelayNode,
  api: nodeConfigurations.api,
  database: nodeConfigurations.database,
  notification: nodeConfigurations.notification,
  // Industrial
  workflowTrigger: nodeConfigurations.workflowTrigger,
  sensorInput: nodeConfigurations.sensorInput,
  csvUpload: nodeConfigurations.csvUpload,
  dataCleaning: nodeConfigurations.dataCleaning,
  featureExtraction: nodeConfigurations.featureExtraction,
  anomalyDetection: AnomalyNode,
  failurePrediction: PredictionNode,
  decision: nodeConfigurations.condition,
  humanApproval: nodeConfigurations.humanApproval,
  maintenanceTicket: nodeConfigurations.maintenanceTicket,
  inventoryCheck: nodeConfigurations.inventoryCheck,
  maintenanceExpert: MaintenanceExpertNode,
  procurementAgent: nodeConfigurations.procurementAgent,
  rootCauseAgent: RootCauseNode,
};
