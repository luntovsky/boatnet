<template>
    <div>
        <div style="text-align: center; display: flex; justify-content: center; align-items: center;">
            <div style="width: 320px;">
                <div class="text-h6">{{ label }}</div>

                <label class="cameraButton shadow-2 bg-primary text-white">Capture
                    <input id="imageInput" @change="handleImage($event)" type="file" accept="image/*">
                    <!-- <input @change="handleImage($event)" type="file" accept="image/*" capture="user"> -->
                </label>&nbsp;
                <br>
                <div class="container" v-for="file of files" :key="files.indexOf(file)">
                    <img :src="getImageUrl(file)" :alt="file.name" style="width: 320px">
                    <q-btn class="button" size="sm" icon="clear" round color="red" @click="removeAtIndex(files.indexOf(file))"></q-btn>
                </div>
                <span>
                    <q-btn v-if="files.length > 0 && !applied" class="submitButton" color="primary" @click="submitImage" :disabled="disableCreate">{{ submitAction }}</q-btn>
                    <q-spinner-radio v-if="transferring" color="primary" size="3em"/>
                    <q-btn v-if="files.length > 0 && !applied && submitAction === 'Add Image(s)'" flat color="red" icon="error">not added yet</q-btn>
                    <q-btn v-if="files.length > 0 && applied && submitAction === 'Add Image(s)'" flat color="primary" icon="check_circle">added to trip</q-btn>
                </span>
            </div>
        </div>
        <q-dialog v-model="sameDatesWarning">
            <q-card>
            <q-card-section>
                <div class="text-h6">
                A trip with the same start and end date has already been submitted - are you sure you want to submit another trip with the same dates?
                </div>
                <div style="float: right" >
                    <q-btn color="primary" @click="submitAnyway" :disable="disableCreate" label="submit"/>
                    &nbsp;
                    <q-btn color="red" @click="sameDatesWarning = false" label="cancel"/>
                </div>
                <br><br>
            </q-card-section>
            </q-card>
        </q-dialog>
    </div>
</template>

