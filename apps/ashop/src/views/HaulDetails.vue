<template>
  <q-page>
    <boatnet-tab-panel :size="2">
      <template v-slot:content1>
        <div class="row" v-if="appConfig.survey === 'ashop'">
          <div class="column" style="width: 50%">
            <div class="text-h5 row justify-center">Deployment Info</div>
            <div v-for="config of appConfig.deployment" :key="appConfig.deployment.indexOf(config)">
              <boatnet-common-input-component
                :config="config"
                :model="haul"
                @save="saveOnUpdate(config.modelName)"
              ></boatnet-common-input-component>
            </div>
          </div>
          <div class="column" style="width: 50%">
            <div class="text-h5 row justify-center">Retrieval Info</div>
            <div v-for="config of appConfig.retrievial" :key="appConfig.retrievial.indexOf(config)">
              <boatnet-common-input-component
                :config="config"
                :model="haul"
                @save="saveOnUpdate(config.modelName)"
              ></boatnet-common-input-component>
            </div>
          </div>
        </div>
        <div style="display: flex; flex-flow: column wrap; align-items: stretch; height: 460px" v-else>
          <div v-for="config of appConfig.haulInfoPt1" :key="appConfig.haulInfoPt1.indexOf(config)">
            <boatnet-common-input-component :config="config" :model="haul" @save="saveOnUpdate"></boatnet-common-input-component>
          </div>
        </div>
      </template>
      <template v-slot:title2>
        <div class="text-h5 row justify-center">Haul {{haul[haulName]}} Info</div>
      </template>
      <template v-slot:content2>
        <div style="display: flex; flex-flow: column wrap; align-items: stretch; height: 460px">
          <div v-for="config of appConfig.haulInfoPt2" :key="appConfig.haulInfoPt2.indexOf(config)">
            <boatnet-common-input-component :config="config" :model="haul" @save="saveOnUpdate"></boatnet-common-input-component>
          </div>
        </div>
      </template>
    </boatnet-tab-panel>
    <!--<div class="row q-gutter-sm fixed-bottom q-pa-md justify-end">
      <q-btn color="primary" icon="play_arrow" label="Go to Catch" @click="goToHauls" />
    </div>-->
    <div
      class="bg-primary text-white"
      style="padding: .5em; text-align: center; font-weight: bold"
    >Haul Details: {{ haul }}</div>
  </q-page>
</template>

<script lang="ts">
import {
  createComponent,
  ref,
  reactive,
  computed,
  watch,
  onBeforeUnmount
} from '@vue/composition-api';
import { BaseOperation } from '@boatnet/bn-models';
import { get, set } from 'lodash';
import { update } from '../data/initHauls';

export default createComponent({
  setup(props, context) {
    const store = context.root.$store;
    const appConfig = store.state.appSettings.appConfig;
    const haul: BaseOperation = reactive(store.state.tripsState.currentHaul);
    const haulName = store.state.appSettings.appConfig.hauls.itemNumName;

    const saveOnUpdate = async (fieldName: string) => {
      update(haul, fieldName);
      store.dispatch('tripsState/save', haul);
    };

    return {
      appConfig,
      haul,
      haulName,
      saveOnUpdate
    };
  }
});
</script>
