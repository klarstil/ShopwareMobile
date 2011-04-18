Ext.regController('categories', {
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

/* Detail controller */
Ext.regController('detail', {
    last: null,
    detail: Ext.getCmp('detail'),   
    show: function(options) {
        var store, rec, pictures, view, me = this;
            
        if(!view) {
            view = new App.views.Shop.detail;
            me.detail = view;
            Ext.getCmp('shop').add(view);
        }
        
        store = options.store;
        rec = store.getAt(options.idx);
        this.last = rec;

	    App.stores.Detail.load({
            params: {
                articleId: rec.data.articleID
            }
        });
        
        Ext.dispatch({
            controller: 'detail',
            action: 'showInfo'
        });

        Ext.getCmp('shop').setActiveItem(view, 'slide');
    },
    
    showInfo: function() {
        var view;
        
        if(!view) {
            view = new App.views.Shop.info;
            Ext.getCmp('detail').add(view);
	        Ext.getCmp('detail').doLayout();
        }
    },
    
    showComments: function() {
        var view;
        
        if(!view) {
            view = new App.views.Shop.comments;
            Ext.getCmp('detail').add(view);
        }
    },

    showPictures: function() {
        var view, me = this;

        App.stores.Picture.load({
            params: {
                articleId: me.last.data.articleID
            },
            callback: function() {
                if(!view) {
                    view = new App.views.Shop.pictures;
                    Ext.getCmp('detail').add(view);
                }
                Ext.getCmp('detail').setActiveItem(view, 'fade');
            }
        })
    }
});