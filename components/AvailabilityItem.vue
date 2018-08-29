 <template>
    <div ref="event_block" class="v-cal-event-item custom-availability-filled"
         :title="event.startTime | formatEventTime(use12) + 'h - ' + event.staff.name + ' - ' + event.entity + ' - ' + event.local.room"
         :class="eventClasses"
         @click.stop="availabilityClicked"
         :style="eventStyles">
         <div class="row">
            <div class="col-md-12 col-6">
                <span v-if="showTitle" class="v-cal-event-time vuestic-icon vuestic-icon-time"></span>
                <span v-if="showTitle" class="v-cal-event-time" >{{ event.startTime | formatEventTime(use12) }}h - {{ event.endTime | formatEventTime(use12) }}h</span>
            </div>
            <div class="col">
                <span v-if="showTitle" class="v-cal-event-name">{{ event.staff.name }}</span>
            </div>
            <div class="col">
                 <span v-if="showTitle" class="v-cal-event-name">{{ event.local.room }}</span>
            </div>
         </div>

    </div>
</template>

<script>
    import Vue from 'vue'
    import moment from 'moment';
    import { EventBus } from './EventBus';

    export default {
        name: "AvailabilityItem",
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
            },
            showTitle: {
                type: Boolean
            }
        },
        data() {
            return {
                ancestorHeight: 0,
                lastDrawPoint: 0
            }
        },
        mounted() {
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
            availabilityClicked() {
                EventBus.$emit('availability-clicked', this.event);
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
                const minutes = end.diff(this.event.startTime, 'minutes');

                const bordersOffset = (hours * 2) - 1;
                console.log((hours * 2) * this.ancestorHeight + bordersOffset)
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

                    if ( this.event.startTime.minutes() != 0 && this.event.startTime.minutes() != 30) {
                        const distance = ( this.ancestorHeight / 30 ) * this.event.startTime.minutes();
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
            }
        },
        filters: {
            formatEventTime(hour, use12 = false) {
                if ( !hour )
                    return '';

                if ( use12 )
                    return hour.format( hour.minutes() > 0 ? 'h.mma' : 'ha' ).slice(0, -1);

                return hour.format( hour.minutes() > 0 ? 'HH.mm' : 'HH' );
            }
        },
    }
</script>

<style scoped>

.custom-availability{
    background-color: #EAF0CE !important;
}
/*



.custom-availability-filled{
    border: 1px solid green;
}
*/
.custom-availability-filled{
    background-color: #29c4a9 !important;
}

.v-cal-event-name{
    
}

</style>