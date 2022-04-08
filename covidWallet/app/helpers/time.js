import moment from 'moment';
import {Platform} from 'react-native';

export const get_local_issue_time = (issueTime) => {
  console.log(
    'DateFromate',
    moment('04/07/2022 10:08:00').creationData().format,
  );

  console.log('issueTime', issueTime);
  // issueTime = '04/06/2022 13:13:00';
  if (moment(issueTime).utc().isValid()) {
    ///UTC if valid

    alert('UTCValid');
    let offset = moment().utcOffset();
    let formattedTime = moment
      .utc(issueTime)
      .utcOffset(offset)
      .format('DD/MM/yyyy HH:mm');

    if (formattedTime !== 'Invalid date') {
      alert('valid');
      return formattedTime;
    }
    alert('invalid');

    return issueTime;
  } else {
    alert('UTCinValid');
    //local time
    // let formattedTime = moment(issueTime).local().format('DD/MM/YYYY HH:mm');

    // let formattedTime =
    //   Platform.OS === 'android'
    //     ? moment.utc(issueTime).local().format('DD MMM` YY hh:mm A')
    //     : moment.utc(issueTime).local().format('DD/MM/yyyy HH:mm');

    let formattedTime = moment
      .utc(issueTime)
      .local()
      .format('DD/MM/yyyy HH:mm');

    if (formattedTime !== 'Invalid date') {
      alert('elsevalid');
      return formattedTime;
    }

    if (Platform.OS === 'android' && formattedTime == 'Invalid date') {
      return moment
        .utc(issueTime, 'MM/DD/YYYY hh:mm:ss')
        .local()
        .format('DD/MM/YYYY HH:mm')
        .toString();
    }

    alert('elseinvalid');

    return issueTime;
  }
};

export const get_local_issue_date = (issueDate) => {
  if (moment(issueDate).utc().isValid()) {
    //UTC if valid
    let formattedDate = moment(issueDate, 'MM/DD/YYYY hh:mm:ss')
      .utc()
      .local()
      .format('DD/MM/YYYY')
      .toString();

    if (formattedDate !== 'Invalid date') {
      return formattedDate;
    }
  } else {
    //local date
    let formattedDate = moment(issueDate).local().format('DD/MM/YYYY');
    if (formattedDate !== 'Invalid date') {
      return formattedDate;
    }
    return issueDate;
  }
};
