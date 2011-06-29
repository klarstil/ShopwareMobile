<script type="text/javascript">
/**
 * @file locale.js
 * @link http://www.shopware.de
 * @author S.Pohl <stp@shopware.de>
 * @date 30-05-11
 */

Ext.ns('App.views.Viewport', 'App.views.Shop', 'App.views.Search', 'App.views.Cart', 'App.views.Account', 'App.views.Info', 'App.views.Checkout');

/** Localized day names */
Date.dayNames = [
	'Sonntag',
	'Montag',
	'Dienstag',
	'Mittwoch',
	'Donnerstag',
	'Freitag',
	'Samstag'
];

/** Localized month names */
Date.monthNames = [
	'Januar',
	'Februar',
	'M&auml;rz',
	'April',
	'Mai',
	'Juni',
	'Juli',
	'August',
	'September',
	'Oktober',
	'November',
	'Dezember'
];

/**
 * @class Ext.util.localeFormat
 * Reusable data formatting functions
 * @singleton
 */
Ext.util.localeFormat = {
	defaultDateFormat: 'd.m.Y',
	date: function(v, format) {
		if (!v) {
			return "";
		}
		if (!Ext.isDate(v)) {
			v = new Date(Date.parse(v));
		}
		return v.dateFormat(format || Ext.util.localeFormat.defaultDateFormat);
	}
}

/**
 * @class Ext.localePicker
 * @extends Ext.Picker
 * A general localized picker class
 */
Ext.localePicker = Ext.extend(Ext.Picker, {
	doneButton: 'Fertig',
	cancelButton: 'Abbrechen',

	initComponent: function() {
		Ext.localePicker.superclass.initComponent.call(this);
	}
});
Ext.reg('localePicker', Ext.form.Select);

/**
 * @class Ext.localeDatePicker
 * @extends Ext.Datepicker
 * A localized date picker component
 */
Ext.localeDatePicker = Ext.extend(Ext.DatePicker, {
	yearFrom: 1920,
	monthText: 'Monat',
	dayText: 'Tag',
	yearText: 'Jahr',
	slotOrder: ['day', 'month', 'year'],
	doneButton: 'Fertig',
	cancelButton: 'Abbrechen',
	initComponent: function() {
		Ext.localeDatePicker.superclass.initComponent.call(this);
	}
});
Ext.reg('localeDatepicker', Ext.localeDatePicker);

/**
 * @class Ext.form.localeDatePicker
 * @extends Ext.form.DatePicker
 * Specialized field which has a button which when pressed, shows a Ext.localeDatePicker
 */
Ext.form.localeDatePicker = Ext.extend(Ext.form.DatePicker, {
	getDatePicker: function() {
        if (!this.datePicker) {
			if(this.picker instanceof Ext.DatePicker) {
				throw new Error('localDatepicker: The passed Datepicker is not localized');
			}
            if (this.picker instanceof Ext.localeDatePicker ) {
                this.datePicker = this.picker;
            } else {
                this.datePicker = new Ext.localeDatePicker(Ext.apply(this.picker || {}));
            }

            this.datePicker.setValue(this.value || null);

            this.datePicker.on({
                scope : this,
                change: this.onPickerChange,
                hide  : this.onPickerHide
            });
        }

        return this.datePicker;
    },
	getValue: function(format) {
        var value = this.value || null;
        return (format && Ext.isDate(value)) ? value.format(Ext.util.localeFormat.defaultDateFormat) : value;
    },
	initComponent: function() {
		Ext.form.localeDatePicker.superclass.initComponent.call(this);
	}
});
Ext.reg('localeDatepickerfield', Ext.form.localeDatePicker);

/**
 * @class Ext.form.localeSelect
 * @extends Ext.form.Select
 * Localized select field wrapper
 */
Ext.form.localeSelect = Ext.extend(Ext.form.Select, {
	getPicker: function() {
		if (!this.picker) {
			this.picker = new Ext.localePicker({
				slots: [{
					align       : 'center',
					name        : this.name,
					valueField  : this.valueField,
					displayField: this.displayField,
					value       : this.getValue(),
					store       : this.store
				}],
				listeners: {
					change: this.onPickerChange,
					scope: this
				}
			});
		}

		return this.picker;
	},
	initComponent: function() {
		Ext.form.localeSelect.superclass.initComponent.call(this);
	}
});
Ext.reg('localeSelectfield', Ext.form.localeSelect);
</script>