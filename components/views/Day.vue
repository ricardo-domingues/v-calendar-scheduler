<template>
    <section class="v-cal-content">
        <div v-if="!showTitle">
        <div class="v-cal-weekdays">
            <div class="v-cal-weekday-item" v-if="audiologistHasAvailability(value.id)" v-for="value in audiologists"> {{ value.name }}</div>
        </div>
        <div class="v-cal-days">
            <div class="v-cal-times">
                <!--<div class="v-cal-hour">{{ allDayLabel }}</div>-->
                <div class="v-cal-hour" :class="{ 'is-now': time.isSame(now, 'hour') }" v-for="time in times">{{ time | formatTime(use12) }}</div>
            </div>
            <div class="v-cal-days__wrapper">
                <div class="v-cal-day v-cal-day--week" v-for="audiologist in audiologists" :class="{ 'is-today': day.isToday }" v-if="day !== null && audiologistHasAvailability(audiologist.id)">
                    <div class="v-cal-day__hour-block"
                         @click="timeClicked({ date: day.d.toDate(), time: time.hour() })"
                         :class="[ time.isSame(now, 'hour') ? 'is-now' : '', hourClass ]" v-for="time in day.availableTimes">
                        <span class="v-cal-day__hour-block-fill">{{ time | formatTime(use12) }}</span>
                        <div class="v-cal-day__hour-content">
                            <div class="v-cal-event-list">
                                <availability-item
                                        v-for="event, index in day.availabilities"
                                        v-if="event.startTime && time.format('HH:mm') === event.startTime.format('HH:mm') && audiologist.id === event.staff.id"
                                        :key="index"
                                        :event="event"
                                        :use12="use12"
                                        :class="isAvailable(time, event)">
                                </availability-item>
                                <event-item
                                        v-for="event, index in day.events"
                                        v-if="event.startTime && time.format('HH:mm') === event.startTime.format('HH:mm') && audiologist.id === event.audiologist.id"
                                        :key="index"
                                        :event="event"
                                        :use12="use12"
                                        class="event-item-cal">
                                </event-item>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div v-else>
        <div class="v-cal-weekdays">
            <div class="v-cal-weekday-item" v-if="audiologistHasAvailability(value.id)" v-for="value in audiologists"> {{ value.name }}</div>
        </div>
        <div class="v-cal-days">
            <div class="v-cal-times">
                <!--<div class="v-cal-hour">{{ allDayLabel }}</div>-->
                <div class="v-cal-hour" :class="{ 'is-now': time.isSame(now, 'hour') }" v-for="time in times">{{ time | formatTime(use12) }}</div>
            </div>
            <div class="v-cal-days__wrapper">
                <div class="v-cal-day v-cal-day--week" v-for="audiologist in audiologists" :class="{ 'is-today': day.isToday }" v-if="day !== null && audiologistHasAvailability(audiologist.id)">
                    <div class="v-cal-day__hour-block"
                         @click="timeClicked({ date: day.d.toDate(), time: time.hour() })"
                         :class="[ time.isSame(now, 'hour') ? 'is-now' : '', hourClass ]" v-for="time in day.availableTimes">
                        <span class="v-cal-day__hour-block-fill">{{ time | formatTime(use12) }}</span>
                        <div class="v-cal-day__hour-content">
                            <div class="v-cal-event-list">
                                <availability-item
                                        v-for="event, index in day.availabilities"
                                        v-if="event.startTime && time.format('HH:mm') === event.startTime.format('HH:mm') && audiologist.id === event.staff.id"
                                        :key="index"
                                        :event="event"
                                        :use12="use12"
                                        :class="isAvailable(time, event)">
                                </availability-item>
                                <event-item
                                        v-for="event, index in day.events"
                                        v-if="event.startTime && time.format('HH:mm') === event.startTime.format('HH:mm') && audiologist.id === event.audiologist.id"
                                        :key="index"
                                        :event="event"
                                        :use12="use12"
                                        class="event-item-cal">
                                </event-item>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </section>
</template>

