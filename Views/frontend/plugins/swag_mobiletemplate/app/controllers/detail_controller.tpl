<script type="text/javascript">
/**
 * @file detail_controller.js
 * @link http://www.shopware.de
 * @author S.Pohl <stp@shopware.de>
 * @date 11-05-11
 */
Ext.regController('detail', {
    last:       null,
	shopView:   Ext.getCmp('shop'),
	view:       Ext.getCmp('detail'),
	lastRecord: null,
	store:      App.stores.Detail,

	/**
	 * Create the main view on runtime and handles the detail store
	 *
	 * @param options
	 */
    show: function(options) {
		var store = this.store,
			view = Ext.getCmp('detail');

		this.view = view;

		if(!this.shopView) {
			this.shopView = Ext.getCmp('shop');
		}

        if(!this.view || !this.view.isComponent) {
            this.view = new App.views.Shop.detail;
        }

		if(!Ext.isDefined(options.articleID)) {
			throw new Error("No articleID set in dispatch options");
		}

	    store.load({
            params: { articleId: options.articleID},
		    callback: function() {
			    this.lastRecord = store.getAt(0);
			    store.fireEvent('storeLoaded');
			    Ext.getCmp('teaser').doLayout();
		    }
        });

        Ext.dispatch({
            controller: 'detail',
            action: 'showInfo'
        });

		if(Ext.isDefined(options.parent)) {
			Ext.getCmp('viewport').setActiveItem(0, { type: 'slide', reverse: true });
			this.shopView.toolBar.show();
			this.shopView.backBtn.show();
			this.shopView.doComponentLayout();
		}

		if(!this.shopView.toolBar.isVisible()) {
			this.shopView.backBtn.show();
			this.shopView.toolBar.show();
			this.shopView.doComponentLayout();
		}

        this.shopView.setActiveItem(this.view, 'slide');
    },

	/**
	 * Creates the info view on runtime
	 *
	 * @param options
	 */
    showInfo: function(options) {
        var view = Ext.getCmp('teaser');

        if(!view) {
            view = new App.views.Shop.info;
            this.view.add(view);
        }

		if(options.refresh) {
			this.store.fireEvent('storeLoaded');
		}

		this.view.doLayout();
    },

	/**
	 * Creates the comment main view on runtime
	 */
    showComments: function() {
        var view = Ext.getCmp('votes');

        if(!view) {
            view = new App.views.Shop.comments;
            this.view.add(view);
        }
    },

	/**
	 * showPictures
	 *
	 * Creates the picture view on runtime and handles the picture store
	 */
    showPictures: function() {
        var view = Ext.getCmp('pictures'), me = this;

		this.lastRecord = this.store.getAt(0);

        App.stores.Picture.load({
            params: {
                articleId: me.lastRecord.data.articleID
            },
            callback: function() {
                if(!view) {
                    view = new App.views.Shop.pictures;
                    me.view.add(view);
                }
                me.view.setActiveItem(view, 'fade');
            }
        })
    },

	/**
	 * Handles the whole navigation buttons in the detail section.
	 * They handle the behavior when a user clicks on one of them.
	 *
	 * @param options
	 * @return bool
	 */
	handleNavigationButton: function(options) {

		if(!Ext.isDefined(options.button)) {
			throw new Error("This event listener needs a button to interact with it");
		}

		var active = Ext.getCmp('detail').getActiveItem(),
			btn = options.button,
			pressed = options.pressed;
		
		if (pressed === true) {
			if (btn.text === '{s name="MobileDetailSplitButtonDetail"}Detail{/s}' && active.id !== 'teaser') {
				Ext.dispatch({
					controller: 'detail',
					action: 'showInfo',
					refresh: true
				});

				Ext.getCmp('detail').setActiveItem('teaser', 'fade');
			}
			if (btn.text === '{s name="MobileDetailSplitButtonComments"}Kommentare{/s}') {
				Ext.dispatch({
					controller: 'detail',
					action: 'showComments'
				});
				Ext.getCmp('detail').setActiveItem('votes', 'fade');
			}
			if (btn.text === '{s name="MobileDetailSplitButtonPictures"}Bilder{/s}') {
				Ext.dispatch({
					controller: 'detail',
					action: 'showPictures'
				})
			}
		}
		return true;
	},

	/**
	 * Event listener which handles the configurator option
	 * changes
	 *
	 * @param options
	 * @return bool
	 */
	changeConfigurator: function(options) {
		var store  = this.store,
			item   = store.getAt(0),
			configurator = item.data.sConfigurator,
			groupId, active, values = options.view.formPnl.getValues(),
			me = options.view;

		me.setLoading(true);
		values.articleId = item.data.articleID;
		App.Helpers.postRequest(App.RequestURL.getDetail, options.values, function(response) {
			if(!Ext.isEmpty(response.sArticle)) {

				var article = response.sArticle[0];

				/** Update ordnumber */
				me.hiddenOrdernumber.setValue(article.ordernumber);
				document.getElementById('ordernumberDetail').innerHTML = article.ordernumber;

				/** Update price */
				document.getElementById('priceDetail').innerHTML = article.price;
				document.getElementById('priceNumericDetail').setAttribute('value', article.priceNumeric);

				me.spinner.setValue(1);
				me.setLoading(false);
			}
		});

		return true;
	},

	/**
	 * Event listener which handles the variant option
	 * changes
	 *
	 * @param options
	 * @return bool
	 */
	changeVariants: function(options) {
		var store = App.stores.Detail, item = store.getAt(0), me = options.view;
		item = item.data;

		for(var idx in item.sVariants) {
			var variant = item.sVariants[idx];

			if(variant.ordernumber == value) {

				/** Update ordernumber */
				document.getElementById('ordernumberDetail').innerHTML = variant.ordernumber;
				me.hiddenOrdernumber.setValue(variant.ordernumber);

				/** Update price */
				variant.priceNumeric = variant.price.replace(',', '.');
				variant.priceNumeric = parseFloat(variant.priceNumeric);
				document.getElementById('priceDetail').innerHTML = variant.price;
				document.getElementById('priceNumericDetail').setAttribute('value', variant.priceNumeric);
				me.spinner.setValue(1);
			}
		}
		return true;
	},

	/**
	 * Saves a user comment to the server side
	 *
	 * TODO: Validate the user input before sending it to the server
	 *
	 * @return bool
	 */
	saveComment: function() {
		var me = Ext.getCmp('commentForm'),
			store = App.stores.Detail,
			articleID = store.data.items[0].data.articleID,
			values = me.getValues(true);

		values.articleID = articleID;

		App.Helpers.postRequest(App.RequestURL.addComment, values, function() {
			Ext.Msg.alert('{s name="MobileDetailCommentSuccess"}Erfolg{/s}', '{s name="MobileDetailCommentSuccessMessage"}Ihr Kommentar wurde erfolgreich hinzugef&uuml;gt{/s}');
			store.load({
				params: {
					articleID: articleID
				}
			});
		});

		return true;
	},

	storeLoaded: function(options) {
		var me = options.view, store = App.stores.Detail, item = store.getAt(0), data = item.data.liveshoppingData;
		me._item = item;

		/* Create hidden input field */
		me.buildOrdernumber(item);

		/* If needed, add bundle view */
		if(!Ext.isEmpty(item.data.sBundles)) {
			me.add(me.bundle);
		}

		/* If needed, add variant select box */
		if(!Ext.isEmpty(item.data.sVariants)) {
			me.buildVariantField(item);
		}

		/* If needed, add configurator fieldset(s) */
		if(!Ext.isEmpty(item.data.sConfigurator) && item.data.sConfigurator != 0) {
			me.buildConfigurator(item);
		}

		/* If needed, add live-shopping functionality */
		if(!Ext.isEmpty(item.data.liveshoppingData)) {
			App.Helpers.server.init(timeNow);
			interval = App.Helpers.liveshopping.init(data);
		}
		me.add(me.desc);

		/** Hide buy button and formPnl if its an blog article */
		if(me._item.data.mode == '1') {
			me.buyBtn.hide();
			me.formPnl.hide();
		}

		/** Setup article amount spinner */
		if(~~item.get('laststock')) {
			me.spinner.maxValue = ~~item.get('instock');
		} else if(~~item.get('maxpurchase')) {
			me.spinner.maxValue = ~~item.get('maxpurchase');
		}
		/** Set min purchase amount */
		if(~~item.get('minpurchase') && ~~item.get('minpurchase')) {
			me.spinner.minValue = ~~item.get('minpurchase');
			me.spinner.setValue(~~item.get('minpurchase'));
		}

		/** Purchase steps */
		if(~~item.get('purchasesteps')) {
			me.spinner.incrementValue = ~~item.get('purchasesteps');
		}
		if(me.spinner.rendered) {
			me.spinner.doComponentLayout();
		}

		/** Change template for blog articles */
		if(~~item.get('mode') == 1) {
			me.info.tpl = App.views.Shop.blogTpl;
			me.info.refresh();
			me.buyBtn.destroy();
			me.desc.style = 'display:inline-block;';
			me.desc.refresh();
		}

		me.doLayout();
	}
});
</script>