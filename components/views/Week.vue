<template>
  <section class="v-cal-content">
    <div class="v-cal-weekdays">
      <div class="v-cal-weekdays__padding">
        <div class="v-cal-times">
          <!--Fake, hidden time-->
          <div class="v-cal-hour">00:00 <template v-if="use12">PM</template></div>
        </div>
      </div>
      <div class="v-cal-weekday__wrapper">
        <div class="v-cal-weekday-item" v-for="day in days">{{ day.d.format('ddd DD/MM') }}</div>
      </div>
    </div>
    <div class="v-cal-days">

      <div class="v-cal-times">
        <div class="v-cal-hour all-day">{{ allDayLabel }}</div>
        <div class="v-cal-hour" :class="{ 'is-now': time.isSame(now, 'hour') }" v-for="time in times">{{ time | formatTime(use12) }}</div>
      </div>
      <div class="v-cal-days__wrapper">
        <div class="v-cal-day v-cal-day--week" v-for="day in days" :class="{'is-disabled': day.isDisabled}">
          <div class="v-cal-day__hour-block"
               @click="timeClicked({ date: day.d.toDate(), time: null })">
            <span class="v-cal-day__hour-block-fill">00:00 <template v-if="use12">PM</template></span>
            <div class="v-cal-day__hour-content">
              <div class="v-cal-event-list" :class="{'tiny-events': day.events.filter(e => !e.startTime).length > 2}">
                <event-item
                        v-for="event, index in day.events.filter(e => !e.startTime)"
                        :key="index"
                        :event="event"
                        :has-dynamic-size="false"
                        :use12="use12"
                        :class="{'has-appointment': isAvailable(day, event) }">
                </event-item>

              </div>
            </div>
          </div>

          <div class="v-cal-day__hour-block"
               @click="timeClicked({ date: day.d.toDate(), time: time.hour() })"
               :class="[ time.hour() === now.hour() ? 'is-now' : '', hourClass]" v-for="(time, index) in day.availableTimes">
            <span class="v-cal-day__hour-block-fill">{{ time | formatTime(use12) }}</span>
            <div class="v-cal-day__hour-content">
              <div class="v-cal-event-list">
                <event-item
                        v-for="event, index in day.events"
                        :key="index"
                        :event="event"
                        :use12="use12"
                        v-if="event.startTime && time.hours() === event.startTime.hours()">
                </event-item>
                <availability-item
                        v-for="event, index in day.availabilities"
                        :id="`v-cal-appointment-${index}`"
                        :key="index"
                        :event="event"
                        :use12="use12"
                        :class="isAvailable(day, time, event)"
                        v-if="event.startTime && time.hours() === event.startTime.hours()">
                </availability-item>
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
    import AvailabilityItem from '../AvailabilityItem'
    import IsView from '../mixins/IsView';
    import ShowsTimes from '../mixins/ShowsTimes';

    export default {
        name: "week",
        mixins: [ IsView, ShowsTimes ],
        components: { EventItem, AvailabilityItem },
        data() {
            return {
                days: [],
                // newEvents: JSON.parse(JSON.stringify(this.events))
            }
        },
        mounted() {
            this.buildCalendar();
        },
        methods: {
            timeClicked(data) {
                EventBus.$emit('time-clicked', data)
            },
            isAvailable(date, time, event){
                let day = date.d.format('YYYY-MM-DD')
                let formatedHour = moment(time).format('HH:mm');

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

                    return 'has-appointment is-full'
                }
            },
            buildCalendar() {
                //  Reset events
                // this.newEvents = JSON.parse(JSON.stringify(this.events));
                this.days = [];

                let now = moment();

                let temp = moment( this.activeDate ).day(moment.localeData().firstDayOfWeek());
                let w = temp.week();

                this.days = [];

                do {
                    const day = moment(temp);
                    
                    const dayEvents = this.events.filter( e => e.date.isSame(day, 'day') )
                        .sort( (a, b) => {
                            if ( !a.startTime ) return -1;
                            if ( !b.startTime ) return 1;
                            return moment(a.startTime).format('HH') - moment(b.startTime).format('HH');
                        });

                    const mappedEvents = dayEvents.map( event => {
                        event.overlaps = dayEvents.filter( e => moment(event.startTime).isBetween( moment(e.startTime), moment(e.endTime) ) && e !== event ).length;
                        return event;
                    });

                    const dayAvailabilities = this.availabilities.filter( e => e.date.isSame(day, 'day') )
                        .sort( (a, b) => {
                            if ( !a.startTime ) return -1;
                            if ( !b.startTime ) return 1;
                            return moment(a.startTime).format('HH') - moment(b.startTime).format('HH');
                        });

                    const mappedAvailabilities = dayAvailabilities.map( event => {
                        event.overlaps = dayAvailabilities.filter( e => moment(event.start_time).isBetween( moment(e.start_time), moment(e.end_time) ) && e !== event ).length;
                        return event;
                    });

                    let newDay = {
                        d: day,
                        isPast: temp.isBefore( now, 'day' ),
                        isToday: temp.isSame( now, 'day' ),
                        isDisabled: this.isDayDisabled(temp),
                        //isAvailable: this.isAvailable(temp),
                        availableTimes: this.times.map( time => moment(time).dayOfYear( day.dayOfYear() ) ),
                        events: mappedEvents,
                        availabilities: mappedAvailabilities
                    };

                    this.days.push(newDay);

                    temp.add( 1, 'day' );
                } while ( temp.week() === w );

            },
            hasAppointment (day, event, time){
                return true
            }
        },
        watch: {
            timeRange() {
                this.buildCalendar();
            }
        }
    }
</script>

<style scoped>
/*
.is-disable{
    background-color: #d8a0ab !important;
    border-left: 5px solid red !important;
    cursor: pointer;
    z-index:10;
}
*/

.has-appointment{
    border-left: 5px solid orange;
}

.is-available{
    border-left: 5px solid green;
}

.is-full{
    border-left: 5px solid red;
}

</style>
