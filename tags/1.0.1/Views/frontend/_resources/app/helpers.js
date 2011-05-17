/**
 * ----------------------------------------------------------------------
 * helpers.js
 *
 * Provides basic helper functions
 * ----------------------------------------------------------------------
 */
 
/**
 * Provides basic helper functions for the application
 *
 * @author S.Pohl info@shopware.de
 * @date 05-11-11
 * @class
 */
App.Helpers = {

    /**
     * Sends an post request to the server
     *
     * @requires this._request()
     * @param url
     * @param params
     * @param callback
     * @param scope
     */
	postRequest: function(url, params, callback, scope) {
		this._request(url, 'POST', params, callback, scope);
	},

    /**
     * Sends an get request to the server
     *
     * @requires this._request()
     * @param url
     * @param params
     * @param callback
     * @param scope
     */
	getRequest: function(url, params, callback, scope) {
		this._request(url, 'GET', params, callback, scope);
	},

    /**
     * Sends an general request to the server
     *
     * @private
     * @param url
     * @param method
     * @param params
     * @param callback
     * @param scope
     */
	_request: function(url, method, params, callback, scope) {
		scope = scope || this;
		Ext.Ajax.request({
			url: url,
			method: method,
			disableCaching: false,
			params: params,
			success: function(response, options) {
				try {
					this.data = Ext.util.JSON.decode(response.responseText)
				} catch(err) {
					Ext.Msg.alert('Fehler', 'Es ist ein Fehler bei einen AJAX-Request aufgetreten, bitte versuchen Sie es sp&auml;er erneut.');
				}
				
				if(Ext.isFunction(callback)) {
					callback.call(scope, this.data);
				}
			}
		});
	},

    /**
     * Checks if the user is logged in
     *
     * @param void
     * @returns data - Login data
     */
	isUserLoggedIn: function() {
		this.getRequest(App.RequestURL.userLoggedIn, '', function(data) {
			if(data == true) {
				this.getUserData();
				isUserLoggedIn = '1';
			} else {
				isUserLoggedIn = '';
			}
			return data;
		});
	},

    /**
     * Loads user data in "UserData" store
     *
     */
	getUserData: function() {
		App.stores.UserData.load();
	},

    /**
     * Loads all available payment methods
     *
     * @param void
     */
	getPaymentMethods: function() {
		if(!Ext.isEmpty(isUserLoggedIn)) {
			this.getRequest(App.RequestURL.getPayment, '', function(data) {
				if(data.length) {
					data = Ext.util.JSON.decode(data)
					return data;
				}
				return false;
			});
		}
		return false;
	},

    /**
     * Server class which is needed for the liveshopping
     *
     * @class
     */
	server: {

        /** Date object which stores the liveshopping time */
		dataObj: {},

        /**
         * Initialize the liveshopping timing
         *
         * @param servertime
         */
		init: function(servertime) {
			App.Helpers.server.dateObj = new Date();
			App.Helpers.server.dateObj.setTime(servertime * 1000);
			window.setInterval(function() {
				App.Helpers.server.increment();
			}, 1000);
		},

        /**
         * Increments the liveshopping time
         */
		increment: function() {
			var crntTime = App.Helpers.server.dateObj.getTime() + 1000;
			App.Helpers.server.dateObj = new Date(crntTime);
		}
	},

    /**
     * Liveshopping class which handles the whole liveshopping process
     *
     * @public
     * @class
     */
	liveshopping: {

        /**
         * Current liveshopping price
         * @private
         */
	    _price: null,

        /**
         * Initialize the liveshopping
         *
         * @param data - basic liveshopping data
         */
		init: function(data) {
			var now, diff, target, me = this;
			target = new Date();
			target.setTime(data.valid_to_ts * 1000);
			this._price = null;
			
			var interval = window.setInterval(function() {
				now = App.Helpers.server.dateObj;
				diff = App.Helpers.timestampDiff(target.getTime(), now.getTime());

				// check difference
				if(diff !== false) {

					// refresh price
					if(data.typeID == 2 || data.typeID == 3) {
						App.Helpers.liveshopping.refreshPrices(diff, data);
					}

					// refresh dates
					App.Helpers.liveshopping.refreshDates(diff);
				}
			}, 1000);

			return interval;
		},

        /**
         * Refreshes the dates and times in the liveshopping display
         *
         * @param diff
         */
		refreshDates: function(diff) {
			var tmpD = diff.d.toString(), tmpH = diff.h.toString(), tmpM = diff.m.toString(), tmpS = diff.s.toString();

			// days
			if(tmpD.length == 1) { tmpD = '0' + tmpD }
			$$('days_time').innerHTML = tmpD;

			// hours
			if(tmpH.length == 1) { tmpH = '0' + tmpH }
			$$('hours_time').innerHTML = tmpH;

			// minutes
			if(tmpM.length == 1) { tmpM = '0' + tmpM }
			$$('minutes_time').innerHTML = tmpM;

			// seconds
			if(tmpS.length == 1) { tmpS = '0' + tmpS }
			$$('seconds_time').innerHTML = tmpS;

			return true;
		},

        /**
         * Refreshes the prices in the liveshopping display
         *
         * @param diff
         * @param data
         */
		refreshPrices: function(diff, data) {
			if(diff.s === 0) {

				var newPrice = parseFloat($$('priceHidden').value);
				var priceEl = $$('price');

				if(data.typeID == 2) {
					newPrice = newPrice - data.minPrice;
				} else if(data.typeID == 3) {
					newPrice = newPrice + data.minPrice;
				}

				priceEl.innerHTML = App.Helpers.number_format(newPrice, 2, ',', '.') + ' &euro;*';
				$$('priceHidden').value = newPrice;
			}
		}
	},
	
	/**
	 * truncate
	 *
	 * Truncates a string and returns the string
	 *
	 * @param str - string to truncate
	 * @param length - length of visible string part
	 * @param trailing - trailing symbol
	 */
	truncate: function(str, length, trailing) {
		if(!str || !length) { return false; }

		if(!trailing) {
			trailing = '...';
		}

		if(str.length > length) {

			length = length - trailing.length;
			str = str.substring(0, length) + trailing;
		}

		return str;
	},

    /**
     * Formats a number to the european number standard
     *
     * @param number
     * @param decimals
     * @param dec_point
     * @param thousands_sep
     */
	number_format: function (number, decimals, dec_point, thousands_sep) {
        var n = number,
            prec = decimals;
        var toFixedFix = function (n, prec) {
            var k = Math.pow(10, prec);
            return (Math.round(n * k) / k).toString();
        };
        n = !isFinite(+n) ? 0 : +n;prec = !isFinite(+prec) ? 0 : Math.abs(prec);
        var sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep;
        var dec = (typeof dec_point === 'undefined') ? '.' : dec_point;
        var s = (prec > 0) ? toFixedFix(n, prec) : toFixedFix(Math.round(n), prec);
        var abs = toFixedFix(Math.abs(n), prec);
        var _, i;
        if (abs >= 1000) {
            _ = abs.split(/\D/);
            i = _[0].length % 3 || 3;
            _[0] = s.slice(0, i + (n < 0)) + _[0].slice(i).replace(/(\d{3})/g, sep + '$1');
            s = _.join(dec);
        } else {
            s = s.replace('.', dec);
        }
        var decPos = s.indexOf(dec);
        if (prec >= 1 && decPos !== -1 && (s.length - decPos - 1) < prec) {
            s += new Array(prec - (s.length - decPos - 1)).join(0) + '0';
        } else if (prec >= 1 && decPos === -1) {
            s += dec + new Array(prec).join(0) + '0';
        }
        return s;
    },

    /**
     * Compares two given timestamps and returns their difference
     *
     * @param d1
     * @param d2
     */
	timestampDiff: function (d1, d2) {
        if (d1 < d2) {
            return false;
        }
        var d = Math.floor((d1 - d2) / (24 * 60 * 60 * 1000));
        var h = Math.floor(((d1 - d2) - (d * 24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        var m = Math.floor(((d1 - d2) - (d * 24 * 60 * 60 * 1000) - (h * 60 * 60 * 1000)) / (60 * 1000));
        var s = Math.floor(((d1 - d2) - (d * 24 * 60 * 60 * 1000) - (h * 60 * 60 * 1000) - (m * 60 * 1000)) / 1000);
        return {
            'd': d,
            'h': h,
            'm': m,
            's': s
        };
    },

	/**
	 * Search a string in an array
	 *
	 * @param needle
	 * @param haystack
	 */
	inArray: function(needle, haystack) {
		var length = haystack.length;
		for(var i = 0; i < length; i++) {
			if(haystack[i] == needle) return true;
		}
		return false;
	}

};