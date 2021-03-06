import Vue from 'vue';
import Vuex, { Module, ActionTree, MutationTree, GetterTree, Store } from 'vuex';
import { RootState, AppSettings, BoatnetConfig } from './types/types';
import { pouchService } from '@boatnet/bn-pouch';

Vue.use(Vuex);

const state: AppSettings = {
  isKeyboardEnabled: true,
  isSoundEnabled: true,
  appMode: 'wcgop',
  defaultLocationFormat: 'DMS',
  appConfig: {
    validAppViews: [],
    navigationDrawerItems: [],
    login: {},
    trips: {},
    hauls: {},
    catch: {}
  }
};

const actions: ActionTree<AppSettings, RootState> = {
  setKeyboardStatus({ commit }: any, isEnabled: boolean) {
    commit('setKeyboardStatus', isEnabled);
  },
  setSoundEnabled({ commit }: any, isEnabled: boolean) {
    commit('setSoundEnabled', isEnabled);
  },
  setAppMode({ commit }: any, appMode: string) {
    commit('setAppMode', appMode);
  },
  setDefaultLocationFormat({ commit }: any, format: string) {
    commit('setDefaultLocationFormat', format);
  },
 setAppConfig({ commit }: any) {
    commit('setAppConfig');
  }
};

const mutations: MutationTree<AppSettings> = {
  setKeyboardStatus(newState: any, isEnabled: boolean) {
    newState.isKeyboardEnabled = isEnabled;
  },
  setSoundEnabled(newState: any, isEnabled: boolean) {
    newState.isSoundEnabled = isEnabled;
  },
  setAppMode(newState: any, appMode: string) {
    newState.appMode = appMode;
  },
  setDefaultLocationFormat(newState: any, format: string) {
    newState.defaultLocationFormat = format;
  },
  async setAppConfig(newState: any) {
    try {
      const db = pouchService.db;
      const queryOptions = {
        limit: 1,
        start_key: newState.appMode,
        inclusive_end: true,
        descending: false,
        include_docs: true
      };
      const config = await db.query(
        'LookupDocs/boatnet-config-lookup',
        queryOptions,
        pouchService.lookupsDBName
      );
      newState.appConfig = config.rows[0].doc;
    } catch (err) {
      console.log(err);
    }
  }
};

const getters: GetterTree<AppSettings, RootState> = {
  isSoundEnabled(getState: AppSettings) {
    return getState.isSoundEnabled;
  },
  isKeyboardEnabled(getState: AppSettings) {
    return getState.isKeyboardEnabled;
  },
  appMode(getState: AppSettings) {
    return getState.appMode;
  },
  defaultLocationFormat(getState: AppSettings) {
    return getState.defaultLocationFormat;
  },
  appConfig(getState: AppSettings) {
    return getState.appConfig;
  }
};

export const appSettings: Module<AppSettings, RootState> = {
  namespaced: true,
  state,
  actions,
  mutations,
  getters
};
