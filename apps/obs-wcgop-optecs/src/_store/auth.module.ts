// Vuex Auth Module

// Typescript examples https://codeburst.io/vuex-and-typescript-3427ba78cfa8

import { authService } from '@boatnet/bn-auth';

import router from '../router';

import Vue from 'vue';
import Vuex, { Module, ActionTree, MutationTree } from 'vuex';
import { AuthState, User, RootState } from '@/_store/types/types';

Vue.use(Vuex);

// TODO: use auth service for this
const userStored = localStorage.getItem('user');
let user: User | null = null;
if (userStored) {
  user = JSON.parse(userStored);
}

export const state: AuthState =  user
? { status: { loggedIn: true }, user }
: { status: {}, user: null };

const actions: ActionTree<AuthState, RootState> = {
  login({ dispatch, commit }: any, { username, password }: any) {
    commit('loginRequest', { username });

    authService.login(username, password).then(
      (u: any) => {
        commit('loginSuccess', u);
        router.push('/');
      },
      (error: any) => {
        commit('loginFailure', error);
        dispatch('alert/error', error, { root: true });
      }
    );
  },
  logout({ commit }: any) {
    authService.logout();
    commit('logout');
  }
};

const mutations: MutationTree<AuthState> = {
  loginRequest(newState: any, newUser: any) {
    newState.status = { loggingIn: true };
    newState.user = newUser;
  },
  loginSuccess(newState: any, newUser: any) {
    newState.status = { loggedIn: true };
    newState.user = newUser;
  },
  loginFailure(newState: any) {
    newState.status = {};
    newState.user = null;
  },
  logout(newState: any) {
    newState.status = {};
    newState.user = null;
  }
};

export const auth: Module<AuthState, RootState> = {
  namespaced: true,
  state,
  actions,
  mutations
};