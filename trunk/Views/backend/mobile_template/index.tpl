{extends file="backend/index/parent.tpl"}

{block name="backend_index_body_inline"}
<link rel="stylesheet" media="screen, projection" href="{link file='backend/mobile_template/uploader/fileuploadfield.css'}" />
{literal}
<style type="text/css">
*:focus { outline: none }
.pnl { font: 11px/normal Verdana, sans-serif; }
.error, .notice, .success {padding:.8em;margin-bottom:1em;border:2px solid #ddd;}
.error, .instyle_error, input.instyle_error {background:#FBE3E4;color:#8a1f11;border-color:#FBC2C4;}
.notice {background:#FFF6BF;color:#514721;border-color:#FFD324;}
.success, .instyle_success {background:#E6EFC2;color:#264409;border-color:#C6D880;}
.error a {color:#8a1f11;}
.notice a {color:#514721;}
.success a {color:#264409;}
strong { font-weight: 700 }
.swag_notice .x-panel-body-noheader { border: 0 none }
#iphonePreview .x-panel-body img {
	width: 198px;
	height: 372px;
	margin: 0 auto;
	display: block;
}
p.desc { font: 12px tahoma,arial,helvetica,sans-serif; margin: 0 0 1em; }
</style>
{/literal}
<script type="text/javascript" src="{link file='backend/mobile_template/uploader/FileUploadField.js'}"></script>
<script type="text/javascript">
Ext.ns('Shopware.SwagMobileTemplate');

(function() {
	Ext.QuickTips.init();
	View = Ext.extend(Ext.Viewport, {
	    layout: 'border',
	    initComponent: function() {
			var me = this;
			
			/** General settings form panel */
			this.generellPnl = new Ext.FormPanel({
				title: 'Allgemeine Anpassungen',
				padding: 15,
				autoScroll: true,
				items: [{
					xtype: 'fieldset',
					anchor: '0',
					title: 'Allgemeine Anpassungen',
					labelWidth: 250,
					items: [{
						// Supported devices
						xtype: 'checkboxgroup',
						fieldLabel: 'Unterst&uuml;tzte Ger&auml;te',
						name: 'supportedDevices',
						columns: 2,
						items: [
							{ boxLabel: 'iPhone', name: 'iphone', checked: true},
							{ boxLabel: 'iPod', name: 'ipod', checked: true },
							{ boxLabel: 'iPad (experimental)', name: 'ipad' },
							{ boxLabel: 'Android', name: 'android', checked: true },
							{ boxLabel: 'BlackBerry (experimental)', name: 'blackberry' }
						]
					}, {
						// Shopsite ID AGB
						xtype: 'textfield',
						fieldLabel: 'Shopseiten-ID zu den AGB',
						name: 'agbInfoID',
						value: '{$agbInfoID}'
					}, {
						// Shopsite ID Right of Cancelation
						xtype: 'textfield',
						fieldLabel: 'Shopseiten-ID zum Wiederrufsrecht',
						name: 'cancelRightID',
						value: '{$cancelRightID}'
					}, {
						// Shopsite group name
						xtype: 'textfield',
						fieldLabel: 'Shopseiten-Gruppe',
						name: 'infoGroupName',
						value: '{$infoGroupName}'
					}, {
						// Show Link to normal version of the shop
						xtype: 'checkbox',
						fieldLabel: 'Link zur normalen Ansicht',
						name: 'showNormalVersionLink',
						checked: {if $showNormalVersionLink}true{else}false{/if}
					}],
					buttons: [{
			        	text: 'Allgemeine Anpassungen speichern',
			        	name: 'saveGenerell',
			        	scope: this,
			        	handler: function() {
			        		this.generellPnl.getForm().submit({
			        			url: '{url controller="MobileTemplate" action="processGenerellForm"}',
			        			waitMsg: 'Sende Daten...',
			        			success: function(form, response) {
			        				Ext.Msg.show({
			        					title: 'Speichern erfolgreich',
			        					msg: response.result.message,
			        					buttons: Ext.Msg.OK,
			        					icon: Ext.MessageBox.INFO
			        				});
			        			},
			        			failure: function(form, response) {
			        				Ext.Msg.show({
			        					title: 'Es ist ein Fehler aufgetreten',
			        					msg: response.result.message,
			        					buttons: Ext.Msg.OK,
			        					icon: Ext.MessageBox.ERROR
			        				});
			        			}
			        		})
			        	}
			        }]
				}]
			});
			
			/** Subshop settings form panel */
			this.shopPnl = new Ext.FormPanel({
				title: 'Subshop-Anpassungen',
				padding: 15,
				autoScroll: true,
				items: [{
					xtype: 'fieldset',
					title: 'Subshop-Anpassungen',
					labelWidth: 250,
					items: [{
						// Use Shopware Mobile as a subshop
						xtype: 'checkbox',
						fieldLabel: 'Shopware Mobile als Subshop verwenden',
						name: 'useAsSubshop',
						checked: {if $useAsSubshop}true{else}false{/if}
					}, {
						// Subshop ID
						xtype: 'textfield',
						fieldLabel: 'Subshop-ID',
						name: 'subshopID',
						value: '{$subshopID}'
					}],
					buttons: [{
			        	text: 'Subshop Anpassungen speichern',
			        	scope: this,
			        	handler: function() {
			        		this.shopPnl.getForm().submit({
			        			url: '{url controller="MobileTemplate" action="processSubshopForm"}',
			        			waitMsg: 'Sende Daten...',
			        			success: function(form, response) {
			        				Ext.Msg.show({
			        					title: 'Speichern erfolgreich',
			        					msg: response.result.message,
			        					buttons: Ext.Msg.OK,
			        					icon: Ext.MessageBox.INFO
			        				});
			        			},
			        			failure: function(form, response) {
			        				Ext.Msg.show({
			        					title: 'Es ist ein Fehler aufgetreten',
			        					msg: response.result.message,
			        					buttons: Ext.Msg.OK,
			        					icon: Ext.MessageBox.ERROR
			        				});
			        			}
			        		})
			        	}
			        }]
				}]
			});
			
			/** Design related settings form panel */
			this.designFormPnl = new Ext.FormPanel({
				bodyBorder: false,
				id: 'designForm',
				labelWidth: 250,
				width: '80%',
				fileUpload: true,
				items: [{
					xtype: 'fieldset',
					title: 'Design-Anpassungen',
					items: [{
						// Sencha.io "Src"
						xtype: 'checkbox',
						fieldLabel: 'Sencha.io "Src" verwenden',
						name: 'useSenchaIO',
						checked: {if $useSenchaIO}true{else}false{/if}
					}, {
						// Voucher on confirm page
						xtype: 'checkbox',
						fieldLabel: 'Gutscheineingabe auf der Bestellbest&auml;tigungsseite anzeigen',
						name: 'useVoucher',
						checked: {if $useVoucher}true{else}false{/if}
					}, {
						// Newsletter signup on confirm page
						xtype: 'checkbox',
						fieldLabel: 'Newsletter-Anmeldung auf der Bestellbest&auml;tigungsseite anzeigen',
						name: 'useNewsletter',
						checked: {if $useNewsletter}true{else}false{/if}
					}, {
						// Commentfield on confirm page
						xtype: 'checkbox',
						fieldLabel: 'Kommentarfeld auf der Bestellbest&auml;tigungsseite anzeigen',
						name: 'useComment',
						checked: {if $useComment}true{else}false{/if}
					}, {
						// Colortemplate
			            fieldLabel: 'Farbtemplate',
			            xtype: 'combo',
			            mode: 'local',
			            triggerAction: 'all',
			            name: 'colorTemplate',
			            selected: '{$colorTemplate}',
			            store: new Ext.data.ArrayStore({
			            	id: 0,
			            	fields: ['id', 'displayText', 'previewImage'],
			            	data: [
			            		['android', 'Android-Style', '{link file="backend/mobile_template/img/colortemplates/android.jpg"}'],
			            		['blue', 'Blau', '{link file="backend/mobile_template/img/colortemplates/blue.jpg"}'],
			            		['brown', 'Braun','{link file="backend/mobile_template/img/colortemplates/brown.jpg"}'],
			            		['default', 'Standard', '{link file="backend/mobile_template/img/colortemplates/default.jpg"}'],
			            		['green', 'Grün', '{link file="backend/mobile_template/img/colortemplates/green.jpg"}'],
			            		['ios', 'iOS-Style', '{link file="backend/mobile_template/img/colortemplates/ios.jpg"}'],
			            		['orange', 'Orange', '{link file="backend/mobile_template/img/colortemplates/orange.jpg"}'],
			            		['pink', 'Pink','{link file="backend/mobile_template/img/colortemplates/pink.jpg"}'],
			            		['red', 'Rot', '{link file="backend/mobile_template/img/colortemplates/red.jpg"}'],
			            		['turquoise', 'Türkis', '{link file="backend/mobile_template/img/colortemplates/turquoise.jpg"}']	
			            	]
			            }),
			            listeners: {
			            	scope: this,
			            	
			            	/** Change preview image on select */
			            	select: function(combo, rec, idx) {
			          
			            		var previewImgPnl = Ext.getCmp('iphonePreview'),
			            			html = '<img src="'+ rec.data.previewImage +'" alt="Farbtemplate '+ rec.data.displayText +'" title="Farbtemplate '+ rec.data.displayText +'" />';
			            		
			            		previewImgPnl.body.update(html);
			            		previewImgPnl.doLayout();
			            		
			            	}
			            },
			            valueField: 'id',
   						displayField: 'displayText'
			        }, {
			        	// Shoplogo - Uploadfield
			        	xtype: 'fileuploadfield',
			        	emptyText: '',
			        	fieldLabel: 'Shoplogo-Upload',
			        	buttonText: 'Logo auswählen',
			        	name: 'logoUpload',
			        	id: 'logoUpload'
			        }, {
			        	// Additional CSS settings
			        	xtype: 'textarea',
			        	fieldLabel: 'Zusätzliche CSS-Eigenschaften',
			        	width: 300,
			        	height: 150,
			        	name: 'additionalCSS',
			        	value: '{$additionalCSS}'
			        }],
			        buttons: [{
			        	text: 'Design-Anpassungen speichern',
			        	scope: this,
			        	handler: function() {
			        		this.designFormPnl.getForm().submit({
			        			url: '{url controller="MobileTemplate" action="processDesignForm"}',
			        			waitMsg: 'Sende Daten...',
			        			success: function(form, response) {
			        				Ext.Msg.show({
			        					title: 'Speichern erfolgreich',
			        					msg: response.result.message,
			        					buttons: Ext.Msg.OK,
			        					icon: Ext.MessageBox.INFO
			        				});
			        			},
			        			failure: function(form, response) {
			        				Ext.Msg.show({
			        					title: 'Es ist ein Fehler aufgetreten',
			        					msg: response.result.message,
			        					buttons: Ext.Msg.OK,
			        					icon: Ext.MessageBox.ERROR
			        				});
			        			}
			        		})
			        	}
			        }]
				}, {
					xtype: 'fieldset',
					labelWidth: 250,
					title: 'iOS spezifische Anpassungen',
					items: [{
						// Notice for iOS devices only
						bodyBorder: false,
						html: '<p class="desc"><strong>Hinweis:</strong> Die hier gesetzten Einstellungen gelten nur für iOS-Geräte wie dem iPhone, iPod touch und den iPad.</p>'
					},{
						// Icon Upload
						xtype: 'fileuploadfield',
						emptyText: '',
						fieldLabel: 'Homescreen-Icon Upload',
						buttonText: 'Icon auswählen',
						name: 'iconUpload',
						id: 'iconUpload',
						tabTip: 'Das Icon muss eine Größe von exakt 57px x 57px aufweisen.'
					}, {
						// Startup screen upload
						xtype: 'fileuploadfield',
						emptyText: '',
						fieldLabel: 'iOS Startupscreen Upload',
						buttonText: 'Screen auswählen',
						name: 'startupUpload',
						id: 'startupUpload'
					}, {
			        	// Statusbar style
			        	xtype: 'combo',
			        	mode: 'local',
			        	triggerAction: 'all',
			        	fieldLabel: 'Statusbar-Style',
			        	store: new Ext.data.ArrayStore({
			        		id: 1,
			        		fields: ['id', 'displayText'],
			        		data: [
			        			["default", "default"],
							  	["black", "black"],
							  	["black-translucent", "black-translucent"]
			        		],
			        	}),
			        	valueField: 'id',
   						displayField: 'displayText',
   						name: 'statusbarStyle',
   						selected: '{$statusbarStyle}'
			        }, {
			        	// Gloss over icon
			        	xtype: 'checkbox',
			        	fieldLabel: 'Glanz über Icon anzeigen',
			        	name: 'glossOnIcon',
			        	checked: {if $glossOnIcon}true{else}false{/if}
			        }],
					buttons: [{
			        	text: 'iOS-Anpassungen speichern',
			        	scope: this,
			        	handler: function() {
			        		this.designFormPnl.getForm().submit({
			        			url: '{url controller="MobileTemplate" action="processDesignForm"}',
			        			waitMsg: 'Sende Daten...',
			        			success: function(form, response) {
			        				Ext.Msg.show({
			        					title: 'Speichern erfolgreich',
			        					msg: response.result.message,
			        					buttons: Ext.Msg.OK,
			        					icon: Ext.MessageBox.INFO
			        				});
			        			},
			        			failure: function(form, response) {
			        				Ext.Msg.show({
			        					title: 'Es ist ein Fehler aufgetreten',
			        					msg: response.result.message,
			        					buttons: Ext.Msg.OK,
			        					icon: Ext.MessageBox.ERROR
			        				});
			        			}
			        		})
			        	}
			        }]
				}]
			});
			
			/** iPhone design preview panel */
			this.designPreviewPnl = new Ext.Panel({
				width: '20%',
				bodyBorder: false,
				id: 'iphonePreview',
				html: '<img src="{link file="backend/mobile_template/img/colortemplates/default.jpg"}" />'
			});
			
			/** Container panel for the both design panels */
			this.designPnl = new Ext.Panel({
				layout: 'hbox',
				padding: 15,
				autoScroll: true,
				bodyBorder: false,
				title: 'Design-Anpassungen',
				items: [this.designFormPnl, this.designPreviewPnl]
			});
			
			/** Main tabpanel navigation */
			this.tabPnl = new Ext.TabPanel({
				activeTab: 2,
				region: 'center',
				autoWidth: false,
				items: [this.generellPnl, this.shopPnl, this.designPnl]
			});
			
			/** Beta notice panel */
			this.betaNoticePnl = new Ext.Panel({
				plain: true,
				padding: 10,
				bodyBorder: false,
				cls: 'swag_notice',
				region: 'north',
				html: '<div class="error pnl"><strong>Hinweis:</strong> Dieses Plugin befindet sich zur Zeit im Beta-Status und ist daher nicht für den produktiven Einsatz geeignet.</div>'
			});
			
			this.items = [this.betaNoticePnl, this.tabPnl];
			
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
