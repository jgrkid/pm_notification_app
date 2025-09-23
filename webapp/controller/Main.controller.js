sap.ui.define([
    "sap/m/library",
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Item",
    "sap/ui/model/json/JSONModel",
    "sap/m/upload/Uploader",
    "sap/ui/core/Element",
    "sap/ui/model/odata/type/DateTimeWithTimezone",
    "sap/m/MessageToast"
],
    function (MobileLibrary, Controller, Item, JSONModel, Uploader, Element, MessageToast) {
        "use strict";

        var prefixId;
        var oScanResultText;
        var oDocuments;
        var base64;
        var doc_name;
        var doc_type;
        var aProcessedFiles = [];
        const aFileParams = [];
        
        return Controller.extend("pmnotificationapp.controller.Main", {
            onInit: function () {

                var that = this;

                // Routing
                this.oOwnerComponent = this.getOwnerComponent();
                this.oRouter = this.oOwnerComponent.getRouter();
                this.oRouter.getRoute("RouteMain").attachPatternMatched(this.onRouteMatched, this);

                // //Init Uploader
                oDocuments = [];

                //Init Barcode Scanner
                prefixId = that.createId();
                if (prefixId) {
                    prefixId = prefixId.split("--")[0] + "--";
                } else {
                    prefixId = "";
                }
                oScanResultText = Element.getElementById(prefixId + '-Main--_IDTechOb');

            },



            onRouteMatched: function (oEvent) {
                var FormModel = this.getView().getModel()
                var that = this

                // Create current date object
                const now = new Date();
                // Get current UTC time in milliseconds
                const utcMs = Date.UTC(
                    now.getUTCFullYear(),
                    now.getUTCMonth(),
                    now.getUTCDate(),
                    now.getUTCHours(),
                    now.getUTCMinutes(),
                    now.getUTCSeconds(),
                    now.getUTCMilliseconds()
                );
                // Calculate timezone offset for Germany (Winter = UTC+1, Summer = UTC+2)
                const tzOffsetMs = now.getTimezoneOffset() * 60 * 1000;
                const deMs = utcMs - tzOffsetMs;

                var todaydate = new Date().toISOString().substring(0, 10)
                var todayms = new Date(todaydate).getTime()
                var today = deMs - todayms

                //wait for metadata
                FormModel.metadataLoaded(true).then(
                    function () {
                          var oContext = FormModel.createEntry("/ZD4P_C_PM_NOTIF", {
                            properties: {
                                DeclarationDate: new Date(),
                                DeclarationTime: { "ms": today, "__edmType": "Edm.Time" },
                                Declarant: sap.ushell.Container.getService("UserInfo").getId()
                            }
                        });

                        that.byId("smartForm").setBindingContext(oContext)
                    })
            },

            onSave: function (oEvent) {
                debugger;
                var oModel = this.getView().getModel();


                for (let index = 0; index < aProcessedFiles.length; index++) {
                    // base64 = aProcessedFiles[index].content;
                    // doc_name = aProcessedFiles[index].name;
                    // doc_type = aProcessedFiles[index].type;

                    oModel.callFunction("/UploadFiles", {
                        method: "POST",
                        urlParameters: {
                            iv_base64: aFileParams[index].base64,
                            iv_doc_name: aFileParams[index].name,
                            iv_doc_type: aFileParams[index].type,
                        },
                        success: function (oData) {
                            debugger;
                            console.log("Archiv-ID:", oData.archive_id); 
                            console.log("Dokumenttyp:", oData.DocType);
                        },
                        error: function (oData) {
                            sap.m.MessageBox.error("Fehler beim Datei-Upload");
                        }
                    });

                }


                //TEST FUNCTION CALL

                //altes coding
                /*create operation*/
                // var oSmartForm = this.byId("smartForm");
                var oModel = this.getView().getModel();
                // var oDataRes = oSmartForm.getBindingContext().getObject();

                // Messages
                debugger;


                var ssuccess = this.getView().getModel("i18n").getResourceBundle().getText("msgboxsuccess");
                var sfailure = this.getView().getModel("i18n").getResourceBundle().getText("msgboxfailure");

                //  Send OData-Request to CREATE-Entity
                // oModel.create("/ZD4P_C_PM_NOTIF", oDataRes, {
                // oModel.create("/ZD4P_C_PM_NOTIF", base64, {
                oModel.create("/ZD4P_C_PM_NOTIF", {
                    success: function () {
                        sap.m.MessageBox.success(ssuccess);
                    },
                    error: function (oError) {
                        sap.m.MessageBox.error(sfailure);
                    }
                });
                //altes coding

            },
            onScanSuccess: function (oEvent) {
                if (oEvent.getParameter("cancelled")) {
                    MessageToast.show("Scan cancelled", { duration: 1000 });
                } else {
                    if (oEvent.getParameter("text")) {
                        // oScanResultText.setText(oEvent.getParameter("text"));
                        oScanResultText.setValue(oEvent.getParameter("text"));
                    } else {
                        // oScanResultText.setText('');
                        oScanResultText.setValue('');
                    }
                }
            },

            onScanError: function (oEvent) {
                MessageToast.show("Scan failed: " + oEvent, { duration: 1000 });
            },

            onScanLiveupdate: function (oEvent) {
                // User can implement the validation about inputing value
            },

            onAfterRendering: function () {
                // Reset the scan result
                var oScanButton = Element.getElementById(prefixId + 'BarcodeScannerButton');
                if (oScanButton) {
                    $(oScanButton.getDomRef()).on("click", function () {
                        // oScanResultText.setText('');
                        oScanResultText.setValue('');
                    });
                }
            },


            // onUploadFileChange: function (oEvent) {
            //     //get file component
            //     this.oFileUploadComponent = oEvent.getParameters("items").item.getFileObject();
            //     if (this.oFileUploadComponent) {

            //         //call function to build buffer
            //         this._handleRawFile(this.oFileUploadComponent, this);
            //     }

            //     //get buffer
            //     this.uploadFileRaw; // this is raw file then you can do what ever you want

            //     var oDoc = this.uploadFileRaw
            //     var base64String = this._arrayBufferToBase64(oDoc)
            //     var DocName = this.uploadFileRaw.name
            //     var DocType = this.uploadFileRaw.mimetype
            // },


            onUploadChange: async function (oEvent) {

                //Data Table for Fileupload
                var uploadModel = new sap.ui.model.json.JSONModel({ uploadedFiles: [] });
                this.getView().setModel(uploadModel, "uploadModel");

                const aFiles = oEvent.getParameter("files");

                if (!this._aUploadedFiles) {
                    this._aUploadedFiles = [];
                }
                
                debugger;
                // Hilfsfunktion zum Lesen als Base64
                const readFileAsBase64 = function (file) {
                    return new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => {
                            const result = reader.result;
                            var index = aFileParams.length;
                            debugger;
                            if (!aFileParams[index]) aFileParams[index] = {};
                            aFileParams[index].base64 = result.split(",")[1]; // Nur Base64 extrahieren
                            aFileParams[index].name = file.name;
                            aFileParams[index].type = file.type;
                            // aFileParams[index + 1]. = 
                            resolve(base64);
                        };
                        reader.onerror = reject;
                        reader.readAsDataURL(file);

                        // //ungültige Formate abfangen
                        // if (file.type !== "image/png" ) {
                        //     debugger;
                        // }

                    });
                };

                debugger;
                // Alle Dateien verarbeiten

                for (let file of aFiles) {
                    debugger;


                    aProcessedFiles.push({
                        name: file.name,
                        size: Math.round(file.size / 1024) // Größe in KB
                    });

                    base64 = await readFileAsBase64(file);
                    doc_name = file.name;
                    doc_type = file.type;

                    var oModel = this.getView().getModel("uploadModel");

                    oModel.setProperty("/uploadedFiles", aProcessedFiles);

                    this._aUploadedFiles.unshift({
                        name: file.name,
                        type: file.type,
                        content: base64
                    });
                }

            },

            onFileRemove: function (oEvent) {
                debugger;
                var oItem = oEvent.getSource().getParent(); // ColumnListItem
                var oContext = oItem.getBindingContext("uploadModel");
                var sPath = oContext.getPath(); // z. B. "/uploadedFiles/2"

                var oModel = this.getView().getModel("uploadModel");
                var aFiles = oModel.getProperty("/uploadedFiles");

                // Index aus dem Pfad extrahieren
                var iIndex = parseInt(sPath.split("/")[2]);

                // Datei entfernen
                aFiles.splice(iIndex, 1);

                // Model aktualisieren
                oModel.setProperty("/uploadedFiles", aFiles);
            }

            // },

            // _readFileAsBase64: function (file) {
            //     return new Promise((resolve, reject) => {
            //         const reader = new FileReader();
            //         reader.onload = () => {
            //             const result = reader.result;
            //             const base64 = result.split(",")[1];
            //             resolve(base64);
            //         };
            //         reader.onerror = reject;
            //         reader.readAsDataURL(file);
            //     });
            // }


            // onUploadChange: function (oEvent) {
            //     debugger;
            //     var oFile = oEvent.getParameter("files")[0];

            //     var reader = new FileReader();
            //     reader.onload = function (evt) {
            //         base64 = evt.target.result.split(",")[1] + base64;

            //      }.bind(this);
            //     reader.readAsDataURL(oFile);


            //     // Send OData-Request to CREATE-Entity
            //      var oModel = this.getView().getModel();
            //     oModel.create("/ZD4P_C_PM_NOTIF", oDataRes, {
            //         success: function () {
            //             sap.m.MessageBox.success(ssuccess);
            //         },
            //         error: function (oError) {
            //             sap.m.MessageBox.error(sfailure);
            //         }
            //     });

            // },

            // _handleRawFile: function (oFile, oController) {
            //     //handle file data
            //     var oFileRaw = {
            //         name: oFile.name,
            //         mimetype: oFile.type,
            //         size: oFile.size,
            //         data: []
            //     };
            //     //reader
            //     var reader = new FileReader();
            //     reader.onload = function (e) {
            //         oFileRaw.data = e.target.result; //set buffer data
            //         oController.uploadFileRaw = oFileRaw;
            //     }.bind(oController);
            //     reader.readAsArrayBuffer(oFile);
            // },
            // _arrayBufferToBase64: function (buffer) {
            //     var binary = '';
            //     var bytes = new Uint8Array(buffer);
            //     var len = bytes.byteLength;
            //     for (var i = 0; i < len; i++) {
            //         binary += String.fromCharCode(bytes[i]);
            //     }
            //     return window.btoa(binary);
            // }
        });
    });
