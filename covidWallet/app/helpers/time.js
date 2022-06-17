import moment from 'moment';

var dateFormats = [
  // with forward slash
  "YYYY/MM/DD",
  "MM/DD/YYYY",
  "DD/MM/YYYY",
  // with hyphen
  "YYYY-MM-DD",
  "MM-DD-YYYY",
  "DD-MM-YYYY",
];

var timeFormats = [
  "YYYY-MM-DD[T]HH:mm:ss.SSSZ",
  "MM-DD-YYYY[T]HH:mm:ss.SSSZ",
  "DD-MM-YYYY[T]HH:mm:ss.SSSZ",
  // with forward slash
  "YYYY/MM/DD HH:mm:ss",
  "MM/DD/YYYY HH:mm:ss",
  "DD/MM/YYYY HH:mm:ss",
  // with hyphen
  "YYYY-MM-DD HH:mm:ss",
  "MM-DD-YYYY HH:mm:ss",
  "DD-MM-YYYY HH:mm:ss",
];


export const get_local_issue_time = (issueTime) => {
  return moment
    .utc(issueTime, timeFormats)
    .local()
    .format('DD/MM/YYYY HH:mm')
    .toString();
};

export const get_local_issue_date = (issueTime) => {
  if (moment.utc(issueTime, dateFormats).isValid()) {
    return moment
      .utc(issueTime, 'MM/DD/YYYY hh:mm:ss')
      .local()
      .format('DD/MM/YYYY')
      .toString();
  } else {
    let formattedDate = moment(issueTime).format('DD/MM/YYYY');
    if (formattedDate !== 'Invalid date') {
      return formattedDate;
    }
    return issueTime;
  }
};

export const get_local_date = (dateTime) => {
  return moment
    .utc(dateTime).format('DD/MM/YYYY').toString();
}

export const get_local_date_time = (date) => {
  return moment(date).format('DD/MM/YYYY hh:mm A');
};

export const is_date_time = (val) => {
  if (!moment(val, timeFormats, true).isValid()) return false

  return true
}

export const is_date = (val) => {
  if (!moment(val, dateFormats, true).isValid()) return false

  return true
}

export const parse_date_time = (val) => {
  if (is_date(val)) {
    return moment(val).format('DD/MM/YYYY');
  }

  if (is_date_time(val)) {
    return get_local_issue_time(val);
  }

  return val
}

export const check_if_today = (date) => {
  if (!date) return false
  return moment("17-06-2022").local().format('YYYY-MM-DD') == moment(date).local().format('YYYY-MM-DD');
}