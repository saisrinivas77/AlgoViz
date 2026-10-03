import { DVIREvent, StepExplanation } from "@algoviz/dvir";
export interface MultiLevelExplanation {
    beginner: StepExplanation;
    intermediate: StepExplanation;
    detailed: StepExplanation;
}
export declare function generateStepExplanation(ev: DVIREvent | null, nextEv: DVIREvent | null, variables: Record<string, any>, prevVariables: Record<string, any>, changedVars: string[], lineNo: number | null, sourceCodeLines: string[]): MultiLevelExplanation;
