import { Team } from "./team";

export interface CommonResponse {
    timeStamp: Date;
    statusCode: number;
    status: string;
    reason: string;
    message: string;
    developerMessage: string;
    data: { teams?: Team[], team?: Team }

}