import { BoatnetBase } from '../../interface/boatnet-base';
import { TallyDataEntry } from './tally-data-entry';

export class TallyData implements BoatnetBase {
  id: string;
  type: 'tally';
  created_by: string;
  created_date: BoatnetDate;
  tallyData: TallyDataEntry[];
}