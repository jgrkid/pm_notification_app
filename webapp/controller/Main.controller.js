sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    function (Controller) {
        "use strict";

        return Controller.extend("pmnotificationapp.controller.Main", {
            onInit: function () {

                this.oOwnerComponent = this.getOwnerComponent();
                this.oRouter = this.oOwnerComponent.getRouter();
                this.oRouter.getRoute("RouteMain").attachPatternMatched(this.onRouteMatched, this);
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
            }
        });
    });
