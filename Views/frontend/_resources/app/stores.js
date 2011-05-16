/**
 * ----------------------------------------------------------------------
 * stores.js
 *
 * Provides the stores which are used in the application views
 * ----------------------------------------------------------------------
 */

/**
 * Register stores in the global namespace
 * @class
 */
App.stores = {};

/** Store for the main categories */
App.stores.Categories = new Ext.data.Store({
	model: 'MainCategories',
	autoLoad: true
});

/** Store the subcategories */
App.stores.CategoriesTree = new Ext.data.TreeStore({
	model: 'Categories',
	filterOnLoad: false,
	sortOnLoad: false,
	clearOnLoad: true
});

/** Store for the promotions carousel */
App.stores.Promotions = new Ext.data.Store({
	model: 'Promotion',
	autoLoad: true
});

/** Store for the article listing */
App.stores.Listing = new Ext.data.Store({
	model: 'Articles',
	remoteSort: true,
	remoteFilter: true,
	pageSize: 12
});

/** Store for the article details view */
App.stores.Detail = new Ext.data.Store({
	model: 'Detail'
});

/** Store for the article pictures */
App.stores.Picture = new Ext.data.Store({
	model: 'Picture'
});

/** Store for the search function */
App.stores.Search = new Ext.data.Store({
	model: 'Search',
	pageSize: 12
});

/** Store for the static pages */
App.stores.Info = new Ext.data.Store({
	model: 'Static',
	autoLoad: true,
	sorter: 'name',

	getGroupString: function(record) {
		return record.get('groupName');
	}
});

/** Store for the user data */
App.stores.UserData = new Ext.data.Store({
	model: 'UserData',
	autoLoad: true
});

/**
 * Store for the applications cart
 *
 * @extends Ext.util.Observable
 * @class
 */