<script>
    import moment from 'moment';
    import { EventBus } from '../EventBus';
    import EventItem from '../EventItem';
    import AvailabilityItem from '../AvailabilityItem';
    import IsView from '../mixins/IsView';
    import ShowsTimes from '../mixins/ShowsTimes';

    export default {
        name: "day",
        mixins: [ IsView, ShowsTimes ],
        components: { EventItem, AvailabilityItem },
        data() {
            return {
                day: null
            }
        },
        mounted() {
            this.buildCalendar();
        },
        methods: {
            timeClicked(data) {
                EventBus.$emit('time-clicked', data)
            },
            isAvailable(time, event){
                //let day = date.d.format('YYYY-MM-DD')
                let formatedHour = moment(time).format('HH:mm');

                if(!this.showBorders){
                    return
                }

                if(!event.appointments || event.appointments.length === 0){
                    return 'is-available'
                }

                for(var i = 0; i < event.appointments.length; i++){
                    let endTime = moment(event.appointments[i].endTime, 'HH:mm:ss');
                    let nextStartTime;

                    if(i === event.appointments.length - 1){
                        nextStartTime = moment(event.endTime, 'HH:mm:ss');
                    }else{
                        nextStartTime = moment(event.appointments[i + 1].startTime, 'HH:mm:ss');
                    }

                    if(nextStartTime && moment.duration(nextStartTime.diff(endTime)).asMinutes() >= 30){
                        return 'has-appointment'
                    }

                    if(i === event.appointments.length - 1){
                        return 'has-appointment is-full'
                    }
                }
            },
            buildCalendar() {
                let now = moment();

                const today = moment( this.activeDate );

                const dayEvents = this.events.filter( e => moment(e.date).isSame(today, 'day') )
                    .sort( (a, b) => {
                        if ( !a.startTime ) return -1;
                        if ( !b.startTime ) return 1;
                        return moment(a.startTime, 'HH:mm').format('HH') - moment(b.startTime, 'HH:mm').format('HH');
                    });

                const dayAvailabilities = this.availabilities.filter( e => moment(e.date).isSame(today, 'day') )
                  .sort( (a, b) => {
                      if ( !a.startTime ) return -1;
                      if ( !b.startTime ) return 1;
                      return moment(a.startTime, 'HH:mm').format('HH') - moment(b.startTime, 'HH:mm').format('HH');
                  });
                  /*
                const mappedAvailabilities = dayAvailabilities.map( event => {
                    event.overlaps = dayAvailabilities.filter( e => moment(event.startTime, 'HH:mm').isBetween( moment(e.startTime, 'HH:mm'), moment(e.endTime, 'HH:mm') ) && e !== event ).length;
                    return event;
                });
                    */

                    const mappedAvailabilities = dayAvailabilities.map( event => {
                        
                        event.overlaps = dayAvailabilities.filter( e =>  {
                            moment(event.startTime).isBetween( moment(e.startTime), moment(e.endTime)) }).length;
                        console.log(event.overlaps)
                        return event;
                        
                        /*
                        let counter = 0;
                        for(var i=0; i < dayAvailabilities.length; i++){
                            let _startTime = moment(dayAvailabilities[i].startTime)
                            let _endTime = moment(dayAvailabilities[i].endTime)
                            let eventStartTime = moment(event.startTime)
                            if(eventStartTime.isBetween(_startTime, _endTime)){
                                counter ++;
                            }
                        }
                        event.overlaps = counter;
                        return event;
                        */
                    });

                    const mappedEvents = dayEvents.map( event => {
                        let counter = dayAvailabilities.filter( e => {
                            if(e.id === event.availability_id){
                                event.audiologist = e.staff
                            }
                            moment(event.startTime).isBetween( moment(e.startTime), moment(e.endTime) ) && e.id !== event.availability_id }).length;
                        /*
                        dayAvailabilities.forEach(a => {
                            if(event.availability_id === a.id){
                                event.overlaps = a.overlaps
                            }
                        })
                        */
                        event.overlaps = counter;
                        return event;
                    });
                this.day = {
                    d: today,
                    isPast: today.isBefore( now, 'day' ),
                    isToday: today.isSame( now, 'day' ),
                    availableTimes: this.times,
                    events: mappedEvents,
                    availabilities: mappedAvailabilities
                };
            },
            audiologistHasAvailability (id) {
                console.log('lol')
                for (var i = 0; i < this.day.availabilities.length; i++) {
                    if(this.day.availabilities[i].staff.id === id){
                        return true
                    }
                }

                return false
            }
        }
    }
</script>

<style scoped>


.has-appointment{
    border-left: 5px solid orange;
    position: static;
}

.is-available{
    border-left: 5px solid green;
}

.is-full{
    border-left: 5px solid red;
}

.v-cal-event-list{
    position: relative!
}

.event-item-cal{
    position: absolute;
}

</style>
