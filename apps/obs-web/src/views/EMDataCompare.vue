<template>
  <div class="q-pa-md q-gutter-md">
      <div class="text-h6" style="max-width: 70%">
        <span v-if="apiTrip.tripNum">Trip {{ apiTrip.tripNum }} - {{ apiTrip.vesselName }} ({{ apiTrip.vesselId }}) - </span> Data Comparison
        <q-btn v-if="state.user.showLogbookRetained" color="secondary" size="sm" @click="toggleRetained">Hide Retained</q-btn>
        <q-btn v-else color="primary" size="sm" @click="toggleRetained">Show Retained</q-btn>
      </div>

      <div style="position: absolute; top: 30px; right: 15px">
      <q-input v-model="tripNum" label="Trip # (6 digit)" style="width: 170px" @keyup.enter.native="getAPITripData">
        <template v-slot:append>
            <q-btn color="primary" type="submit" @click="getAPITripData">load</q-btn>
        </template>
      </q-input>
      </div>

    <q-table
      :data="comp.tripData"
      :columns="columns"
      dense
      row-key="id"
      selection="single"
      :selected.sync="selected"
      :pagination.sync="pagination"
      binary-state-sort
      hide-bottom
      :visible-columns="visibleColumns"
      :sort-method="sorter"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="_id"></q-td>
          <q-td key="haul" :props="props">{{ props.row.haul ? props.row.haul : '' }}</q-td>
          <q-td key="speciesCode" :props="props">{{ props.row.speciesCode ? props.row.speciesCode : '' }}</q-td>
          <q-td key="logbookDiscard" :props="props" >{{ props.row.logbookDiscard ? props.row.logbookDiscard : '' }}</q-td>
          <q-td key="logbookRetained" :props="props" >{{ props.row.logbookRetained ? props.row.logbookRetained : '' }}</q-td>
          <q-td key="thirdPartyReview" :props="props" >{{ props.row.thirdPartyReview ? props.row.thirdPartyReview : '' }}</q-td>
          <q-td key="diffReviewLogbook" :props="props" :class="getClass(props.row.diffReviewLogbook)" >{{ props.row.diffReviewLogbook ? props.row.diffReviewLogbook : '' }}</q-td>
          <q-td key="audit" :props="props">{{ props.row.audit ? props.row.audit : '' }}</q-td>
          <q-td key="diffAuditReview" :props="props" :class="getClass(props.row.diffAuditReview)">{{ props.row.diffAuditReview ? props.row.diffAuditReview : '' }}</q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script lang="ts">
import {
  createComponent,
  ref,
  reactive,
  computed,
  watch,
  onBeforeUnmount,
  onMounted,
  onServerPrefetch
} from '@vue/composition-api';
import { Vue } from 'vue-property-decorator';

import { Notify } from 'quasar';

import { getTripsApiTrip, getCatchApiCatch } from '@boatnet/bn-common';

