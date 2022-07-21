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

interface metrics{
	name: string;
	value: number;
}
interface issue{
	issueRule: string;
    issueName: string;
    issueSeverity: string;
    issueDebt: string;
    issueType: string;
    issueDirectory: string;
    issueStartLine: string;
    issueEndLine: string;
}
interface principalEnpointReport {
    method: string;
	metrics: metrics;
    issueList: [issue];
}

export class Principal {

	runprocessGetMetricsEndpoint(messageService: MessageService): void {
		if(SmartclideTdReusabilityTheiaWidget.state.PrincipalServiceURL!='' &&
					SmartclideTdReusabilityTheiaWidget.state.PrincipalProjectURL!='' &&
					SmartclideTdReusabilityTheiaWidget.state.PrincipalProjectToken!='' &&
					SmartclideTdReusabilityTheiaWidget.state.PrincipalSonarQubeProjectKey!=''){
			//remove previous
			var lengthData= SmartclideTdReusabilityTheiaWidget.statePrincipalEndpoints.length;
			for(let count=0; count<lengthData; count++){
				SmartclideTdReusabilityTheiaWidget.statePrincipalEndpoints.pop();
			}
			document.getElementById("endpointResultsList")!.innerHTML='';
			
			//get endpoints
			var fileNames = (document.getElementById("listEndpoints") as HTMLUListElement).getElementsByClassName('fileName');
			var endpointMethods = (document.getElementById("listEndpoints") as HTMLUListElement).getElementsByClassName('endpointMethod');
			for(let i=0; i<fileNames.length; i++){
				var fileNameValue = (fileNames[i] as HTMLInputElement).value;
				var endpointMethodValue = (endpointMethods[i] as HTMLInputElement).value;
				if(fileNameValue!='' && endpointMethodValue!=''){
					endpointMethodValue= endpointMethodValue.trim();
					SmartclideTdReusabilityTheiaWidget.statePrincipalEndpoints.push({fileName:fileNameValue, endpointMethod:endpointMethodValue});
				}
			}

			//start
			if(SmartclideTdReusabilityTheiaWidget.statePrincipalEndpoints.length>0 &&
						(document.getElementById("listManualEndpoints") as HTMLElement).style.display == "block"){
				messageService.info('Manual endpoint analysis');
				//waiting animation start
				(document.getElementById("waitAnimation") as HTMLElement).style.display = "block";

				var principalReportEndpoints: principalEnpointReport[] = [];
				var dataManual;
				dataManual={
					sonarQubeProjectKey: SmartclideTdReusabilityTheiaWidget.state.PrincipalSonarQubeProjectKey,
					gitUrl: SmartclideTdReusabilityTheiaWidget.state.PrincipalProjectURL,
					gitToken: SmartclideTdReusabilityTheiaWidget.state.PrincipalProjectToken,
					requestBodyEachEndpointList : SmartclideTdReusabilityTheiaWidget.statePrincipalEndpoints
				};
				(async () => {
					try {
						principalReportEndpoints = await Principal.postPrincipalManualEndpoints<principalEnpointReport[]>(dataManual);

						//waiting animation stop
						(document.getElementById("waitAnimation") as HTMLElement).style.display = "none";

						//Create Issues in frontend
						if(principalReportEndpoints.length>0){
							this.createIssuesFrontend(principalReportEndpoints);
						}
						else{
							console.log('err: Possible wrong method declaration');
							messageService.info('Possible wrong method declaration');
						}
					} catch(e) {
						(document.getElementById("waitAnimation") as HTMLElement).style.display = "none";
						console.log('err: ', e);
					}
				})()
			}
			else{
				console.log('endpoint analysis Spring / JAX-RS');
				messageService.info('endpoint analysis Spring / JAX-RS');

				//waiting animation start
				(document.getElementById("waitAnimation") as HTMLElement).style.display = "block";

				var principalReportEndpoints: principalEnpointReport[] = [];
				var dataManual;
				dataManual={
					sonarQubeProjectKey: SmartclideTdReusabilityTheiaWidget.state.PrincipalSonarQubeProjectKey,
					gitUrl: SmartclideTdReusabilityTheiaWidget.state.PrincipalProjectURL,
					gitToken: SmartclideTdReusabilityTheiaWidget.state.PrincipalProjectToken
				};
				(async () => {
					try {
						principalReportEndpoints = await Principal.postPrincipalEndpoints<principalEnpointReport[]>(dataManual);

						//waiting animation stop
						(document.getElementById("waitAnimation") as HTMLElement).style.display = "none";

						//Create Issues in frontend
						if(principalReportEndpoints.length>0){
							this.createIssuesFrontend(principalReportEndpoints);
						}
						else{
							console.log('err: Possible wrong method declaration');
							messageService.info('Possible wrong method declaration');
						}
					} catch(e) {
						console.log('catch');
						(document.getElementById("waitAnimation") as HTMLElement).style.display = "none";
						console.log('err: ', e);
					}
				})()
			}
		}
	}

