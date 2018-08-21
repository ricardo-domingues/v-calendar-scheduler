import moment from 'moment';
import config from '../../utils/config';

export default {
  props: {
    timeRange: {
      type: Array,
      required: true,
    },
    showTimeMarker: {
      type: Boolean
    },
    allDayLabel: {
      type: String,
      default: () => config.labels.all_day
    }
  },
  data() {
    return {
      now: moment(new Date())
    }
  },
  computed: {
    times() {
      let times = [];
      console.log(this.timeRange)
      for ( let i = this.timeRange[0]; i < this.timeRange[1] + 1; i++ ) {
        const momentTime = moment(i, 'HH:mm');
        //onst momentTime2 = moment(i, 'HH:mm').add(30, 'minutes')
        times.push(momentTime);
        //times.push(momentTime2);
      }
      console.log(times)
      return times;
    },
    hourClass() {
      const minutes = Math.round(this.now.minutes() / 10) * 10;
      return this.showTimeMarker ? 'has-marker is-' + minutes : '';
    }
  },
  filters: {
    formatTime( time, use12 = false ) {
      if ( use12 )
        return time.format('hh:mm A');

      return time.format('HH:mm');
    }
  }
}
