import moment from 'moment';

export default {
    props: {
        activeDate: {
            type: Object
        },
        minDate: {
            type: [Date, Object]
        },
        maxDate: {
            type: [Date, Object]
        },
        events: {
            type: Array
        },
        use12: {
            type: Boolean,
            required: true
        },
        availabilities: {
            type: Array
        },
        showTitle: {
            type: Boolean
        },
        showBorders: {
            type: Boolean,
            default: true
        }
    },
    methods: {
        isDayDisabled(day) {
            if ( !this.minDate && !this.maxDate )
                return false;

            if ( this.minDate && this.minDate.isAfter(day, 'day') ) return true;
            if ( this.maxDate && this.maxDate.isBefore(day, 'day') ) return true;
        },
        isAvailable(day){
            return this.availabilities.filter(availability => {
              return day.isSame(availability.day);
            }) > 0;
        }
    },
    watch: {
        activeDate() {
            this.buildCalendar();
        },
        events() {
            this.buildCalendar();
        }
    }
}