	//Create Issues list in frontend
	private createIssuesFrontend(principalReportEndpoints: principalEnpointReport[]) {
		(document.getElementById('TdProjectResults') as HTMLElement).style.display = "none";

		var endpointList = document.getElementById("endpointResultsList")!;
		endpointList.style.display = "block";
		endpointList.style.paddingLeft = "10px";
		for (let i = 0; i < principalReportEndpoints.length; i++) {
			var endpointLi = document.createElement("li");
			var endpointInfoDiv = document.createElement("div");
			var endpointMethod = document.createElement("p");
			endpointMethod.style.marginBottom = "5px";
			endpointMethod.appendChild(document.createTextNode(principalReportEndpoints[i].method));
			endpointInfoDiv.appendChild(endpointMethod);
			var endpointTD = document.createElement("span");
			var td = principalReportEndpoints[i].metrics.value;
			var tdString = td + "min / " + td*0.5 + "€";
			if(td >= 60){
				td = principalReportEndpoints[i].metrics.value/60;
				tdString = Math.round( td * 10 ) / 10 + "h / " + td*30 + "€";
			}
			endpointTD.appendChild(document.createTextNode("TD: " + tdString));
			endpointInfoDiv.appendChild(endpointTD);
			var endpointCS = document.createElement("span");
			endpointCS.appendChild(document.createTextNode("Issues: " + principalReportEndpoints[i].issueList.length));
			endpointCS.style.marginLeft = "20px";
			endpointInfoDiv.appendChild(endpointCS);
			var endpointShowHide = document.createElement("button");
			endpointShowHide.style.float = "right";
			endpointShowHide.style.marginRight = "20px";
			var endpointShowHideText = document.createTextNode("More");
			endpointShowHide.appendChild(endpointShowHideText);
			
			endpointShowHide.addEventListener('click', (e:Event) => {
				var temp= (e.target as HTMLElement).parentElement?.parentElement?.getElementsByClassName("issuesListDiv")[0] as HTMLElement;
				if(temp.style.display=='none'){
					temp.style.display='block';
					(e.target as HTMLButtonElement).textContent='Less';
				}
				else if(temp.style.display=='block'){
					temp.style.display='none';
					(e.target as HTMLElement).textContent='More';
				}
			});
			endpointInfoDiv.appendChild(endpointShowHide);
			endpointLi.appendChild(endpointInfoDiv);

			var endpointIssuesDiv = document.createElement("div");
			endpointIssuesDiv.setAttribute("class", "issuesListDiv");
			endpointIssuesDiv.style.marginLeft = "20px";
			endpointIssuesDiv.style.display = "none";
			
			//crate HTMLElement for each issue
			for (let issue of principalReportEndpoints[i].issueList) {
				var severity = issue.issueSeverity;
				var message = issue.issueName;
				//var debt= i.debt;
				var re = /(.*)[:]/;
				var component = issue.issueDirectory.replace(re, "");
				var line = issue.issueStartLine;

				let divIssue = document.createElement("div");
				divIssue.className = 'divIssue';

				let nodeComponent = document.createElement("i");
				nodeComponent.appendChild(document.createTextNode(component+"\xa0\xa0\xa0L:"+ line));
				let nodeSeverity = document.createElement("span");
				nodeSeverity.appendChild(document.createTextNode(severity));
				let nodeMessage = document.createElement("p");
				nodeMessage.appendChild(document.createTextNode(message));

				divIssue.appendChild(nodeComponent);
				divIssue.appendChild(nodeSeverity);
				divIssue.appendChild(nodeMessage);
				endpointIssuesDiv.appendChild(divIssue);
			}
			endpointLi.appendChild(endpointIssuesDiv);
			endpointList.appendChild(endpointLi);
		}
	}

