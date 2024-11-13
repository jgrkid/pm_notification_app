sap.ui.define([
	"sap/m/library",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Item",
	"sap/ui/model/json/JSONModel",
	"sap/m/upload/Uploader"
],
    function (MobileLibrary, Controller, Item, JSONModel, Uploader) {
        "use strict";
        
        return Controller.extend("pmnotificationapp.controller.Main", {
            onInit: function () {

                // Routing
                this.oOwnerComponent = this.getOwnerComponent();
                this.oRouter = this.oOwnerComponent.getRouter();
                this.oRouter.getRoute("RouteMain").attachPatternMatched(this.onRouteMatched, this);


                // //Init Uploader
                 var oUploadSet = this.byId("UploadSet")

			    // Modify "add file" button
                oUploadSet.getDefaultFileUploader().setButtonOnly(false)
			    oUploadSet.getDefaultFileUploader().setTooltip("")
			    oUploadSet.getDefaultFileUploader().setIconOnly(true)
			    oUploadSet.getDefaultFileUploader().setIcon("sap-icon://attachment")

            },


            
            onRouteMatched: function (oEvent) {
                var oModel = this.getView().getModel()
                var that = this
                oModel.metadataLoaded(true).then(
                    function () {
                        var oContext = oModel.createEntry("/ZD4P_C_PM_NOTIF", {
                            properties: {}
                        });
                        
                        that.getView().setBindingContext(oContext);
                    })
            },

            // onUploadSelectedButton: function () {
            //     var oUploadSet = this.byId("UploadSet");

            //     oUploadSet.getItems().forEach(function (oItem) {
            //         if (oItem.getListItem().getSelected()) {
            //             oUploadSet.uploadItem(oItem);
            //         }
            //     });
            // },
            // onDownloadSelectedButton: function () {
            //     var oUploadSet = this.byId("UploadSet");
    
            //     oUploadSet.getItems().forEach(function (oItem) {
            //         if (oItem.getListItem().getSelected()) {
            //             oItem.download(true);
            //         }
            //     });
            // },
            // onUploadCompleted: function(oEvent) {
            //     this.oItemToUpdate = null;
            // }
        });
    });
