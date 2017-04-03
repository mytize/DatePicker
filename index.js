import React, {Component} from 'react';
import {
  View,
  Text,
  Image,
  Modal,
  TouchableHighlight,
  DatePickerAndroid,
  TimePickerAndroid,
  DatePickerIOS,
  Picker,
  Platform,
  Animated
} from 'react-native';
import Style from './style';
import Moment from 'moment';

const FORMATS = {
  'date': 'YYYY-MM-DD',
  'datetime': 'YYYY-MM-DD HH:mm',
  'time': 'HH:mm'
};

class DatePicker extends Component {
  constructor(props) {
    super(props);

    let date = props.date ? Moment(props.date) : Moment();

    this.state = {
      date: date,
      month: date.month(),
      day: date.date(),
      modalVisible: false,
      animatedHeight: new Animated.Value(0)
    };

    this.datePicked = this.datePicked.bind(this);
    this.onPressDate = this.onPressDate.bind(this);
    this.onPressCancel = this.onPressCancel.bind(this);
    this.onPressConfirm = this.onPressConfirm.bind(this);
    this.onDatePicked = this.onDatePicked.bind(this);
    this.onTimePicked = this.onTimePicked.bind(this);
    this.onDatetimePicked = this.onDatetimePicked.bind(this);
    this.onDatetimeTimePicked = this.onDatetimeTimePicked.bind(this);
    this.setModalVisible = this.setModalVisible.bind(this);
  }

  componentWillMount() {
    // ignore the warning of Failed propType for date of DatePickerIOS, will remove after being fixed by official
    console.ignoredYellowBox = [
      'Warning: Failed propType'
      // Other warnings you don't want like 'jsSchedulingOverhead',
    ];
  }

  setModalVisible(visible) {
    const {height, duration} = this.props;

    this.setState({modalVisible: visible});

    // slide animation
    if (visible) {
      Animated.timing(
        this.state.animatedHeight,
        {
          toValue: height,
          duration: duration
        }
      ).start();
    } else {
      this.setState({
        animatedHeight: new Animated.Value(0)
      });
    }
  }

  onStartShouldSetResponder(e) {
    return true;
  }

  onMoveShouldSetResponder(e) {
    return true;
  }

  onPressCancel() {
    this.setModalVisible(false);
  }

  onPressConfirm() {
    this.datePicked();
    this.setModalVisible(false);
  }

  getDate(date = this.props.date) {
    const {mode, minDate, maxDate, format = FORMATS[mode]} = this.props;

    // date默认值
    if (!date) {
      let now = new Date();
      if (minDate) {
        let _minDate = this.getDate(minDate);

        if (now < _minDate) {
          return _minDate;
        }
      }

      if (maxDate) {
        let _maxDate = this.getDate(maxDate);

        if (now > _maxDate) {
          return _maxDate;
        }
      }

      return now;
    }

    if (date instanceof Date) {
      return date;
    }

    return Moment(date, format).toDate();
  }

  getDateStr(date = this.props.date) {
    const {mode, format = FORMATS[mode]} = this.props;

    if (date instanceof Date) {
      return Moment(date).format(format);
    } else {
      return Moment(this.getDate(date)).format(format);
    }
  }

  datePicked() {
    const listOfMonth = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    if (typeof this.props.onDateChange === 'function') {
      this.props.onDateChange({month: listOfMonth[this.state.month], day: this.state.day});
    }
  }

  getTitleElement() {
    const {date, placeholder, customStyles} = this.props;

    if (!date && placeholder) {
      return (<Text style={[Style.placeholderText, customStyles.placeholderText]}>{placeholder}</Text>);
    }
    return (<Text style={[Style.dateText, customStyles.dateText]}>{this.getDateStr()}</Text>);
  }

  onDatePicked({action, year, month, day}) {
    // if (action !== DatePickerAndroid.dismissedAction) {
    //   this.setState({
    //     date: new Date(year, month, day)
    //   });
    //   this.datePicked();
    // }
  }