	static async postPrincipalManualEndpoints<T>(data: { sonarQubeProjectKey:string; gitUrl:string; gitToken:string; 
							requestBodyEachEndpointList:{fileName:string; endpointMethod:string}[];} ): Promise<T> {
		const response = await fetch(SmartclideTdReusabilityTheiaWidget.state.PrincipalServiceURL+
            '/analysis/endpoints', { method: 'post',
			headers: {
				'Accept': '*/*',
				'Authorization': 'Bearer ' + SmartclideTdReusabilityTheiaWidget.state.stateKeycloakToken,
				'Access-Control-Allow-Origin': '*',
				'Content-Type':  'application/json'
			},
			body: JSON.stringify(data)
		});
        const body = await response.json();
        console.log("Endpoint alalysis finished");
        return body;
    }

	static async postPrincipalEndpoints<T>(data: { sonarQubeProjectKey:string; gitUrl:string; gitToken:string; }): Promise<T>{
		const response = await fetch(SmartclideTdReusabilityTheiaWidget.state.PrincipalServiceURL+
            '/analysis/endpoints/auto', { method: 'post',
			headers: {
				'Accept': '*/*',
				'Authorization': 'Bearer ' + SmartclideTdReusabilityTheiaWidget.state.stateKeycloakToken,
				'Access-Control-Allow-Origin': '*',
				'Content-Type':  'application/json'
			},
			body: JSON.stringify(data)
		});
        const body = await response.json();
        console.log("Endpoint alalysis finished");
        return body;
	}
    
    //Get metrics for TD principal
    runprocessGetMetrics(messageService: MessageService): void {
		//if field has value
		if(SmartclideTdReusabilityTheiaWidget.state.PrincipalServiceURL!=''){
			console.log('url: '+ SmartclideTdReusabilityTheiaWidget.state.PrincipalServiceURL);
			//var temp= SmartclideTdReusabilityTheiaWidget.state.PrincipalProjectURL.replace('.git','').split('/');
			//var projectName= temp[temp.length-1];
			var projectName= SmartclideTdReusabilityTheiaWidget.state.PrincipalSonarQubeProjectKey;
			//GET measures TD and number of issues
			console.log("token: "+SmartclideTdReusabilityTheiaWidget.state.stateKeycloakToken);
			fetch(SmartclideTdReusabilityTheiaWidget.state.PrincipalServiceURL+'/analysis/'+ projectName +'/measures', 
				{
					headers: {
						'Accept': '*/*',
						'Access-Control-Allow-Origin': "*",
						'Authorization': 'Bearer ' + SmartclideTdReusabilityTheiaWidget.state.stateKeycloakToken
					}
				})
				.then(res => res.json())
				.then((out) => {
					var obj= JSON.parse(JSON.stringify(out));
					var td=0;
					var issues=0;
					//get first metric
					if(obj[0].name == 'sqale_index')
						td= obj[0].value/60;
					else
						issues= obj[0].value;
					
					//get second metric
					if(obj[1].name == 'code_smells')
						issues= obj[1].value;
					else
						td= obj[1].value/60;
					
					console.log('td: '+td);
					console.log('issues: '+issues);
					
					//show TD and issues Number got from service
					(document.getElementById('endpointResultsList') as HTMLElement).innerHTML= "";
					(document.getElementById('TdProjectResults') as HTMLElement).style.display = "block";
					(document.getElementById('TDIndex') as HTMLElement).innerHTML = "TD Principal: "+ Math.round( td * 10 ) / 10 + "h / " + td*30 + "€";
					(document.getElementById('issuesNumber') as HTMLElement).innerHTML = "Issues: "+issues;
					
					//get Issues
					//var pages= Math.floor((issues-1)/500) + 1;
					//if(issues<10000){
					//	console.log(pages);
					//	for(let i=1; i<=pages; i++){
							this.runprocessGetIssues();//i);
					//	}
					//}
				})
				.catch(err => { 
					console.log('err: ', err);
					messageService.info('Error: '+err);
			});
		}
		else{
			messageService.info('Provide SonarQube URL');
			(document.getElementById("TDIndex") as HTMLElement).style.display = "none";
			(document.getElementById("issuesNumber") as HTMLElement).style.display = "none";
		}
	}