export default createComponent({
  setup(props, context) {
    const store = context.root.$store;
    const state = store.state;

    const sorter = (rows: any, sortBy: string, descending: boolean) => {

      const data = [ ...rows ];

      if (sortBy) {
        data.sort((a: any, b: any) => {
          if (a.haul === 'Trip' || b.haul === 'Trip') {
            return 0;
          } else if ( a[sortBy] > b[sortBy] ) {
            return descending ? 1 : -1;

          } else if ( a[sortBy] < b[sortBy] ) {
            return descending ? -1 : 1;
          } else {
            return 0;
          }
        });
      }

      return data;
    };

        // sort: (a: any, b: any, rowA: any, rowB: any) => {
        //   if ( a === 'Trip' || b == 'Trip') {
        //     return 0;
        //   } else if ( a > b ) {
        //     return 1;
        //   } else if ( a < b ) {
        //     return -1;
        //   }else {
        //     return 0;
        //   }
        // }

    const columns: any = [
      { name: 'haul', label: 'Haul', field: 'haul', required: false, align: 'left', sortable: true },
      { name: 'speciesCode', label: 'Species Code', field: 'speciesCode', required: false, align: 'left', sortable: true },
      { name: 'logbookDiscard', label: 'Logbook Discard (lbs)', field: 'logbookDiscard', required: false, align: 'center', sortable: true },
      { name: 'logbookRetained', label: 'Logbook Retained (lbs)', field: 'logbookRetained', required: false, align: 'center', sortable: true },
      { name: 'thirdPartyReview', label: 'Third Party Review (lbs)', field: 'thirdPartyReview', required: false, align: 'center', sortable: true },
      { name: 'diffReviewLogbook', label: 'Diff Review Logbook', field: 'diffReviewLogbook', required: false, align: 'right', sortable: true },
      { name: 'audit', label: 'NWFSC Audit Discard (lbs)', field: 'audit', required: false, align: 'center', sortable: true },
      { name: 'diffAuditReview', label: 'Diff Audit Review', field: 'diffAuditReview', required: false, align: 'right', sortable: true }
    ];



    const visibleColumns: any = reactive([
      'haul',
      'speciesCode',
      'logbookDiscard',
      'logbookRetained',
      'thirdPartyReview',
      'diffReviewLogbook',
      'audit',
      'diffAuditReview'
    ]);

    const apiTrip: any = reactive({});

    let apiCatch: any = [];

    const pagination = {
      rowsPerPage: 100
    };
    const selected: any = [];
    let tripTotals: any = {};
    let haulTotals: any = {};
    const tripData: any = [];
    const tripNum: any = ref(context.root.$route.query.tripnum ? context.root.$route.query.tripnum : 0);
    const showRetained: any = ref(true);

    const getTripData = () => {
      tripData.length = 0;
      tripTotals = {};
      haulTotals = {};
      for (const source of apiCatch) {
        for (const haul of source.hauls) {
          for (const species of haul.catch) {
            if (!tripTotals[species.speciesCode]) {
              tripTotals[species.speciesCode] = {};
            }
            if (!tripTotals[species.speciesCode][source.source]) { tripTotals[species.speciesCode][source.source] = {}; }
            if (!tripTotals[species.speciesCode][source.source].discard) { tripTotals[species.speciesCode][source.source].discard = 0; }
            if (!tripTotals[species.speciesCode][source.source].retained) {tripTotals[species.speciesCode][source.source].retained = 0; }
            if (species.catchDisposition === 'Discarded') {
              tripTotals[species.speciesCode][source.source].discard += parseFloat(species.estimatedWeight);
            }
            if (species.disposition === 'D') {
              tripTotals[species.speciesCode][source.source].discard += parseFloat(species.weight);
            }
            if (source.source === 'logbook' && (species.catchDisposition === 'Retained')) {
              tripTotals[species.speciesCode][source.source].retained += parseFloat(species.estimatedWeight) ? parseFloat(species.estimatedWeight) : 0;
            }
            if (!haulTotals[haul.haulNum]) { haulTotals[haul.haulNum] = {}; }
            if (!haulTotals[haul.haulNum][species.speciesCode]) { haulTotals[haul.haulNum][species.speciesCode] = {}; }
            if (!haulTotals[haul.haulNum][species.speciesCode][source.source]) { haulTotals[haul.haulNum][species.speciesCode][source.source] = {}; }
            if (!haulTotals[haul.haulNum][species.speciesCode][source.source].discard) {haulTotals[haul.haulNum][species.speciesCode][source.source].discard = ''; }
            if (source.source === 'logbook') { haulTotals[haul.haulNum][species.speciesCode][source.source].retained = species.retained ? species.retained : '';
            }
            if (species.catchDisposition === 'Discarded') {
              haulTotals[haul.haulNum][species.speciesCode][source.source].discard = parseFloat(species.estimatedWeight);
            } else if (species.catchDisposition === 'Retained') {
              haulTotals[haul.haulNum][species.speciesCode][source.source].retained = parseFloat(species.estimatedWeight);
            }
            if (species.disposition === 'D') {
              haulTotals[haul.haulNum][species.speciesCode][source.source].discard = parseFloat(species.weight);
            }
          }
        }
      }

      for (const key of Object.keys(tripTotals)) {
        tripData.push(
          {
            id: Math.random(),
            haul: 'Trip',
            speciesCode: key,
            logbookDiscard: tripTotals[key].logbook ? tripTotals[key].logbook.discard : '',
            logbookRetained: tripTotals[key].logbook ? tripTotals[key].logbook.retained : '',
            thirdPartyReview: tripTotals[key].thirdParty ? tripTotals[key].thirdParty.discard : '',
            diffReviewLogbook: tripTotals[key].thirdParty && tripTotals[key].logbook ? getPercentDifference( tripTotals[key].thirdParty.discard, tripTotals[key].logbook.discard) : '',
            audit: tripTotals[key].nwfscAudit ? tripTotals[key].nwfscAudit.discard : '',
            diffAuditReview: tripTotals[key].nwfscAudit && tripTotals[key].thirdParty ? getPercentDifference( tripTotals[key].nwfscAudit.discard, tripTotals[key].thirdParty.discard) : ''
          }
        );
      }

      for (const key of Object.keys(haulTotals)) {
        for (const subKey of Object.keys(haulTotals[key])) {
          tripData.push(
            {
              id: Math.random(),
              haul: key,
              speciesCode: subKey,
              logbookDiscard: haulTotals[key][subKey].logbook ? haulTotals[key][subKey].logbook.discard : '',
              logbookRetained: haulTotals[key][subKey].logbook ? haulTotals[key][subKey].logbook.retained : '',
              thirdPartyReview: haulTotals[key][subKey].thirdParty ? haulTotals[key][subKey].thirdParty.discard : '',
              diffReviewLogbook: haulTotals[key][subKey].thirdParty && haulTotals[key][subKey].logbook ? getPercentDifference( haulTotals[key][subKey].thirdParty.discard, haulTotals[key][subKey].logbook.discard ) : '',
              audit: haulTotals[key][subKey].nwfscAudit ? haulTotals[key][subKey].nwfscAudit.discard : '',
              diffAuditReview: haulTotals[key][subKey].nwfscAudit && haulTotals[key][subKey].thirdParty ? getPercentDifference( haulTotals[key][subKey].nwfscAudit.discard, haulTotals[key][subKey].thirdParty.discard ) : ''
            }
          );
        }
      }
      tripData.sort( (a: any, b: any) => {
        if (a.haul === 'Trip' && b.haul === 'Trip') {
          if (a.speciesCode > b.speciesCode ) {
            return 1;
          } else if (a.speciesCode < b.speciesCode) {
            return -1;
          } else {
            return 0;
          }
        }
      });
    };

    const getPercentDifference = (val1: number, val2: number) => {
      if (typeof val1 === 'number' && val1 !== 0 && typeof val2 === 'number' && val2 !== 0) {
        return (((val1 - val2) / ((val1 + val2) / 2)) * 100).toFixed(2) + '%';
      } else {
        return '';
      }
    };

    const capitalize = (val: string) => {
      let result = '';
      const words = val.split(' ');
      for (const word of words) {
        result += word.charAt(0).toUpperCase() + word.slice(1);
        if (words.indexOf(word) !== words.length - 1 ) {
          result += ' ';
        }
      }
      return result;
    };

    const getAPITripData = async () => {
      const apiResponse: any = await getTripsApiTrip(parseInt(tripNum.value, 10));
      if (apiResponse.tripNum) {
        apiTrip.tripNum = apiResponse.tripNum;
        apiTrip.vesselName = apiResponse.vesselName;
        apiTrip.vesselId = apiResponse.vesselId;
      } else {
        apiTrip.tripNum = 0;
        apiTrip.vesselName = '';
        apiTrip.vesselId = '';
      }

      apiCatch = await getCatchApiCatch(parseInt(tripNum.value, 10));
      if (apiCatch === 'not found') {
        Vue.set(apiTrip, tripNum, 0);
        apiCatch = [];
        tripData.length = 0;
        tripData.pop();
        Notify.create({
          message: 'No catch found matching trip #',
          position: 'top-right',
          color: 'red',
          timeout: 2000,
          icon: 'cancel',
          multiLine: true
        });
        } else {
          getTripData();
      }
    };

    const getClass = (val: any) => {
      if (val && (parseInt(val.split('.')[0], 10) > 10 || parseInt(val.split('.')[0], 10) < -10)) {
        return 'red';
      }
    };

    const toggleRetained = () => {
      if (visibleColumns.indexOf('logbookRetained') !== -1) {
        visibleColumns.splice(visibleColumns.indexOf('logbookRetained') , 1);
        store.dispatch('user/setShowLogbookRetained', false);
      } else {
        visibleColumns.push('logbookRetained');
        store.dispatch('user/setShowLogbookRetained', true);
      }
    };

    const comp = reactive({
      tripData: computed(() => {
        if (store.state.user.showLogbookRetained) {
          return tripData;
        } else {
          return tripData.filter( (row: any) => !['', 0].includes(row.logbookDiscard) || !['', 0].includes(row.thirdPartyReview) || !['', 0].includes(row.audit));
        }
      })
    });

    onMounted(() => {
      if (tripNum.value !== 0) {
        getAPITripData();
      }
      if (!store.state.user.showLogbookRetained) {
        visibleColumns.splice(visibleColumns.indexOf('logbookRetained') , 1);
      }
    });

    return {
      apiTrip,
      apiCatch,
      capitalize,
      columns,
      pagination,
      selected,
      tripData,
      getPercentDifference,
      getClass,
      tripNum,
      getAPITripData,
      showRetained,
      visibleColumns,
      toggleRetained,
      state,
      comp,
      sorter
    };
  }
});
</script>

<style>
.red {
  color: red;
  font-weight: bold;
}

tr:nth-child(even) {
  background-color: rgb(238, 238, 238);
}
</style>
