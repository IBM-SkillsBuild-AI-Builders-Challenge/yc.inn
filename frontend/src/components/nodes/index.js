import { TextNode } from "./types/TextNode";
import { LLMNode } from "./types/LLMNode";
import { OutputNode } from "./types/OutputNode";
import { ConditionNode } from "./types/ConditionNode";
import { DelayNode } from "./types/DelayNode";
import { InputNode } from "./types/InputNode";
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
};
