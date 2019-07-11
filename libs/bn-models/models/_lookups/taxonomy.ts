import { Base } from '../_base/index';
import { BoatnetDate, CouchID } from '../_common';
import { TaxonomyAlias } from './taxonomy-alias';

export const TaxonomyTypeName = 'taxonomy';

declare type TaxonomyLevel = string; // TODO Lookup
export type TaxonomyId = CouchID;

// Each taxonomic record will be in a different document
export interface Taxonomy extends Base {
  taxonomyId: TaxonomyId; // Use this instead of _id for clarity except for top level record
  level: TaxonomyLevel;
  taxonomyName: string;
  scientificName?: string; // copy of taxonomyName except for species & subspecies
  children?: TaxonomyId[];
  parent?: TaxonomyId;

  // WCGOP specific usage
  wcgopTallyShortCode?: string;

  // Used by EDC + Obs Analysts
  pacfinNomCode?: string; // when a landing does not have species comp

  // External system references
  pacfinSpeciesId?: string;
  itisTSN?: number;
  wormsAphiaId?: number;

  isInactive: boolean;

  legacy?: {
    wcgopSpeciesId?: number; // primary key
    wcgopSpeciesCode?: number; // 3-4 digit code, adopted from AFSC
    wcgopCatchCategoryCode?: string; // ETL Note - only for single species catch category codes
    ashopSpeciesId?: number; // NORPAC ID
    obsAnalystCode?: string; // ToDo - Kayleigh spreadsheet
    edcCode?: number;
    dwId?: number;
    raceBaseCodeNW?: number; // AFSC RaceBase code + 1 digit
  };
}
