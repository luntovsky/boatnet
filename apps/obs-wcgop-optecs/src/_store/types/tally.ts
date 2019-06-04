import { Base, BoatnetDate } from '@boatnet/bn-models';

export enum TallyButtonMode {
  MovingButton,
  TargetButton
}
export enum TallyOperationMode {
  Tally = 'TALLY_MODE',
  AddNamedSpeciesSelectSpecies = 'ADD_NAMED_SPECIES_SELECT_SPECIES',
  AddNamedSpeciesSelectType = 'ADD_NAMED_SPECIES_SELECT_TYPE',
  AddNamedSpeciesSelectLocation = 'ADD_NAMED_SPECIES_SELECT_LOCATION',
  DeleteButtonSelect = 'DELETE_BUTTON_SELECT',
  MoveButtonSelect = 'MOVE_BUTTON_SELECT',
  MoveSelectLocation = 'MOVE_SELECT_LOCATION',
  AddExistingSpeciesSelectSpecies = 'ADD_EXISTING_SPECIES_SELECT_SPECIES',
  AddExistingSpeciesSelectReason = 'ADD_EXISTING_SPECIES_SELECT_REASON',
  AddExistingSpeciesSelectLocation = 'ADD_EXISTING_SPECIES_SELECT_LOCATION',
  AddTempSpeciesReason = 'ADD_TEMP_SPECIES_REASON',
  AddTempSpeciesLocation = 'ADD_TEMP_SPECIES_LOCATION',
  NameTempSpeciesSelect = 'NAME_TEMP_SPECIES_SELECT',
  NameTempSpeciesSelectSpecies = 'NAME_TEMP_SPECIES_SELECT_FRESH_SPECIES',
  ModifyDispButtonSelect = 'MODIFY_DISP_BUTTON_SELECT',
  ModifyDispSelectDisp = 'MODIFY_DISP_SELECT_DISP',
  AllTalliesSelectSpecies = 'ALL_TALLIES_SELECT_SPECIES',
  AllTallies = 'ALL_TALLIES',
  WeightsForSelectSpecies = 'WEIGHTS_FOR_SELECT_SPECIES',
  WeightsForAddingWeight = 'WEIGHTS_FOR_ADDING_WEIGHT',
  Unknown = 'Unknown'
}

// -- Layout Related Interfaces --
export interface TallyButtonLayoutData {
  // Pure code and reason layout info. No count data
  index?: number; // screen location
  // Styling
  color?: string;
  'text-color'?: string;
  blank?: boolean;

  // Data
  labels?: {
    shortCode?: string; // e.g. SABL
    reason?: string; // e.g. PRED or RET(ained)
  };
}

export interface TallyHistory {
  type: string; // 'tally', etc
  eventTime?: BoatnetDate;
  desc?: string;
  shortCode?: string;
  reason?: string;
  oldValue?: any;
  newValue?: any;
}

export const TallyTemplateRecordTypeName = 'tally-template';
export const TallyLayoutRecordTypeName = 'tally-layout';
export interface TallyLayoutRecord extends Base {
  description: string; // friendly name
  isTemplate?: boolean; // is a template for new catches?
  layoutData: TallyButtonLayoutData[];
  vertButtonCount: number;
  horizButtonCount: number;
}

// -- Data Related Interfaces --
export const TallySpeciesRecordTypeName = 'tally-species';
export const TallyDataRecordTypeName = 'tally-data';

export interface TallyCountWeight {
  weighedCount?: number;
  weight?: number;
  isAddedToTally?: boolean; // if user chose to add to tally, then remove from tally if deleted
}

export interface TallyCountData extends Base {
  species?: any; // TODO actual Species data
  shortCode?: string; // TODO redundant with species, refactor
  reason?: string;
  count?: number;
  calculatedTotalWeighedCount?: number;
  calculatedTotalWeighedWeight?: number;
  calculatedAverageWeight?: number;
  countWeightData?: TallyCountWeight[];
}

export interface TallyDataRecord extends Base {
  data?: TallyCountData[];
  history?: TallyHistory[];
}

// -- TallyState Interface --
export interface TallyState {
  tallyLayout: TallyLayoutRecord;
  tallyDataRec?: TallyDataRecord; // data and history

  // State
  incDecValue?: number; // +1 or -1
  operationMode?: TallyOperationMode;
  currentButtonIdx?: number;
  currentReason?: string; // TODO Lookup type? PRED, etc.
  tempSpeciesCounter?: number;
  lastClickedIndex?: number;
  lastClickedWasInc?: boolean; // true for Inc

  defaultLayout?: TallyLayoutRecord;
}