	//Get Issues for given page
	runprocessGetIssues():void{ //page: number): void {
		//console.log('page:::'+page);
		//var temp= SmartclideTdReusabilityTheiaWidget.state.PrincipalProjectURL.replace('.git','').split('/');
		//var projectName= temp[temp.length-1];
		var projectName= SmartclideTdReusabilityTheiaWidget.state.PrincipalSonarQubeProjectKey;

		//GET
		fetch(SmartclideTdReusabilityTheiaWidget.state.PrincipalServiceURL+'/analysis/'+ projectName +'/issues', 
			{
				mode: 'cors',
				headers: {
					'Authorization': 'Bearer ' + SmartclideTdReusabilityTheiaWidget.state.stateKeycloakToken
				}
			})
			.then(res => res.json())
			.then((out) => {
				var obj= JSON.parse(JSON.stringify(out));
				//console.log(obj.p);
				
				(document.getElementById('issues') as HTMLElement).innerHTML= "";
				
				//crate HTMLElement for each issue
				for(let i of obj){
					var severity= i.issueSeverity;
					var message= i.issueName;
					//var debt= i.debt;
					var re = /(.*)[:]/;
					var component= i.issueDirectory.replace(re, "");
					var line = i.issueStartLine;
					
					let issuesDiv = document.getElementById('issues')!
					let divIssue = document.createElement("div");
					divIssue.className = 'divIssue';
					
					let nodeComponent = document.createElement("i");
					nodeComponent.appendChild(document.createTextNode(component+"\xa0\xa0\xa0L:"+line));
					let nodeSeverity = document.createElement("span");
					nodeSeverity.appendChild(document.createTextNode(severity));
					let nodeMessage = document.createElement("p");
					nodeMessage.appendChild(document.createTextNode(message));
					
					divIssue.appendChild(nodeComponent);
					divIssue.appendChild(nodeSeverity);
					divIssue.appendChild(nodeMessage);
					issuesDiv.appendChild(divIssue);
				}
			})
			.catch(err => { 
				console.log('err: ', err);
		});
	}

	//Make new analysis
	runprocessNewAnalysis(messageService: MessageService): void {
		if(SmartclideTdReusabilityTheiaWidget.state.PrincipalServiceURL!='' &&
					SmartclideTdReusabilityTheiaWidget.state.PrincipalProjectURL!=''){
			messageService.info('Starting new analysis');
			//waiting animation start
			(document.getElementById("waitAnimation") as HTMLElement).style.display = "block";

			var dataNewAnalysis;
			dataNewAnalysis={
				gitURL: SmartclideTdReusabilityTheiaWidget.state.PrincipalProjectURL
			};
			(async () => {
				try {
					var principalEnd = await Principal.postPrincipalNewAnalysis(dataNewAnalysis);

					//waiting animation stop
					(document.getElementById("waitAnimation") as HTMLElement).style.display = "none";

					if(principalEnd==200){
						console.log("Analysis finished successful");
						messageService.info("Analysis finished successful");
					}
					else{
						console.log("New analysis problem");
						messageService.info("New analysis problem");
					}
				} catch(e) {
					(document.getElementById("waitAnimation") as HTMLElement).style.display = "none";
					console.log('err: ', e);
				}
			})()
		}
	}

	static async postPrincipalNewAnalysis(data: { gitURL:string; } ): Promise<number> {
		const response = await fetch(SmartclideTdReusabilityTheiaWidget.state.PrincipalServiceURL+
				'/analysis', { method: 'post',
			headers: {
				'Accept': '*/*',
				'Authorization': 'Bearer ' + SmartclideTdReusabilityTheiaWidget.state.stateKeycloakToken,
				'Access-Control-Allow-Origin': '*',
				'Content-Type':  'application/json'
			}, body: JSON.stringify(data)
		});
		var status = await response.status;
		console.log("Alalysis finished");
		return status;
	}
}
