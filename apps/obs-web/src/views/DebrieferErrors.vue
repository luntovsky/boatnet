<template>
  <div>
    <div style="text-align: right">
      <q-icon name="open_in_new" size="md" v-on:click="openNewDebriefingTab" />
    </div>
    <prime-table :value="data" :columns="errorColumns" type="Errors" />
  </div>
</template>


<script lang="ts">
import { mapState } from 'vuex';
import router from 'vue-router';
import { State, Action, Getter } from 'vuex-class';
import { Component, Prop, Vue } from 'vue-property-decorator';
import {
  TripState,
  PermitState,
  UserState,
  GeneralState,
  DebrieferState
} from '../_store/types/types';
import {
  WcgopTrip,
  WcgopOperation,
  WcgopCatch,
  WcgopSpecimen,
  Basket
} from '@boatnet/bn-models';
import { CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';
import { date } from 'quasar';
import { convertToObject } from 'typescript';

@Component
export default class DebrieferErrors extends Vue {
  @Action('error', { namespace: 'alert' }) private error: any;
  @State('debriefer') private debriefer!: DebrieferState;
  @Prop({ default: true })
  private showData!: boolean;

  private WcgopTrips: WcgopTrip[] = [];
  private WcgopOperations: WcgopOperation[] = [];
  private WcgopCatches: WcgopCatch[] = [];
  private WcgopCatchSpecies: WcgopCatch[] = [];
  private WcgopCatchBaskets: Basket[] = [];
  private WcgopCatchSpecimens: WcgopSpecimen[] = [];
  private pagination = { rowsPerPage: 50 };
  private tab = 'trips';

  private errorColumns = [
    { field: 'severity', header: 'Severity' },
    { field: 'description', header: 'Description' },
    { field: 'tripNum', header: 'Trip #' },
    { field: 'dateCreated', header: 'Date Created' },
    { field: 'observer', header: 'Observer' },
    { field: 'status', header: 'Status' },
    { field: 'dateFixed', header: 'Date Fixed' },
    { field: 'note', header: 'Note' }
  ];

  private data = [
    {
      severity: 'Warning',
      description:
        'Multiple dissections of the same type collected for sea whip, sea pen, or non-coral species.',
      tripNum: 24266,
      dateCreated: '1/1/19',
      observer: 'Davis',
      status: 'Unresolved',
      dateFixed: '',
      note: 'dissection count'
    }
  ];

  private openNewDebriefingTab() {
    const route = '/observer-web/debriefer/qa';
    window.open(route, '_blank');
  }
}
</script>