<template>
  <!-- <div style="width: 350px"> -->
  <div>
    <boatnet-datetime-prime
      v-if="config.type === 'dateTime' && (config.displayCondition ? showField : true)"
      :config="config"
      :date.sync="valueHolder"
      @save="save"
    />

    <boatnet-datetime
      v-if="config.type === 'dateTimeSeparate'"
      :label="config.label"
      :value.sync="valueHolder"
      @save="save"
    />

    <boatnet-keyboard-select-list
      v-if="config.type === 'input' && (config.displayCondition ? showField : true)"
      :displayName="config.displayName"
      :title="config.title"
      :keyboardType="config.keyboardType"
      :val.sync="valueHolder"
      :displayFields="config.displayFields"
      :docType="config.docType"
      :valType="config.valType"
      :inputType="config.inputType"
      :mask="config.mask"
      @save="save"
    />

    <q-toggle v-if="config.type === 'toggle'"
      v-model="valueHolder"
      :label="config.title"
    />

    <boatnet-button-toggle-comp
      v-if="config.type === 'buttonToggle' && (config.displayCondition ? showField : true)"
      :title="config.title"
      :options="config.options"
      :val.sync="valueHolder"
      :displayFields="config.displayFields"
      :valueField="config.valueField"
      :docType="config.docType"
      :docTypeDb="config.docTypeDb"
      :showDescription="config.showDescription"
      @save="save"
    />

    <boatnet-location
      v-if="config.type === 'location'"
      :model="config.modelName"
      :label="config.label"
      :val.sync="valueHolder"
      @save="save"
    />

    <boatnet-table-comp
      v-if="config.type === 'table'"
      :data.sync="valueHolder"
      :configName="config.configName"
      @save="save"
    />

    <boatnet-list
      v-if="config.type === 'list'"
      :list.sync="valueHolder"
      :config="config"
      @save="save"
    />
  </div>
</template>

<script lang="ts">
import { createComponent, computed, reactive } from '@vue/composition-api';
import { get, set } from 'lodash';
import Vue from 'vue';

export default createComponent({
  props: {
    config: Object,
    model: Object
  },
  setup(props, context) {
    // determine whether to show a field or not
    const showField = computed({
      get: () => {
        const currentData = reactive(context.root.$store.state.tripsState);
        let key = '';
        let value = '';
        if (props.config && props.config.displayCondition) {
          key = props.config.displayCondition.key;
          value = props.config.displayCondition.value;
        }
        // check whether value is set in state otherwise
        // check in obj
        const stateValue = get(currentData, key);
        if (stateValue && stateValue === value) {
          return true;
        } else {
          return get(props.model, key) === value ? true : false;
        }
      },
      set: () => undefined
    });

    const valueHolder = computed({
      get: () => {
        return get(props.model, props.config ? props.config.modelName : '');
      },
      set: (val: any) => {
        const modelName = props.config ? props.config.modelName : '';
        const fields = modelName.split('.');
        setValue(props.model, fields, val);
      }
    });

    // https://jasonwatmore.com/post/2018/09/10/vuejs-set-get-delete-reactive-nested-object-properties
    function setValue(obj: any, fields: any, setTo: any) {
      let field: string = fields.shift();
      let index: number = -1;
      const arrStart: number = field.indexOf('[');

      if (arrStart !== -1) {
        index = parseInt(field.substring(arrStart + 1, field.indexOf(']')), 10);
        field = field.substring(0, arrStart);
      }
      if (!obj[field] && index === -1) {
        Vue.set(obj, field, {});
      } else if (!obj[field] && index !== -1) {
        Vue.set(obj, field, []);
      }
      if (!fields.length) {
        if (setTo && typeof setTo === 'object' && !Array.isArray(setTo)) {
          obj[field] = { ...obj[field], ...setTo };
        } else if (index !== -1) {
          obj[field][index] = setTo;
        } else {
          obj[field] = setTo;
        }
        return;
      }
      setValue(obj[field], fields, setTo);
    }

    const save = () => {
      context.emit('save');
    };

    return {
      showField,
      valueHolder,
      save
    };
  }
});
</script>