App.CartClass = Ext.extend(Ext.util.Observable,
    /** @lends App.CartClass# */
    {
        /**
         * Articles count in the cart
         * @private
         */
        articleCount: 0,
        /**
         * Article amount in the cart
         * @private
         */
        amount: 0.0,

        /**
         * Constructor for the Cart class
         */
        constructor: function() {

            Ext.apply(this, {
                items: new Ext.util.MixedCollection
            });

            this.addEvents('datachanged');
            App.CartClass.superclass.constructor.call(this);
        },

        /**
         * Loads the whole cart from the server and adds it to the MixedCollection
         */
        load: function() {
            var me = this, items = me.items;
            if(me.items.length) {
                me.items.clear();
            }

            App.Helpers.postRequest(App.RequestURL.getBasket, {}, function(data) {
                me.loopArticles(data.content);
            });
        },

        /**
         * Adds a given article into the MixedCollection
         * @param options
         */
        add: function(options) {
            var me = this;
            if(Ext.isDefined(options.sAdd)) {
                options.sOrdernumber = options.sAdd;
            }
            App.Helpers.postRequest(App.RequestURL.addArticle, {
                sAdd: options.sOrdernumber,
                sQuantity: options.sQuantity
            }, function(data) {
                var item = me.items.findBy(function(data) {
                    if(data.ordernumber ==  options.sOrdernumber) {
                        return true;
                    }
                }, me);

                // Fire event to refresh card list
                App.Helpers.postRequest(App.RequestURL.getBasket, {}, function(data) {
                    me.loopArticles(data.content);
                });
            });
            this.fireEvent('datachanged', this);
        },

        /**
         * Adds a bundle article to the MixedCollection
         * @param ordernumber
         * @param id
         */
        addBundle: function(ordernumber, id) {
            var me = this;
            App.Helpers.postRequest(App.RequestURL.addBundle, {
                ordernumber: ordernumber,
                id: id
            }, function(data) {
                if(data === false) {
                    Ext.Msg.alert('Fehler', 'Das ausgew&auml;hlte Bundle konnte nicht hinzugef&uuml;gt werden. Bitte probieren Sie es sp&auml;ter noch einmal.');
                } else {
                    me.load();
                }
            })
        },

        /**
         * Removes an article from the MixedCollection
         * @param idx
         * @param ordernumber
         */
        remove: function(idx, ordernumber) {
            var me = this, items = me.items;
            App.Helpers.postRequest(App.RequestURL.removeArticle, {
                articleId: idx,
                orderNumber: ordernumber
            }, function(data) {
                console.log(data);
                items.removeByKey(idx);
                me.articleCount--;
                me.refreshAmount();
                me.changeBadgeText(me.articleCount);
                me.fireEvent('datachanged', me);
            });
        },

        /**
         * Removes all article from the MixedCollection
         */
        removeAll: function() {
            var me = this, items = me.items;
            App.Helpers.postRequest(App.RequestURL.deleteBasket, {}, function(data) {
                if(data.success === true) {

                    // reset cart state
                    items.clear();

                    me.amount = 0;
                    me.articleCount = 0;

	                me.changeBadgeText('');

                    me.fireEvent('datachanged', me);
                } else {
                    Ext.Msg.alert('Fehler', 'Es ist ein Fehler bei einen AJAX-Request aufgetreten, bitte versuchen Sie es sp&auml;er erneut.');
                }
            });

        },

        /**
         * Loops through the given article data and adds the
         * articles to the MixedCollection
         *
         * @param data
         */
        loopArticles: function(data) {
            var me = this, items = me.items;

            /* Clear cart state */
            if(me.items.length) { me.items.clear(); }
            me.articleCount = 0;
            me.amount = 0;

            /* Loop through the articles */
            Ext.each(data, function(rec) {
                me.amount += parseFloat(rec.priceNumeric) * ~~rec.quantity;
                me.articleCount++;
                items.add(rec);
            });
            this.fireEvent('datachanged', this);
            this.changeBadgeText(me.articleCount);
            return true;
        },

        /**
         * Returns the count of articles in the cart
         *
         * @returns article count in cart
         */
        getCount: function() {
            return this.articleCount;
        },

        /**
         * Refreshes the cart amount
         */
        refreshAmount: function() {
            var me = this, el;
            App.Helpers.postRequest(App.RequestURL.basketAmount, {}, function(data) {
                me.amount = data.totalAmount;
                el = Ext.get('amount-display');

                if(el) {
                    el.setHTML(((Math.round(me.amount * 100) / 100) + '&nbsp;&euro;*'));
                }
            });
        },

        /**
         * Changes the cart badge
         *
         * @param val - badge text
         */
        changeBadgeText: function(val) {
            var cartBtn = Ext.getCmp('viewport').getCartButton();
            cartBtn.setBadge(val);
            return true;
        },

        /**
         * Adds debug articles to the cart
         *
         * @deprecated Will be removed from the retail release
         * @private
         */
        _debugAddExampleArticles: function() {
            var me = this;
            var articles = [
                'SW10009'/*,
                'SW10010',
                'SW10011',
                'SW10012',
                'SW10014',
                'SW10015',
                'SW10016',
                'SW10017',
                'SW10018',
                'SW10019',
                'SW10020',
                'SW10021',
                'SW10022',
                'SW10023',
                'SW10024',
                'SW10025',
                'SW10026',
                'SW10027',
                'SW10028',
                'SW10029',
                'SW10030',
                'SW10031',
                'SW10032',
                'SW10034',
                'SW10035',
                'SW10036',
                'SW10037',
                'SW10038',
                'SW10039',
                'SW10040',
                'SW10041',
                'SW10042',
                'SW10043',
                'SW10044',
                'SW10045',
                'SW10046',
                'SW10047',
                'SW10048' */
            ];

            Ext.each(articles, function(article) {
                me.add( { sOrdernumber: article } );
            });
        }
    }
);

/** Store for the applications cart */
App.stores.Cart = new App.CartClass();