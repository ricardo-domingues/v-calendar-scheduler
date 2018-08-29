<template>
    <div ref="event_block" class="v-cal-event-item"
         :title="'Horário: ' + event.startTime.format('HH:mm') + ' - ' + event.endTime.format('HH:mm') + '\n Paciente: ' + event.patient.name + ' - ' + event.patient.phone + '\n Possui dificuldades motoras: ' + hasWalkingProblem" 
         :class="eventClasses"
         @click.stop="eventClicked"
         :style="eventStyles">
         <div class="row">
             <div class="col">
                 <span class="v-cal-event-time">{{ event.patient.name }} <i v-if="event.patient.access === 1" class="fa fa-wheelchair float-right"></i></span>
             </div>
         </div>
        <span v-if="event.audiologist" class="v-cal-event-time ml-2">{{ event.audiologist.name }}</span>
    </div>
</template>

<script>
    import moment from 'moment';
    import { EventBus } from './EventBus';

    export default {
        name: "EventItem",
        props: {
            event: {
                type: Object,
                required: true
            },
            use12: {
                type: Boolean,
                required: true
            },
            hasDynamicSize: {
                type: Boolean,
                default: true
            }
        },
        data() {
            return {
                ancestorHeight: 0
            }
        },
        mounted() {
            console.log(this.event)
            if ( this.hasDynamicSize ) {
                this.getAndSetAncestorHeight();
                window.addEventListener('resize', this.getAndSetAncestorHeight);
            }
        },
        beforeDestroy() {
            if ( this.hasDynamicSize )
                window.removeEventListener('resize', this.getAndSetAncestorHeight);
        },
        methods: {
            eventClicked() {
                EventBus.$emit('event-clicked', this.event);
            },
            getAndSetAncestorHeight() {
                this.ancestorHeight = this.findAncestor(this.$refs.event_block, 'v-cal-day__hour-content').offsetHeight;
            },
            findAncestor (el, cls) {
                while ((el = el.parentElement) && !el.classList.contains(cls)) ;
                return el;
            }
        },
        computed: {
            displayHeight() {

                const end = this.event.endTime.hours() > 0 ? moment(this.event.endTime) : moment(this.event.endTime).add(1, 'days');

                const hours = end.diff(this.event.startTime, 'hours', true);
                const bordersOffset = (hours * 2) - 1;
                return ( (hours * 2) * this.ancestorHeight ) + bordersOffset;
            },
            eventStyles() {

                let styles = [];
                styles.push({
                    'backgroundColor': this.event.color,
                    'color': this.event.color,
                });

                if ( this.hasDynamicSize ) {
                    styles.push({
                        'height': this.displayHeight + 'px',
                    });

                    if ( this.event.overlaps > 0 ) {
                        const width = 100 / ( this.event.overlaps + 1 );
                        styles.push({
                            'width': width + '%',
                            'left': width + '%'
                        });
                    }
                    
                    if ( this.event.startTime.minutes() != 0 && this.event.startTime.minutes() != 30 ) {
                        const distance = ( this.ancestorHeight / 60 ) * this.event.startTime.minutes();
                        styles.push({
                            'top': distance + 'px'
                        });
                    }
                    
                }

                return styles;
            },
            eventClasses() {
                return {
                    'is-overlapping': this.event.overlaps > 0
                }
            },
            hasWalkingProblem () {
                return this.event.patient.access === 1 ? 'Sim' : 'Não'
            }
        },
        filters: {
            formatEventTime(hour, use12 = false) {
                if ( !hour )
                    return '';

                if ( use12 )
                    return hour.format( hour.minutes() > 0 ? 'h.mma' : 'ha' ).slice(0, -1);
                if (hour === undefined) {
                    return ''
                }
                console.log(hour)
               // return hour.format( hour.minutes() > 0 ? 'HH.mm' : 'HH' );
            }
        },
    }
</script>

<style scoped>

</style>