  onTimePicked({action, hour, minute}) {
    // if (action !== DatePickerAndroid.dismissedAction) {
    //   this.setState({
    //     date: Moment().hour(hour).minute(minute).toDate()
    //   });
    //   this.datePicked();
    // }
  }

  onDatetimePicked({action, year, month, day}) {
    const {mode, format = FORMATS[mode], is24Hour = !format.match(/h|a/)} = this.props;

    if (action !== DatePickerAndroid.dismissedAction) {
      let timeMoment = Moment(this.state.date);

      TimePickerAndroid.open({
        hour: timeMoment.hour(),
        minute: timeMoment.minutes(),
        is24Hour: is24Hour
      }).then(this.onDatetimeTimePicked.bind(this, year, month, day));
    }
  }

  onDatetimeTimePicked(year, month, day, {action, hour, minute}) {
    // if (action !== DatePickerAndroid.dismissedAction) {
    //   this.setState({
    //     date: new Date(year, month, day, hour, minute)
    //   });
    //   this.datePicked();
    // }
  }

  onPressDate() {
    if (this.props.disabled) {
      return true;
    }

    // reset state
    // this.setState({
    //   date: this.getDate()
    // });

    if (Platform.OS === 'ios') {
      this.setModalVisible(true);
    } else {

      const {mode, format = FORMATS[mode], minDate, maxDate, is24Hour = !format.match(/h|a/)} = this.props;

      // 选日期
      if (mode === 'date') {
        DatePickerAndroid.open({
          date: this.state.date,
          minDate: minDate && this.getDate(minDate),
          maxDate: maxDate && this.getDate(maxDate)
        }).then(this.onDatePicked);
      } else if (mode === 'time') {
        // 选时间

        let timeMoment = Moment(this.state.date);

        TimePickerAndroid.open({
          hour: timeMoment.hour(),
          minute: timeMoment.minutes(),
          is24Hour: is24Hour
        }).then(this.onTimePicked);
      } else if (mode === 'datetime') {
        // 选日期和时间

        DatePickerAndroid.open({
          date: this.state.date,
          minDate: minDate && this.getDate(minDate),
          maxDate: maxDate && this.getDate(maxDate)
        }).then(this.onDatetimePicked);
      }
    }
  }

