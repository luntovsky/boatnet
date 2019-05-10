import Vue from 'vue';
import Vuex, { Module, ActionTree, MutationTree, GetterTree } from 'vuex';
import {
  TallyState,
  RootState,
  TallyButtonData,
  TallyRecordTypeName,
  TallyRecord,
  TallyOperationMode
} from '@/_store/types';

import { pouchService } from '@boatnet/bn-pouch';

import moment from 'moment';
import { authService } from '@boatnet/bn-auth';

/* tslint:disable:no-var-requires  */
const defaultTemplate = require('../assets/tally-templates/default.json');

Vue.use(Vuex);

export const state: TallyState = {
  tallyRecord: {
    recordName: 'Default',
    type: TallyRecordTypeName,
    buttonData: [],
    vertButtonCount: 4,
    horizButtonCount: 8
  },
  incDecValue: 1,
  operationMode: TallyOperationMode.Tally
};

// TODO: Other Color Schemes
const reasonButtonColors: any[] = [
  { name: 'SFTY', color: { bg: 'blue-2', text: 'black' } },
  { name: 'DOCK', color: { bg: 'blue-3', text: 'black' } },
  { name: 'ACCI', color: { bg: 'blue-4', text: 'black' } },
  { name: 'USED', color: { bg: 'blue-5', text: 'black' } },
  { name: 'OTHR', color: { bg: 'blue-6', text: 'white' } },
  { name: 'REG', color: { bg: 'blue-7', text: 'white' } },
  { name: 'DROP', color: { bg: 'blue-8', text: 'white' } },
  { name: 'PRED', color: { bg: 'red-5', text: 'white' } },
  { name: 'MKT', color: { bg: 'light-green', text: 'black' } },
  { name: 'RET', color: { bg: 'green-9', text: 'white' } }
];

const actions: ActionTree<TallyState, RootState> = {
  reset({ commit }: any) {
    commit('reset');
  },
  connectDB({ commit }: any) {
    commit('initialize');
  },
  updateButton(
    { commit }: any,
    params: { button: TallyButtonData; skipDBUpdate: boolean }
  ) {
    commit('updateButton', params);
  },
  setTallyIncDec({ commit }: any, value: number) {
    commit('setTallyIncDec', value);
  },
  setTallyOpMode({ commit }: any, value: TallyOperationMode) {
    commit('setTallyOpMode', value);
  },
  assignNewButton(
    { commit }: any,
    value: {
      species: any;
      reason: string;
      index: number;
    }
  ) {
    commit('assignNewButton', value);
  }
};

function getBtnColor(reason: string): { bg?: string; text?: string } {
  const rbcVal: any = reasonButtonColors.filter((rbc: any) => {
    return rbc.name === reason;
  });
  if (rbcVal[0]) {
    return rbcVal[0].color;
  } else {
    console.log('WARNING: no button color for', reason);
    return { bg: 'gray-4', text: 'black' };
  }
}

function createDefaultRecord(): TallyRecord {
  const newRecord: TallyRecord = {
    recordName: 'Default',
    type: TallyRecordTypeName,
    buttonData: [],
    vertButtonCount: 4,
    horizButtonCount: 8
  };
  const tmpBtnData: TallyButtonData[] = [];
  const template = defaultTemplate.templateData;
  template.forEach((item: TallyButtonData, index: number) => {
    if (item.reason === 'INVIS') {
      tmpBtnData.push({
        index,
        blank: true
      });
    } else {
      tmpBtnData.push({
        index,
        color: getBtnColor(item.reason!).bg,
        'text-color': getBtnColor(item.reason!).text,
        code: item.code,
        reason: item.reason,
        count: 0
      });
    }
  });
  newRecord.buttonData = tmpBtnData;
  newRecord.createdDate = moment().format();
  newRecord.createdBy = authService.getCurrentUser()!.username;
  return newRecord;
}

