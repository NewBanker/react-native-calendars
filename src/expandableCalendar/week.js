import PropTypes from 'prop-types';

import React, {PureComponent} from 'react';
import {View} from 'react-native';

import dateutils from '../dateutils';
import {parseDate, toMarkingFormat} from '../interface';
import {getState} from '../day-state-manager';
import {extractComponentProps} from '../component-updater';
import styleConstructor from './style';
import Calendar from '../calendar';
import Day from '../calendar/day/index';
import BasicDay from '../calendar/day/basic';

class Week extends PureComponent {
  static displayName = 'IGNORE';

  static propTypes = {
    ...Calendar.propTypes,
    /** the current date */
    current: PropTypes.any
  };

  constructor(props) {
    super(props);

    this.style = styleConstructor(props.theme);
  }

  getWeek(date) {
    return dateutils.getWeekDates(date, this.props.firstDay);
  }

  renderWeekNumber(weekNumber) {
    return (
      <BasicDay
        key={`week-${weekNumber}`}
        theme={this.props.theme}
        marking={{disableTouchEvent: true}}
        state="disabled"
      >
        {weekNumber}
      </BasicDay>
    );
  }

  renderWeekNumberCustom = day => {
    if (this.props.weekComponent) {
      const WeekComponent = this.props.weekComponent;
      const dayProps = extractComponentProps(Day, this.props);
      return (
        <View style={this.style.dayContainer} key={`week-container-${day.getWeek()}`}>
          <WeekComponent {...dayProps} date={day}></WeekComponent>
        </View>
      );
    }
  };

  renderDay(day, id) {
    const {current, hideExtraDays, markedDates} = this.props;
    const dayProps = extractComponentProps(Day, this.props);

    // hide extra days
    if (current && hideExtraDays) {
      if (!dateutils.sameMonth(day, parseDate(current))) {
        return <View key={id} style={this.style.emptyDayContainer} />;
      }
    }

    return (
      <View style={this.style.dayContainer} key={id}>
        <Day
          {...dayProps}
          day={day}
          state={getState(day, parseDate(current), this.props)}
          marking={markedDates?.[toMarkingFormat(day)]}
          onPress={this.props.onDayPress}
          onLongPress={this.props.onDayPress}
        />
      </View>
    );
  }

  render() {
    const {current} = this.props;
    const dates = this.getWeek(current);
    const week = [];

    if (dates) {
      dates.forEach((day, id) => {
        week.push(this.renderDay(day, id));
      }, this);
    }

    if (dates && this.props.showWeekNumbers) {
      if (this.props.weekComponent) {
        week.unshift(this.renderWeekNumberCustom(dates[dates.length - 1]));
      } else {
        week.unshift(this.renderWeekNumber(dates[dates.length - 1].getWeek()));
      }
    }

    return (
      <View style={this.style.container}>
        <View style={[this.style.week, this.props.style]}>{week}</View>
      </View>
    );
  }
}

export default Week;
