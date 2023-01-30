/*******************************************************************************
 * Copyright (C) 2021-2022 UoM - University of Macedonia
 * 
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 * 
 * SPDX-License-Identifier: EPL-2.0
 ******************************************************************************/

 import { SmartclideTdReusabilityTheiaWidget } from './smartclide-td-reusability-theia-widget';
 import { MessageService } from '@theia/core';

 export class Security {

    //Analyze Security
	runprocessAnalyzeSecurity(messageService: MessageService){
        //Wait animation start
		(document.getElementById("waitAnimation") as HTMLElement).style.display = "block";

        //Get language
        //var language = (document.getElementById("indexSecurity") as HTMLSelectElement).value;

		//Post
		fetch(SmartclideTdReusabilityTheiaWidget.state.BackEndHost+
            '/security/analyze?url='+SmartclideTdReusabilityTheiaWidget.state.SecurityProjectURL
                , {
                method: 'post',
                headers: {
                    'Accept': '*/*',
                    'Access-Control-Allow-Origin': '*',
                    'Authorization': 'Bearer ' + SmartclideTdReusabilityTheiaWidget.state.stateKeycloakToken
                }
            })
        .then(res => res.json())
        .then((out) => {
            //var obj= JSON.parse(JSON.stringify(out));
            
            //remove previous
            SmartclideTdReusabilityTheiaWidget.stateSecurity.data=[];
            
            //parse response
            //toDo
        })
        .catch(err => { 
            (document.getElementById("indexSecurity") as HTMLElement).style.display = "none";
            messageService.info('Error: '+err);
            console.log('err: ', err);
        });
        
		//waiting animation stop
		(document.getElementById("waitAnimation") as HTMLElement).style.display = "none";
	}

 }