const mutations: MutationTree<TallyState> = {
  async initialize(newState: any) {
    /**
     * Initialize tally data. If tallyRecord is set, do nothing, otherwise create new TallyRecord.
     */
    if (
      !newState.tallyRecord._id ||
      newState.tallyRecord.buttonData.length === 0
    ) {
      newState.tallyRecord = createDefaultRecord();
      const result = await updateRecord(newState.tallyRecord);
      newState.tallyRecord._id = result.id;
      newState.tallyRecord._rev = result.rev;
    } else {
      console.log(
        '[Tally Module] Already have tally data, skip template init. DB ID=',
        newState.tallyRecord._id
      );
    }
  },
  async reset(newState: any, createNewRecord = false) {
    /**
     * Reset data for tally to default template.
     * @param createNewRecord Create a new CouchDB record, otherwise overwrite existing _id
     */
    console.log('[Tally Module] Reset Tally Button Data', newState);
    // Keep old ID
    const oldId = newState.tallyRecord._id;
    newState.tallyRecord = createDefaultRecord();
    if (!createNewRecord && oldId) {
      newState.tallyRecord._id = oldId;
    }
    const result = await updateRecord(newState.tallyRecord);
    newState.tallyRecord._id = result.id;
    newState.tallyRecord._rev = result.rev;
  },
  async updateButton(
    newState: any,
    params: { button: TallyButtonData; skipDBUpdate?: boolean }
  ) {
    if (params.button.index === undefined) {
      console.log(
        '[Tally Module] Button has no index, cannot update.',
        params.button
      );
      return;
    }
    newState.tallyRecord.buttonData[params.button.index] = params.button;

    if (!params.skipDBUpdate) {
      const result = await updateRecord(newState.tallyRecord);
      if (result) {
        newState.tallyRecord._rev = result.rev;
        newState.tallyRecord.modifiedDate = moment().format();
        newState.tallyRecord.modifiedBy = authService.getCurrentUser()!.username;
      }
    }
  },
  setTallyIncDec(newState: any, value: number) {
    newState.incDecValue = value;
  },
  setTallyOpMode(newState: any, value: TallyOperationMode) {
    newState.operationMode = value;
    // TODO: Set/Reset all button.tempState if "Tally"?
  },
  async assignNewButton(
    newState: any,
    value: { species: any; reason: string; index: number }
  ) {
    const newColor = getBtnColor(value.reason);
    const newButton: TallyButtonData = {
      index: value.index,
      color: newColor.bg,
      'text-color': newColor.text,
      // tempState?: TallyButtonMode;
      code: value.species.shortCode,
      reason: value.reason,
      count: 0 // TODO Load from data?
    };
    // TODO refactor DB portion out of this

    newState.tallyRecord.buttonData[value.index] = newButton;

    // TODO Hack? This is currently required to maintain reactivity at the count level
    // Research deep object watch, or refactor to flatten this data
    newState.tallyRecord.buttonData = Object.assign({}, newState.tallyRecord.buttonData);

    const result = await updateRecord(newState.tallyRecord);
    if (result) {
      newState.tallyRecord._rev = result.rev;
      newState.tallyRecord.modifiedDate = moment().format();
      newState.tallyRecord.modifiedBy = authService.getCurrentUser()!.username;
    }
  }
};

async function updateRecord(record: TallyRecord) {
  try {
    if (record._id) {
      const result = await pouchService.db.put(pouchService.userDBName, record);
      console.log('[Tally Module] Updated tally record.', result);
      return result;
    } else {
      const result = await pouchService.db.post(
        pouchService.userDBName,
        record
      );
      console.log('[Tally Module] Created new tally record.', result);
      return result;
    }
  } catch (err) {
    if (err.status === 409) {
      try {
        const newerDoc = await pouchService.db.get(
          pouchService.userDBName,
          record._id
        );
        record._rev = newerDoc._rev;
        const result = await pouchService.db.put(
          pouchService.userDBName,
          record
        );
        console.log(
          '[Tally Module] Handled doc conflict, updated record',
          result
        );
        return result;
      } catch (errRetry) {
        if (errRetry.status === 404) {
          delete record._id;
          delete record._rev;
          const result = await pouchService.db.put(
            pouchService.userDBName,
            record
          );
          console.log(
            '[Tally Module] Handled doc deletion, created record',
            result
          );
          return result;
        } else {
          // TODO Alert Module
          throw errRetry;
        }
      }
    } else {
      // TODO Alert Module
      // console.log('ERROR!', err);
      throw err;
    }
  }
}

const getters: GetterTree<TallyState, RootState> = {
  horizButtonCount(getState: TallyState) {
    return getState.tallyRecord.horizButtonCount;
  },
  vertButtonCount(getState: TallyState) {
    return getState.tallyRecord.vertButtonCount;
  },
  incDecValue(getState: TallyState) {
    return getState.incDecValue;
  },
  tallyMode(getState: TallyState) {
    return getState.operationMode;
  },
  reasonButtonColors() {
    return reasonButtonColors;
  }
};

export const tallyState: Module<TallyState, RootState> = {
  namespaced: true,
  state,
  actions,
  mutations,
  getters
};
