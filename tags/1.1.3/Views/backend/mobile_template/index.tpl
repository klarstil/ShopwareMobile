{extends file="backend/index/parent.tpl"}

{block name="backend_index_body_inline"}
<script type="text/javascript">
Ext.ns('Shopware.SwagMobileTemplate');

(function(){
	View = Ext.extend(Ext.Viewport, {
	    layout: 'border',
	    initComponent: function() {

			this.design = new Ext.form.Fieldset({
				title: 'Design',
			});

			this.form = new Ext.FormPanel({
				frame: true,
				url: '',
			});


	    	View.superclass.initComponent.call(this); 	
	    }
	});
	Shopware.SwagMobileTemplate.View = View;
})();
Ext.onReady(function(){
	OurView = new Shopware.SwagMobileTemplate.View;
});
</script>
{/block}
