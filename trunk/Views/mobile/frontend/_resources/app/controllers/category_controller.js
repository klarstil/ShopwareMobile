/**
 * ----------------------------------------------------------------------
 * category_controller.js
 *
 * Steuert die Ausgabe der Kategorien
 * ----------------------------------------------------------------------
 */
Ext.regController('category', {
    last: null,

    show: function(options) {
        var store = options.store,
            view  = Ext.getCmp('listing');

        if(!Ext.isDefined(options.idx)) {
            var idx = this.last;
        } else {
            var idx = options.idx;
            this.last = options.idx;
        }

		var rec = store.getAt(idx);
	    if(!view) {
            view = new App.views.Shop.listing;
            Ext.getCmp('shop').add(view);
        }
	    if(!Ext.isEmpty(rec.data.sub)) {
		    /* Load tree store with  */
			App.stores.CategoriesTree.proxy.extraParams = { categoryID: rec.data.id };
			App.stores.CategoriesTree.load();
	        App.stores.CategoriesTree.proxy.extraParams = {};

		    view.subList.toolbar.setTitle(rec.data.name);
		    view.add(view.subList);
		    view.subList.toolbar.add(view.backBtn);
		} else {
			view.add(view.list);
		    view.addDocked(view.toolbar);
		    view.doLayout();
	    }

        Ext.getCmp('shop').setActiveItem(view, {
            type: options.type, direction: options.direction
        });

	    App.stores.Listing.load({ params: { categoryId: rec.data.id } });
    },
	showArticleListing: function(options) {
		var store = options.store,
			idx   = options.idx,
			view  = Ext.getCmp('listing'),
			list  = Ext.getCmp('subListing'),
			rec;

		rec = store.getAt(idx);
	}
});