  render() {
    const {
      mode,
      style,
      customStyles,
      disabled,
      showIcon,
      iconSource,
      minDate,
      maxDate,
      minuteInterval,
      timeZoneOffsetInMinutes,
      cancelBtnText,
      confirmBtnText
    } = this.props;

    const dateInputStyle = [
      Style.dateInput, customStyles.dateInput,
      disabled && Style.disabled,
      disabled && customStyles.disabled
    ];

    const month = this.state.month
    let dayOfMonth = 30
    if (month == 0 || month == 2 || month == 4 || month == 6 || month == 7 || month == 9 || month == 11) {
        dayOfMonth = 31
    } else if (month == 1) {
        dayOfMonth = 29
    }

    let days = []

    for (let i = 1; i <= dayOfMonth; i ++) {
        days.push(<Picker.Item key={i} label={`${i}`} value={i} />)
    }

    return (
      <TouchableHighlight
        style={[Style.dateTouch, style]}
        underlayColor={'transparent'}
        onPress={this.onPressDate}
      >
        <View style={[Style.dateTouchBody, customStyles.dateTouchBody]}>
          <View style={dateInputStyle}>
            {this.getTitleElement()}
          </View>
          {showIcon && <Image
            style={[Style.dateIcon, customStyles.dateIcon]}
            source={iconSource}
          />}
          {Platform.OS === 'ios' && <Modal
            transparent={true}
            visible={this.state.modalVisible}
            onRequestClose={() => {this.setModalVisible(false);}}
          >
            <View
              style={{flex: 1}}
            >
              <TouchableHighlight
                style={Style.datePickerMask}
                activeOpacity={1}
                underlayColor={'#00000077'}
                onPress={this.onPressCancel}
              >
                <TouchableHighlight
                  underlayColor={'#fff'}
                  style={{flex: 1}}
                >
                  <Animated.View
                    style={[Style.datePickerCon, {height: this.state.animatedHeight}, customStyles.datePickerCon]}
                  >
                    <View style={[Style.picker, customStyles.datePicker]}>
                        <Picker
                            style={Style.pickerMonth}
                            onValueChange={(value) => this.setState({month: value})}
                            selectedValue={this.state.month}>
                            <Picker.Item key={0} label="January" value={0} />
                            <Picker.Item key={1} label="February" value={1} />
                            <Picker.Item key={2} label="March" value={2} />
                            <Picker.Item key={3} label="April" value={3} />
                            <Picker.Item key={4} label="May" value={4} />
                            <Picker.Item key={5} label="June" value={5} />
                            <Picker.Item key={6} label="July" value={6} />
                            <Picker.Item key={7} label="August" value={7} />
                            <Picker.Item key={8} label="September" value={8} />
                            <Picker.Item key={9} label="October" value={9} />
                            <Picker.Item key={10} label="November" value={10} />
                            <Picker.Item key={11} label="December" value={11} />
                        </Picker>
                        <Picker
                            style={Style.pickerDay}
                            onValueChange={(value) => this.setState({day: value})}
                            selectedValue={this.state.day}>
                            { days }
                        </Picker>
                    </View>

                    {/*<DatePickerIOS
                      date={this.state.date}
                      mode={mode}
                      minimumDate={minDate && this.getDate(minDate)}
                      maximumDate={maxDate && this.getDate(maxDate)}
                      onDateChange={(date) => this.setState({date: date})}
                      minuteInterval={minuteInterval}
                      timeZoneOffsetInMinutes={timeZoneOffsetInMinutes}
                      style={[Style.datePicker, customStyles.datePicker]}
                    />*/}
                    <TouchableHighlight
                      underlayColor={'transparent'}
                      onPress={this.onPressCancel}
                      style={[Style.btnText, Style.btnCancel, customStyles.btnCancel]}
                    >
                      <Text
                        style={[Style.btnTextText, Style.btnTextCancel, customStyles.btnTextCancel]}
                      >
                        {cancelBtnText}
                      </Text>
                    </TouchableHighlight>
                    <TouchableHighlight
                      underlayColor={'transparent'}
                      onPress={this.onPressConfirm}
                      style={[Style.btnText, Style.btnConfirm, customStyles.btnConfirm]}
                    >
                      <Text style={[Style.btnTextText, customStyles.btnTextConfirm]}>{confirmBtnText}</Text>
                    </TouchableHighlight>
                  </Animated.View>
                </TouchableHighlight>
              </TouchableHighlight>
            </View>
          </Modal>}
        </View>
      </TouchableHighlight>
    );
  }
}

DatePicker.defaultProps = {
  mode: 'date',
  date: '',
  // component height: 216(DatePickerIOS) + 1(borderTop) + 42(marginTop), IOS only
  height: 259,

  // slide animation duration time, default to 300ms, IOS only
  duration: 300,
  confirmBtnText: '确定',
  cancelBtnText: '取消',
  iconSource: require('./date_icon.png'),
  customStyles: {},

  // whether or not show the icon
  showIcon: true,
  disabled: false,
  placeholder: '',
  modalOnResponderTerminationRequest: e => true
};

DatePicker.propTypes = {
  mode: React.PropTypes.oneOf(['date', 'datetime', 'time']),
  date: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.instanceOf(Date)]),
  format: React.PropTypes.string,
  minDate: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.instanceOf(Date)]),
  maxDate: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.instanceOf(Date)]),
  height: React.PropTypes.number,
  duration: React.PropTypes.number,
  confirmBtnText: React.PropTypes.string,
  cancelBtnText: React.PropTypes.string,
  iconSource: React.PropTypes.oneOfType([React.PropTypes.number, React.PropTypes.object]),
  customStyles: React.PropTypes.object,
  showIcon: React.PropTypes.bool,
  disabled: React.PropTypes.bool,
  onDateChange: React.PropTypes.func,
  placeholder: React.PropTypes.string,
  modalOnResponderTerminationRequest: React.PropTypes.func,
  is24Hour: React.PropTypes.bool
};

export default DatePicker;
