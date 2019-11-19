import { BaseLookup } from '../_base';
import { BoatnetDate } from '../_common';

export const BehaviorTypeName = 'behavior';

export interface Behavior extends BaseLookup {
  // description

  legacy?: {
    lookupVal?: number;
    programId?: number;
    active?: boolean;
    sortOrder?: number;
    lookupId?: number;
    obsprodLoadDate?: BoatnetDate;
    lookupType?: string;
  };
}
