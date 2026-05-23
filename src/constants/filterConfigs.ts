import type { FilterConfig } from '../types';

export const BOOKING_STATUS_OPTIONS = [
  { label: 'Confirmed', value: 0 },
  { label: 'Cancelled', value: 1 },
  { label: 'Completed', value: 2 },
  { label: 'Pending',   value: 3 },
];

export const RATING_OPTIONS = [1, 2, 3, 4, 5].map((r) => ({
  label: `${r} Star${r > 1 ? 's' : ''}`,
  value: r,
}));

export const STATUS_OPTIONS = [
  { label: 'Active',   value: 'true'  },
  { label: 'Inactive', value: 'false' },
];

export const userFilterConfig: FilterConfig[] = [
  {
    type:        'text',
    field:       'search',
    placeholder: 'Search by name, email or phone…',
    label:       'Search',
    fullWidth:   true,
  },
];

export const hotelFilterConfig: FilterConfig[] = [
  {
    type:        'text',
    field:       'search',
    placeholder: 'Search hotel name…',
    label:       'Search',
    fullWidth:   true,
  },
  {
    type:        'dropdown',
    field:       'stateId',
    label:       'State',
    optionsKey:  'states',
    optionLabel: 'name',
    optionValue: '_id',
    placeholder: 'All States',
  },
  {
    type:        'dropdown',
    field:       'cityId',
    label:       'City',
    optionsKey:  'cities',
    optionLabel: 'name',
    optionValue: '_id',
    placeholder: 'All Cities',
    dependsOn:   'stateId',
  },
  {
    type:        'dropdown',
    field:       'rating',
    label:       'Rating',
    options:     RATING_OPTIONS,
    optionLabel: 'label',
    optionValue: 'value',
    placeholder: 'All Ratings',
  },
  {
    type:        'dropdown',
    field:       'isActive',
    label:       'Status',
    options:     STATUS_OPTIONS,
    optionLabel: 'label',
    optionValue: 'value',
    placeholder: 'All Statuses',
  },
];

export const bookingFilterConfig: FilterConfig[] = [
  {
    type:        'dropdown',
    field:       'userId',
    label:       'Guest',
    optionsKey:  'bookedUsers',
    optionLabel: 'name',
    optionValue: '_id',
    placeholder: 'All Guests',
  },
  {
    type:        'dropdown',
    field:       'hotelId',
    label:       'Hotel',
    optionsKey:  'hotels',
    optionLabel: 'name',
    optionValue: '_id',
    placeholder: 'All Hotels',
  },
  {
    type:        'dropdown',
    field:       'status',
    label:       'Status',
    options:     BOOKING_STATUS_OPTIONS,
    optionLabel: 'label',
    optionValue: 'value',
    placeholder: 'All Statuses',
  },
  { type: 'date', field: 'fromDate', label: 'Check-in From' },
  { type: 'date', field: 'toDate',   label: 'Check-in To'   },
];
