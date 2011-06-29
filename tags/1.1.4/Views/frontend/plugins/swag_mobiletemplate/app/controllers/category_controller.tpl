<script type="text/javascript">
/**
 * @file category_controller.js
 * @link http://www.shopware.de
 * @author S.Pohl <stp@shopware.de>
 * @date 11-05-11
 */
Ext.regController('category', {
	view: Ext.getCmp('shop'),
	store:    App.stores.Categories,
	lastRecord: null,

    show: function(options) {
	    var record;

	    if(!this.view) {
		    this.view = Ext.getCmp('shop');
	    }

	    if(!Ext.isDefined(options.index) && !this.lastRecord) {
		    this.view.setActiveItem(Ext.getCmp('home'), {
				type: 'slide',
				reverse: true,
				scope: this
			});
		    this.view.toolBar.hide();
		    this.view.doComponentLayout();
		    return;
	    }

	    if(Ext.isDefined(options.store)) {
		    record = options.store.getAt(options.index);
		} else {
		    record = this.store.getAt(options.index);
	    }

		if(!Ext.isDefined(options.index) && this.lastRecord) {
			record = this.lastRecord;
		}

	    /* If no index and no last record, go back to home view */
	    if(Ext.isEmpty(record)) {
		    Ext.dispatch({
			    controller: 'main',
			    action: 'show',
			    type: 'slide',
			    direction: 'right',
			    historyUrl: 'home'
		    });
	    } else {
		    this.lastRecord = record;
	    }

	    if(Ext.isEmpty(record.data.sub)) {
		    Ext.dispatch({
			    controller:   'category',
			    action:       'showArticleListing',
			    categoryID:   record.data.id,
			    categoryName: (!Ext.isEmpty(record.data.name)) ? record.data.name : record.data.text,
			    type: (Ext.isDefined(options.type)) ? options.type : 'slide',
			    direction: (Ext.isDefined(options.direction)) ? options.direction : 'left',
			    panel: options.panel
		    });
	    } else {
		    Ext.dispatch({
			    controller:   'category',
			    action:       'showSubCategories',
			    categoryID:   Ext.isDefined(options.index) ? record.data.id : record.data.parentId,
			    categoryName: record.data.name,
			    type: (Ext.isDefined(options.type)) ? options.type : 'slide',
			    direction: (Ext.isDefined(options.direction)) ? options.direction : 'left'
		    });
	    }
    },

	showSubCategories: function(options) {
		var store, type, direction, list = Ext.getCmp('subListing');

		if(!options.store) {
			console.warn('options.store not defined, use default store');
			store = App.stores.CategoriesTree;
		} else {
			store = options.store;
		}

		if(!Ext.isDefined(options.categoryID)) {
			throw new Error("No categoryID set in dispatch options");
		}

		if(!list) {
			list = new App.views.Shop.subListing();
			this.view.add(list);
		}

		if(Ext.isDefined(options.categoryName)) {
			//this.view.toolBar.setTitle(options.categoryName);
			list.title = options.categoryName;
			list.toolbar.setTitle(options.categoryName);
		}

		type = (Ext.isDefined(options.type)) ? options.type : 'slide';
		direction = (Ext.isDefined(options.direction)) ? options.direction : 'left';

		this.view.setActiveItem(list, {
			type: type, direction: direction
		});

		/* TODO - Needs a better workaround */
		list.setLoading(true);
		store.proxy.extraParams = {};
		window.setTimeout(function () {
			store.load({
				params: { categoryID: options.categoryID },
				callback: function() { list.setLoading(false) }
			});
		}, 150);
	},

	showArticleListing: function(options) {
		var store, list = Ext.getCmp('artListing'), type, direction;
		if(!options.store) {
			console.warn('options.store not defined, use default store');
			store = App.stores.Listing;
		} else {
			store = options.store;
		}

		if(!Ext.isDefined(options.categoryID)) {
			throw new Error("No categoryID set in dispatch options");
		}

		if(!list) {
			list = new App.views.Shop.artListing;
			this.view.add(list);
		}

		if(Ext.isDefined(options.categoryName)) {
			this.view.toolBar.setTitle(App.Helpers.truncate(options.categoryName, 10));
			this.view.title = options.categoryName;
			this.view.backBtn.show();
			this.view.toolBar.doLayout();
		}

		type = (Ext.isDefined(options.type)) ? options.type : 'slide';
		direction = (Ext.isDefined(options.direction)) ? options.direction : 'left';

		this.view.setActiveItem(list, {
			type: type, direction: direction
		});
		store.proxy.extraParams = {};
		store.proxy.extraParams = { categoryID: options.categoryID };
		store.load({
			params: { categoryID: options.categoryID},
			callback: function() {
				store.fireEvent('checkBanner');
			}
		});

		this.view.backBtn.show();
	    this.view.toolBar.show();
	    this.view.doComponentLayout();
	}
});
</script>