<script lang="ts">
    import { createComponent, ref, reactive, computed, onMounted } from '@vue/composition-api';
    import Compressor from 'compressorjs';
    import { Emit } from 'vue-property-decorator';
    import { newTripsApiTrip, getTripsApiTrips } from '@boatnet/bn-common';
    import { AuthState, authService } from '@boatnet/bn-auth';
    import moment from 'moment';
    import { Notify } from 'quasar';
    import { CouchDBInfo, CouchDBCredentials, couchService } from '@boatnet/bn-couch';
    import { Client, CouchDoc, ListOptions } from 'davenport';

    export default createComponent({
        props: {
            label: String,
            trip: Object,
            submitAction: String
        },
        setup(props, context) {

            const files: any = ref([]);
            const fileUrls: any = ref([]);

            const store = context.root.$store;
            const state = store.state;
            const transferring: any = ref(false);
            const applied: any = ref(true);
            const disableCreate = ref(false);

            const handleImage = (event: any) => {
                const newFile = new Compressor(event!.target!.files[0], {
                    quality: 0.6,
                    maxWidth: 1200,
                    maxHeight: 1200,
                    success(result) {
                        files.value.push(result);
                        const newItemIndex = files.value.length - 1;
                        fileUrls.value[newItemIndex] = URL.createObjectURL(files.value[newItemIndex]);
                        applied.value = false;
                    }
                });
                // @ts-ignore
                document.getElementById('imageInput')!.value = '';
            };

            const getImageUrl = (file: any) => {
                return URL.createObjectURL(file);
            };

            const removeAtIndex = (index: number) => {
                files.value.splice(index, 1);
                fileUrls.value.splice(index, 1);
                applied.value = false;
                props.trip!._attachments = {};
            };

            let tripsApiNum: any;

            const sameDatesWarning: any = ref(false);
            const confirmedSameDaysSubmission: any = ref(false);

            const submitAnyway = () => {
                confirmedSameDaysSubmission.value = true;
                submitImage();
            };

            const submitImage = async () => {
                disableCreate.value = true;

                props.trip!.vesselId = state.vessel.activeVessel.coastGuardNumber ? state.vessel.activeVessel.coastGuardNumber : state.vessel.activeVessel.stateRegulationNumber;

                if (context.root.$router.currentRoute.name === 'Log Missing Trip') {

                    // REQIRES A START AND END DATE
                    if (!props.trip!.departureDate || !props.trip!.returnDate) {
                    Notify.create({
                        message: '<b>A trip must have a start and end date</b>',
                            position: 'center',
                            color: 'primary',
                            timeout: 2000,
                            icon: 'warning',
                            html: true,
                            multiLine: true
                        });
                    return;
                    }

                    if (!props.trip!.departurePort || !props.trip!.returnPort) {
                    Notify.create({
                        message: '<b>A trip must have a departure and return port.</b>',
                        position: 'center',
                        color: 'primary',
                        timeout: 2000,
                        icon: 'warning',
                        html: true,
                        multiLine: true
                    });
                    return;
                    }

                    // REQUIRES A FISHERY!
                    if (props.trip!.fishery!.description === '') {
                    Notify.create({
                        message: '<b>A trip must have a fishery.</b>',
                        position: 'center',
                        color: 'primary',
                        timeout: 2000,
                        icon: 'warning',
                        html: true,
                        multiLine: true
                    });
                    return;
                    }

                    if (confirmedSameDaysSubmission.value !== true) {
                        const vesselTrips: any = await getTripsApiTrips('vesselId', props.trip!.vesselId);
                        const sameDatesTrips = vesselTrips.filter(
                            (trip: any) => {
                                return moment(trip.departureDate).isSame(props.trip!.departureDate, 'day') && moment(trip.returnDate).isSame(props.trip!.returnDate, 'day');
                        } );
                        if (sameDatesTrips.length > 0) {
                            sameDatesWarning.value = true;
                            return;
                        }
                    }
                }

                sameDatesWarning.value = false;
                confirmedSameDaysSubmission.value = false;

                if ( props.trip!.tripNum === 0) {
                    const newApiTrip = {
                        vesselId: props.trip!.vesselId,
                        vesselName: props.trip!.vessel!.vesselName,
                        departurePort: props.trip!.departurePort!.code ? props.trip!.departurePort!.code : props.trip!.departurePort!.name,
                        departureDate: props.trip!.departureDate,
                        returnPort: props.trip!.returnPort!.code ? props.trip!.returnPort!.code : props.trip!.returnPort!.name,
                        returnDate: props.trip!.returnDate,
                        permits: props.trip!.permits ? props.trip!.permits.map((permit: any) => permit.permitNumber) : [],
                        fishery: props.trip!.fishery!.description,
                        createdBy: props.trip!.createdBy,
                        createdDate: props.trip!.createdDate
                    };
                    await newTripsApiTrip(newApiTrip).then( (res: any) => tripsApiNum = res.tripNum);
                    props.trip!.tripNum = tripsApiNum;
                }

                props.trip!._attachments = {};

                for (const file of files.value) {
                    const fileName = props.label! + ' ' + (files.value.indexOf(file) + 1) + ' - ' + authService.getCurrentUser()!.username + ' - ' + moment().format();

                    let result: any;
                    const reader = new FileReader();
                    reader.readAsDataURL(file);

                    reader.onload = async () => {
                        result = reader.result;
                        props.trip!._attachments[fileName] = {
                            content_type: file.type,
                            data: result.split(',')[1]
                        };
                        props.trip!.changeLog.unshift(
                            {
                                updatedBy: authService.getCurrentUser()!.username,
                                updateDate: moment().format('MM/DD/YYYY HH:mm A'),
                                property: '_attachments',
                                newVal: 'added/updated logbook capture'
                            }
                        );
                    };
                }

                const masterDB: Client<any> = couchService.masterDB;
                const postToCouch = async () => {
                    transferring.value = true;
                    await masterDB.post(
                        props.trip
                        ).then( () => {
                            transferring.value = false;
                            Notify.create({
                                message: '<div class="text-h4" style="height: 100%: text-align: center; text-transform: uppercase"><br>' + props.label + '(s) Successfully Transferred<br>&nbsp;<br>&nbsp;</div>',
                                position: 'top',
                                color: 'primary',
                                timeout: 7000,
                                html: true,
                                multiLine: true
                            });
                            context.root.$router.push({ path: '/trips' });
                        });
                    };

                if (props.submitAction! === 'Submit Image(s)') {
                    setTimeout(postToCouch, 500 );
                }
                applied.value = true;
                return;
            };

            const getAttachments = async () => {
                if (Object.keys(props.trip!._attachments).length > 0) {
                    transferring.value = true;
                    const masterDb: Client<any> = couchService.masterDB;
                    const queryOptions: any = {
                        include_docs: true,
                        attachments: true,
                        key: props.trip!._id
                    };

                    const tripWithAttachment: any = await masterDb.view<any>(
                        'obs_web',
                        'ots_trips_by_id',
                        queryOptions
                    );

                    props.trip!._attachments = tripWithAttachment.rows[0].doc._attachments;

                    for (const attachment of Object.keys(props.trip!._attachments)) {
                        const filename = attachment;

                        const byteCharacters = atob(props.trip!._attachments[filename].data);
                        const byteNumbers = new Array(byteCharacters.length);
                        for (let i = 0; i < byteCharacters.length; i++) {
                            byteNumbers[i] = byteCharacters.charCodeAt(i);
                        }
                        const byteArray = new Uint8Array(byteNumbers);
                        const blob = new Blob([byteArray], {type: props.trip!._attachments[filename].content_type});
                        files.value.push(blob);
                        fileUrls.value.push(URL.createObjectURL(files.value[files.value.indexOf(blob)]));
                    }
                    transferring.value = false;
                }
            };
            onMounted( () => {
                getAttachments();
            });

            return {
                handleImage, files, getImageUrl, removeAtIndex, transferring, submitImage, applied, sameDatesWarning, confirmedSameDaysSubmission, submitAnyway, disableCreate
            };
        }
    });
</script>

<style scoped>

    label.cameraButton {
        display: inline-block;
        margin: 10px 0;
        padding: 0.5em;
        border-radius: 4px;
        text-transform: uppercase;
        font-weight: bold;
        cursor: pointer;
    }

    label.cameraButton input[accept*="image"] {
        display: none;
    }

    .submitButton {
        border-radius: 4px;
        text-transform: uppercase;
        font-weight: bold;
    }

    label {
        margin: 0
    }

    .container {
        position: relative;
        width: 100%;
    }

    .container img {
        width: 100%;
        height: auto;
    }

    .container .button {
        position: absolute;
        top: 35px;
        left: 290px;
        transform: translate(-20%, -90%);
        -ms-transform: translate(-20%, -90%);
        cursor: pointer;
    }

</style>