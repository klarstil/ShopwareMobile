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
        var store, rec, view;
        store = App.stores.Categories;
        view  = Ext.getCmp('listing');

        if(!Ext.isDefined(options.idx)) {
            var idx = this.last;
        } else {
            var idx = options.idx;
            this.last = options.idx;
        }

        rec = store.getAt(idx);

        if(!view) {
            view = new App.views.Shop.listing;
            Ext.getCmp('shop').add(view);
        }

        Ext.getCmp('shop').setActiveItem(view, {
            type: options.type, direction: options.direction
        });

        App.stores.Listing.load({
            params: {
                categoryId: rec.data.id
            }
        });
    }
});