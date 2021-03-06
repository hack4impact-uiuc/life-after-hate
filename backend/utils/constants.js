const STATE_REGION_MAP = [
  { State: "AL", Region: 4 },
  { State: "AK", Region: 10 },
  { State: "AZ", Region: 9 },
  { State: "AR", Region: 6 },
  { State: "CA", Region: 9 },
  { State: "CO", Region: 8 },
  { State: "CT", Region: 1 },
  { State: "DE", Region: 3 },
  { State: "FL", Region: 4 },
  { State: "GA", Region: 4 },
  { State: "HI", Region: 9 },
  { State: "ID", Region: 10 },
  { State: "IL", Region: 5 },
  { State: "IN", Region: 5 },
  { State: "IA", Region: 7 },
  { State: "KS", Region: 7 },
  { State: "KY", Region: 4 },
  { State: "LA", Region: 6 },
  { State: "ME", Region: 1 },
  { State: "MD", Region: 3 },
  { State: "MA", Region: 1 },
  { State: "MI", Region: 5 },
  { State: "MN", Region: 5 },
  { State: "MS", Region: 4 },
  { State: "MO", Region: 7 },
  { State: "MT", Region: 8 },
  { State: "NE", Region: 7 },
  { State: "NV", Region: 9 },
  { State: "NH", Region: 1 },
  { State: "NJ", Region: 2 },
  { State: "NM", Region: 6 },
  { State: "NY", Region: 2 },
  { State: "NC", Region: 4 },
  { State: "ND", Region: 8 },
  { State: "OH", Region: 5 },
  { State: "OK", Region: 6 },
  { State: "OR", Region: 10 },
  { State: "PA", Region: 3 },
  { State: "RI", Region: 1 },
  { State: "SC", Region: 4 },
  { State: "SD", Region: 8 },
  { State: "TN", Region: 4 },
  { State: "TX", Region: 6 },
  { State: "UT", Region: 8 },
  { State: "VT", Region: 1 },
  { State: "VA", Region: 3 },
  { State: "WA", Region: 10 },
  { State: "WV", Region: 3 },
  { State: "WI", Region: 5 },
  { State: "WY", Region: 8 },
  { State: "PR", Region: 2 },
  { State: "US Virgin Islands", Region: 2 },
  { State: "District of Columbia", Region: 3 },
  { State: "American Samoa", Region: 9 },
  { State: "Guam", Region: 9 },
  { State: "Northern Mariana Islands", Region: 9 },
];

const DEFAULT_FILTER_OPTIONS = {
  shouldSort: true,
  threshold: 0.2,
  location: 0,
  distance: 10000000,
  findAllMatches: true,
  keys: [
    {
      name: "allText",
      weight: 0.99,
    },
  ],
};

const TAG_ONLY_OPTIONS = {
  shouldSort: true,
  threshold: 0.4,
  findAllMatches: true,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: [
    {
      name: "tags",
      weight: 0.99,
    },
  ],
};

module.exports = {
  STATE_REGION_MAP,
  TAG_ONLY_OPTIONS,
  DEFAULT_FILTER_OPTIONS,
};
