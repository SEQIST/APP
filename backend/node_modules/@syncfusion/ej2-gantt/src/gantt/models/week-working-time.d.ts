import { ChildProperty } from '@syncfusion/ej2-base';
import { DayWorkingTimeModel } from './day-working-time-model';
import { DayOfWeek } from '../base/enum';
/**
 * Defines the working time of the day in the project.
 */
export declare class WeekWorkingTime extends ChildProperty<WeekWorkingTime> {
    /**
     * Defines the day of the week to apply customized working time.
     *
     * @default null
     */
    dayOfWeek: DayOfWeek;
    /**
     * Defines the time range for each day of the week.
     *
     * @default []
     * @aspType List<GanttDayWorkingTime>
     *
     */
    timeRange: DayWorkingTimeModel[];
}
